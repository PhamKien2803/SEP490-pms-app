import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Button, Text, Card, Icon } from "@rneui/themed";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { teacherApis } from "../../../services/apiServices";
import {
  IActivity,
  IGetTimetableTeacherResponse,
} from "../../../types/teacher";
import TimetableDayView from "./TimetableDayView";
import Toast from "react-native-toast-message";

dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const DAY_COLUMN_WIDTH = 130;
const TIME_COLUMN_WIDTH = 70;
const MIN_CELL_HEIGHT = 60;
const DROPDOWN_MAX_HEIGHT = 200;
const DROPDOWN_WIDTH = 120;

const formatMinutesToTime = (minutes?: number | null): string => {
  if (minutes == null || isNaN(minutes)) return "--:--";
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const getActivityProps = (activity: IActivity) => {
  let color: string;
  let iconName: string;
  let typeText: string;

  if (activity.type === "Cố định") {
    color = "#007AFF";
    iconName = "lock";
    typeText = "Cố định";
  } else if (activity.type === "Bình thường") {
    color = "#28A745";
    iconName = "edit";
    typeText = "Bình thường";
  } else if (activity.type === "Sự kiện") {
    color = "#FFC107";
    iconName = "lightbulb-outline";
    typeText = "Sự kiện";
  } else {
    color = "#6C757D";
    iconName = "calendar";
    typeText = "";
  }
  return {
    color,
    iconName: activity.type === "Sự kiện" ? "lightbulb-outline" : iconName,
    iconType: activity.type === "Sự kiện" ? "material" : "antdesign",
    typeText,
  };
};

interface IScheduleRow {
  key: string;
  time: string;
  [dataIndex: string]: IActivity | null | string;
}

interface DayData {
  _id: string;
  date: string;
  dayName: string;
  activities: IActivity[];
}

const CustomPicker: React.FC<{
  selectedValue: any;
  onValueChange: (value: any) => void;
  items: { label: string; value: any }[];
  placeholder: string;
}> = ({ selectedValue, onValueChange, items, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const pickerRef = useRef<View>(null);

  const selectedLabel =
    items.find((item) => item.value === selectedValue)?.label || placeholder;

  const handleSelect = (value: any) => {
    onValueChange(value);
    setIsOpen(false);
  };

  const measureButton = () => {
    if (pickerRef.current) {
      pickerRef.current.measureInWindow((x, y, width, height) => {
        setButtonLayout({ x, y, width, height });
        setIsOpen(true);
      });
    }
  };

  const dropdownX = buttonLayout.x;
  const dropdownY = buttonLayout.y + buttonLayout.height + 2;

  return (
    <View style={newStyles.customPickerContainer}>
      <TouchableOpacity
        ref={pickerRef}
        style={newStyles.pickerButton}
        onPress={measureButton}
      >
        <Text style={newStyles.pickerButtonText} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Icon
          name={isOpen ? "chevron-up" : "chevron-down"}
          type="font-awesome"
          size={12}
          color="#6c757d"
        />
      </TouchableOpacity>

      {/* Sử dụng Modal để thoát khỏi ScrollView parent, khắc phục lỗi cuộn trên Android */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={newStyles.modalBackground}
          onPress={() => setIsOpen(false)}
          activeOpacity={1} // Ngăn chặn chạm vào các thành phần bên dưới
        >
          <View
            style={[
              newStyles.dropdownOverlay,
              {
                top: dropdownY,
                left: dropdownX,
                width: DROPDOWN_WIDTH,
                maxHeight: DROPDOWN_MAX_HEIGHT,
              },
            ]}
          >
            {/* ScrollView hoạt động tốt vì nằm trong Modal */}
            <ScrollView style={newStyles.dropdownScroll}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    newStyles.dropdownItem,
                    item.value === selectedValue &&
                      newStyles.dropdownItemSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      newStyles.dropdownItemText,
                      item.value === selectedValue &&
                        newStyles.dropdownItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const TimeTable = () => {
  const user = useCurrentUser();
  const teacherId = user?.staff;
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [schoolYears, setSchoolYears] = useState<
    { schoolYear: string; startDate: string }[]
  >([]);
  const [timetableData, setTimetableData] =
    useState<IGetTimetableTeacherResponse | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    teacherApis
      .getSchoolYearList({ page: 0, limit: 10 })
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix()
        );
        setSchoolYears(sorted);
        if (sorted?.length > 0) {
          setSelectedYear(sorted[0].schoolYear);
        }
      })
      .catch((err) => console.error("Error fetching school years:", err));
  }, []);

  const totalWeeksInMonth = useMemo(() => {
    if (!selectedYear || !schoolYears.length || !currentMonth) return [];

    const selectedSchoolYearData = schoolYears.find(
      (y) => y.schoolYear === selectedYear
    );
    if (!selectedSchoolYearData || !selectedSchoolYearData.startDate) return [];

    const schoolStartDate = dayjs(selectedSchoolYearData.startDate);
    const schoolStartMonth = schoolStartDate.month() + 1;
    const schoolStartYear = schoolStartDate.year();

    const year =
      currentMonth >= schoolStartMonth ? schoolStartYear : schoolStartYear + 1;

    const firstDayOfMonth = dayjs(`${year}-${currentMonth}-01`);
    const lastDayOfMonth = firstDayOfMonth.endOf("month");

    let cursor;
    const dayOfWeek = firstDayOfMonth.day();
    // Monday is 1, Sunday is 0. If Sunday, go back 6 days to Monday
    if (dayOfWeek === 0) {
      cursor = firstDayOfMonth.subtract(6, "day");
    } else {
      // Go back dayOfWeek - 1 days to Monday
      cursor = firstDayOfMonth.subtract(dayOfWeek - 1, "day");
    }

    const weeks: { start: dayjs.Dayjs; end: dayjs.Dayjs }[] = [];

    // Lặp qua các tuần, bắt đầu từ tuần chứa ngày đầu tháng
    while (cursor.isSameOrBefore(lastDayOfMonth.endOf("week"), "day")) {
      const weekStart = cursor.startOf("day");
      const weekEnd = cursor.add(6, "day").endOf("day");
      // Chỉ thêm tuần nếu nó có chứa ít nhất một ngày của tháng
      if (weekStart.isSameOrBefore(lastDayOfMonth, "day")) {
        weeks.push({ start: weekStart, end: weekEnd });
      }
      cursor = cursor.add(7, "day");
    }

    return weeks;
  }, [currentMonth, selectedYear, schoolYears]);

  useEffect(() => {
    if (!teacherId || !selectedYear) {
      // Nếu chưa có teacherId hoặc selectedYear, không fetch
      setTimetableData(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await teacherApis.getTimetableTeacher({
          teacherId,
          schoolYear: selectedYear,
          month: String(currentMonth),
        });
        setTimetableData(res);

        const today = dayjs();
        const selectedSchoolYearData = schoolYears.find(
          (y) => y.schoolYear === selectedYear
        );

        // Đảm bảo có dữ liệu năm học và ngày bắt đầu để tính toán
        if (!selectedSchoolYearData || !selectedSchoolYearData.startDate) {
          setCurrentWeek(1);
          setLoading(false);
          return;
        }

        const schoolStartDate = dayjs(selectedSchoolYearData.startDate);
        const schoolStartMonth = schoolStartDate.month() + 1;
        const schoolStartYear = schoolStartDate.year();

        // Xác định năm lịch của tháng hiện tại
        const year =
          currentMonth >= schoolStartMonth
            ? schoolStartYear
            : schoolStartYear + 1;

        // Cập nhật currentWeek về tuần hiện tại nếu đang xem tháng và năm hiện tại
        if (
          totalWeeksInMonth.length > 0 &&
          currentMonth === today.month() + 1 &&
          year === today.year()
        ) {
          const index = totalWeeksInMonth.findIndex((week) =>
            today.isBetween(week.start, week.end, "day", "[]")
          );
          // Set tuần hiện tại, hoặc tuần đầu tiên nếu không tìm thấy
          setCurrentWeek(index >= 0 ? index + 1 : 1);
        } else {
          // Nếu không phải tháng hiện tại, luôn về tuần 1
          setCurrentWeek(1);
        }
      } catch (err) {
        console.error(err);
        setTimetableData(null);
        // Alert.alert("Lỗi", "Không thể tải thời khóa biểu.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [
    teacherId,
    selectedYear,
    currentMonth,
    schoolYears,
    totalWeeksInMonth.length,
  ]);
  // Phụ thuộc vào totalWeeksInMonth.length thay vì toàn bộ object

  useEffect(() => {
    setSelectedDayIndex(0);
  }, [currentWeek, currentMonth, selectedYear]);

  const handleWeekChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    } else if (direction === "next") {
      const nextWeek = currentWeek + 1;
      if (nextWeek <= totalWeeksInMonth.length) {
        setCurrentWeek(nextWeek);
      } else {
        Toast.show({
          type: "info",
          text1: "Thông báo",
          text2: "Đã hết các tuần trong tháng này. Vui lòng chọn tháng khác.",
        });
      }
    }
  };

  const getDaysOfWeek: DayData[] = useMemo(() => {
    if (
      !timetableData ||
      !timetableData.scheduleDays?.length ||
      currentWeek > totalWeeksInMonth.length ||
      currentWeek < 1
    )
      return [];

    // Kiểm tra an toàn cho phần tử trong mảng totalWeeksInMonth
    const weekIndex = currentWeek - 1;
    const weekData = totalWeeksInMonth[weekIndex];

    if (!weekData || !weekData.start || !weekData.end) {
      return [];
    }

    const { start, end } = weekData;

    return timetableData.scheduleDays.filter((day) =>
      dayjs(day.date).isBetween(start, end, "day", "[]")
    );
  }, [timetableData, currentWeek, totalWeeksInMonth]);

  const selectedDayData: DayData | undefined = useMemo(() => {
    if (selectedDayIndex < 0 || selectedDayIndex >= getDaysOfWeek?.length) {
      return undefined;
    }
    return getDaysOfWeek[selectedDayIndex];
  }, [getDaysOfWeek, selectedDayIndex]);
  const handleDayChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedDayIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else {
      setSelectedDayIndex((prev) =>
        prev < getDaysOfWeek?.length - 1 ? prev + 1 : prev
      );
    }
  };

  const uniqueStartTimes = useMemo(() => {
    if (!getDaysOfWeek?.length) return [];
    const all = getDaysOfWeek.flatMap((d) => d.activities);
    const times = [...new Set(all.map((a) => a.startTime))];
    times.sort((a, b) => (a || 0) - (b || 0));
    return times;
  }, [getDaysOfWeek]);

  const dataSource: IScheduleRow[] = useMemo(() => {
    if (!getDaysOfWeek?.length || uniqueStartTimes?.length === 0) return [];

    return uniqueStartTimes.map((startTime) => {
      const time = formatMinutesToTime(startTime);
      const row: IScheduleRow = { key: time, time };

      getDaysOfWeek.forEach((day, index) => {
        const activity = day.activities.find((a) => a.startTime === startTime);
        row[`day_${index}`] = activity || null;
      });
      return row;
    });
  }, [getDaysOfWeek, uniqueStartTimes]);

  const classInfo = timetableData
    ? `${timetableData.className || ""} (${timetableData.schoolYear || ""})`
    : "";

  const renderTimeColumn = (isHeader: boolean) => (
    <View style={newStyles.fixedCol}>
      {isHeader ? (
        <View style={[newStyles.headerCell, newStyles.fixedHeaderCell]}>
          <Text style={newStyles.headerTextCol}>Giờ</Text>
        </View>
      ) : (
        dataSource.map((row) => (
          <View key={(row as IScheduleRow).key} style={[newStyles.timeCell]}>
            <Text style={newStyles.timeCellText}>
              {(row as IScheduleRow).time}
            </Text>
          </View>
        ))
      )}
    </View>
  );

  const renderHeaderRow = () => (
    <View
      style={[
        newStyles.scrollableHeaderRow,
        { width: getDaysOfWeek?.length * DAY_COLUMN_WIDTH },
      ]}
    >
      {getDaysOfWeek.map((day, dayIndex) => {
        const isToday = dayjs(day.date).isSame(dayjs(), "day");
        return (
          <View
            key={day._id}
            style={[
              newStyles.headerCell,
              { width: DAY_COLUMN_WIDTH },
              isToday && newStyles.todayHeader,
            ]}
          >
            <Text
              style={[
                newStyles.headerTextCol,
                isToday && newStyles.todayHeaderText,
              ]}
              numberOfLines={1}
            >
              {day.dayName.split(" ")[1] || day.dayName}
            </Text>
            <Text
              style={[newStyles.dateText, isToday && newStyles.todayDateText]}
            >
              {dayjs(day.date).format("DD/MM")}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderDataRows = () => (
    <View style={{ width: getDaysOfWeek?.length * DAY_COLUMN_WIDTH }}>
      {dataSource.map((row, rowIndex) => (
        <View key={row.key} style={newStyles.dataRow}>
          {getDaysOfWeek.map((day, dayIndex) => {
            const activity = row[`day_${dayIndex}`] as IActivity | null;

            if (!activity) {
              return (
                <View
                  key={dayIndex}
                  style={[newStyles.emptyCell, { width: DAY_COLUMN_WIDTH }]}
                />
              );
            }

            const props = getActivityProps(activity);

            return (
              <View
                key={dayIndex}
                style={[
                  newStyles.activityCell,
                  { width: DAY_COLUMN_WIDTH, backgroundColor: "#fff" },
                ]}
              >
                <TouchableOpacity
                  style={[
                    newStyles.tag,
                    {
                      borderColor: props.color,
                      backgroundColor: props.color + "1A",
                    },
                  ]}
                  onPress={() => {
                    if (activity.activityName) {
                      Alert.alert(
                        activity.activityName,
                        `Thời gian: ${formatMinutesToTime(
                          activity.startTime
                        )} - ${formatMinutesToTime(activity.endTime)}\nLoại: ${
                          props.typeText
                        }\n\n${activity.tittle || "Không có chi tiết."}`,
                        [{ text: "Đóng" }]
                      );
                    }
                  }}
                >
                  <Icon
                    name={props.iconName}
                    type={props.iconType}
                    color={props.color}
                    size={14}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[newStyles.tagText, { color: props.color }]}
                    numberOfLines={1}
                  >
                    {activity.activityName || "Trống"}
                  </Text>
                </TouchableOpacity>

                {(activity.type === "Bình thường" ||
                  activity.type === "Sự kiện") &&
                  activity.tittle && (
                    <View style={newStyles.detailsContainer}>
                      {activity.tittle
                        .split("\n")
                        .slice(0, 2)
                        .map((line, i) => (
                          <Text
                            key={i}
                            style={newStyles.bulletItemRN}
                            numberOfLines={1}
                          >
                            • {line.trim()}
                          </Text>
                        ))}
                      {activity.tittle.split("\n")?.length > 2 && (
                        <Text style={newStyles.moreText}>...</Text>
                      )}
                    </View>
                  )}
                {activity.endTime !== activity.startTime && (
                  <Text style={newStyles.endTimeText}>
                    - {formatMinutesToTime(activity.endTime)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <View style={newStyles.mainContainer}>
      <Toast />
      <ScrollView style={{ flex: 1 }}>
        <Card containerStyle={newStyles.cardStyle}>
          <View style={newStyles.headerContainer}>
            <Text style={newStyles.titleText}>⏰ Thời khóa biểu giáo viên</Text>
            {classInfo && (
              <Text style={newStyles.subtitleText}>{classInfo}</Text>
            )}
          </View>

          <View style={newStyles.pickerGroupNew}>
            <CustomPicker
              selectedValue={selectedYear}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
              items={schoolYears.map((y) => ({
                label: y.schoolYear,
                value: y.schoolYear,
              }))}
              placeholder="Chọn Năm"
            />
            <CustomPicker
              selectedValue={currentMonth}
              onValueChange={(itemValue) => {
                setCurrentMonth(itemValue);
                setCurrentWeek(1);
              }}
              items={Array.from({ length: 12 }, (_, i) => ({
                label: `Tháng ${i + 1}`,
                value: i + 1,
              }))}
              placeholder="Chọn Tháng"
            />
          </View>

          <View style={newStyles.controlsRowNew}>
            <View style={newStyles.segmentControl}>
              <TouchableOpacity
                onPress={() => setViewMode("week")}
                style={[
                  newStyles.segmentButton,
                  viewMode === "week" && newStyles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    newStyles.segmentTitle,
                    viewMode === "week" && newStyles.segmentActiveTitle,
                  ]}
                >
                  Tuần
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setViewMode("day");
                  setSelectedDayIndex(0);
                }}
                style={[
                  newStyles.segmentButton,
                  viewMode === "day" && newStyles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    newStyles.segmentTitle,
                    viewMode === "day" && newStyles.segmentActiveTitle,
                  ]}
                >
                  Ngày
                </Text>
              </TouchableOpacity>
            </View>

            {viewMode === "week" ? (
              <View style={newStyles.weekNavRow}>
                <Button
                  icon={
                    <Icon
                      name="chevron-left"
                      type="font-awesome"
                      color="#007AFF"
                      size={18}
                    />
                  }
                  onPress={() => handleWeekChange("prev")}
                  disabled={currentWeek === 1}
                  buttonStyle={newStyles.navButtonRN}
                />
                <View style={newStyles.weekDisplay}>
                  <Text style={newStyles.weekDisplayText}>
                    {`Tuần ${currentWeek}`}
                  </Text>
                </View>
                <Button
                  icon={
                    <Icon
                      name="chevron-right"
                      type="font-awesome"
                      color="#007AFF"
                      size={18}
                    />
                  }
                  onPress={() => handleWeekChange("next")}
                  disabled={currentWeek >= totalWeeksInMonth.length}
                  buttonStyle={newStyles.navButtonRN}
                />
              </View>
            ) : (
              <View style={newStyles.weekNavRow}>
                <Button
                  icon={
                    <Icon
                      name="chevron-left"
                      type="font-awesome"
                      color="#007AFF"
                      size={18}
                    />
                  }
                  onPress={() => handleDayChange("prev")}
                  disabled={selectedDayIndex === 0}
                  buttonStyle={newStyles.navButtonRN}
                />
                <View style={newStyles.weekDisplay}>
                  <Text style={newStyles.weekDisplayText}>
                    {selectedDayData?.dayName || "Ngày"}
                  </Text>
                </View>
                <Button
                  icon={
                    <Icon
                      name="chevron-right"
                      type="font-awesome"
                      color="#007AFF"
                      size={18}
                    />
                  }
                  onPress={() => handleDayChange("next")}
                  disabled={selectedDayIndex >= getDaysOfWeek?.length - 1}
                  buttonStyle={newStyles.navButtonRN}
                />
              </View>
            )}
          </View>

          <View style={newStyles.contentArea}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#007AFF"
                style={{ marginVertical: 50 }}
              />
            ) : !getDaysOfWeek?.length && !loading ? (
              <View style={newStyles.emptyContainer}>
                <Icon
                  name="calendar-times-o"
                  type="font-awesome"
                  color="#909090"
                  size={50}
                />
                <Text style={newStyles.emptyText}>
                  Không có dữ liệu thời khóa biểu
                </Text>
              </View>
            ) : viewMode === "week" ? (
              <View style={newStyles.weekTableWrapper}>
                <View style={newStyles.tableHeaderRow}>
                  {renderTimeColumn(true)}

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flex: 1 }}
                  >
                    {renderHeaderRow()}
                  </ScrollView>
                </View>

                <View style={newStyles.tableDataContainer}>
                  {renderTimeColumn(false)}

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    style={{ flex: 1 }}
                  >
                    {renderDataRows()}
                  </ScrollView>
                </View>
              </View>
            ) : (
              <TimetableDayView
                getDaysOfWeek={selectedDayData ? [selectedDayData] : []}
              />
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const newStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  cardStyle: {
    margin: 10,
    borderRadius: 12,
    padding: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 15,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  subtitleText: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },

  pickerGroupNew: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
    zIndex: 10,
  },
  controlsRowNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    zIndex: 4,
  },
  weekRangeDisplay: {
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  weekRangeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  customPickerContainer: {
    width: DROPDOWN_WIDTH,
    zIndex: 5,
  },
  pickerButton: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  pickerButtonText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
    marginRight: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  dropdownOverlay: {
    position: "absolute",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 30,
  },
  dropdownScroll: {
    paddingVertical: 5,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dropdownItemSelected: {
    backgroundColor: "#e6f0ff",
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#333",
  },
  dropdownItemTextSelected: {
    fontWeight: "600",
    color: "#007AFF",
  },

  segmentControl: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 6,
    overflow: "hidden",
    height: 38,
  },
  segmentButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    height: "100%",
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#007AFF",
  },
  segmentTitle: {
    color: "#007AFF",
    fontSize: 13,
    fontWeight: "600",
  },
  segmentActiveTitle: {
    color: "#fff",
  },

  weekNavRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    overflow: "hidden",
    height: 38,
    width: 130,
  },
  navButtonRN: {
    backgroundColor: "transparent",
    paddingHorizontal: 5,
    height: "100%",
  },
  weekDisplay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  weekDisplayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  contentArea: {
    minHeight: 250,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    color: "#909090",
  },

  weekTableWrapper: {
    minWidth: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#d9d9d9",
    backgroundColor: "#f5f5f5",
  },
  tableDataContainer: {
    flexDirection: "row",
    flex: 1,
  },
  dataRow: {
    flexDirection: "row",
  },
  scrollableHeaderRow: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderColor: "#d9d9d9",
  },

  fixedCol: {
    width: TIME_COLUMN_WIDTH,
    backgroundColor: "#f5f5f5",
    zIndex: 10,
    borderRightWidth: 1,
    borderColor: "#d9d9d9",
  },
  fixedHeaderCell: {
    height: MIN_CELL_HEIGHT,
    borderRightWidth: 0,
    width: TIME_COLUMN_WIDTH,
  },
  timeCell: {
    width: TIME_COLUMN_WIDTH,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 10,
    minHeight: MIN_CELL_HEIGHT,
  },
  timeCellText: {
    fontWeight: "600",
    fontSize: 12,
    color: "#333",
  },

  headerCell: {
    height: MIN_CELL_HEIGHT,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 5,
    paddingVertical: 8,
    justifyContent: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    alignItems: "center",
  },
  headerTextCol: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#333",
  },
  dateText: {
    fontSize: 11,
    color: "#6c757d",
    marginTop: 2,
  },
  todayHeader: {
    backgroundColor: "#007AFF10",
  },
  todayHeaderText: {
    color: "#007AFF",
  },
  todayDateText: {
    color: "#007AFF",
    fontWeight: "600",
  },

  activityCell: {
    padding: 8,
    justifyContent: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    minHeight: MIN_CELL_HEIGHT,
  },
  emptyCell: {
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    minHeight: MIN_CELL_HEIGHT,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    marginVertical: 2,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsContainer: {
    alignSelf: "flex-start",
    marginTop: 2,
    width: "100%",
  },
  bulletItemRN: {
    fontSize: 11,
    color: "#6c757d",
    lineHeight: 16,
  },
  moreText: {
    fontSize: 11,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 2,
  },
  endTimeText: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
});

export default TimeTable;
