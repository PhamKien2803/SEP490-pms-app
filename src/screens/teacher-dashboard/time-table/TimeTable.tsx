import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';
import { Button, Text, Card, Icon } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { teacherApis } from '../../../services/apiServices';
import { IActivity, IGetTimetableTeacherResponse } from '../../../types/teacher';
import TimetableDayView from './TimetableDayView';
import Toast from 'react-native-toast-message';

dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const DAY_COLUMN_WIDTH = 130; 
const TIME_COLUMN_WIDTH = 70; 
const MIN_CELL_HEIGHT = 60; 

const formatMinutesToTime = (minutes?: number | null): string => {
    if (minutes == null || isNaN(minutes)) return '--:--';
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const getActivityProps = (activity: IActivity) => {
    let color: string;
    let iconName: string;
    let typeText: string;

    if (activity.type === 'Cố định') {
        color = '#007AFF'; 
        iconName = 'lock';
        typeText = 'Cố định';
    } else if (activity.type === 'Bình thường') {
        color = '#28A745'; 
        iconName = 'edit';
        typeText = 'Bình thường';
    } else if (activity.type === 'Sự kiện') {
        color = '#FFC107'; 
        iconName = 'lightbulb-outline';
        typeText = 'Sự kiện';
    } else {
        color = '#6C757D'; 
        iconName = 'calendar';
        typeText = '';
    }
    return { color, iconName, typeText };
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

// Component CustomPicker
const CustomPicker: React.FC<{
    selectedValue: any;
    onValueChange: (value: any) => void;
    items: { label: string; value: any }[];
    placeholder: string;
}> = ({ selectedValue, onValueChange, items, placeholder }) => {

    const selectedLabel = items.find(item => item.value === selectedValue)?.label || placeholder;

    return (
        <View style={newStyles.pickerWrapper}>
            {Platform.OS === 'ios' && (
                <View style={newStyles.pickerDisplayOverlay}>
                    <Text style={newStyles.pickerDisplayText} numberOfLines={1}>{selectedLabel}</Text>
                    <Icon name="chevron-down" type="font-awesome" size={12} color="#6c757d" />
                </View>
            )}

            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                style={[newStyles.picker, Platform.OS === 'android' && newStyles.androidPicker]} 
                itemStyle={newStyles.pickerItemStyle}
                mode="dropdown" 
                pointerEvents={Platform.OS === 'ios' ? 'box-only' : 'auto'} 
            >
                {items.map((item) => (
                    <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
            </Picker>
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
    const [schoolYears, setSchoolYears] = useState<{ schoolYear: string, startDate: string }[]>([]);
    const [timetableData, setTimetableData] = useState<IGetTimetableTeacherResponse | null>(null);
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

<<<<<<< Updated upstream
    useEffect(() => {
        // Mock data fetching or actual API call for school years
        teacherApis.getSchoolYearList({ page: 0, limit: 10 }).then((res) => {
            const sorted = res.data.sort((a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix());
            setSchoolYears(sorted);
            if (sorted.length > 0) setSelectedYear(sorted[0].schoolYear);
        }).catch(err => console.error("Error fetching school years:", err));
    }, []);
=======
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
>>>>>>> Stashed changes

    const totalWeeksInMonth = useMemo(() => {
        if (!selectedYear || !schoolYears.length || !currentMonth) return [];

<<<<<<< Updated upstream
        const selectedSchoolYearData = schoolYears.find(y => y.schoolYear === selectedYear);
        if (!selectedSchoolYearData) return [];

        const schoolStartDate = dayjs(selectedSchoolYearData.startDate);
        const schoolStartMonth = schoolStartDate.month() + 1;
        const schoolStartYear = schoolStartDate.year();

        const year = currentMonth >= schoolStartMonth
            ? schoolStartYear
            : schoolStartYear + 1;

        const firstDayOfMonth = dayjs(`${year}-${currentMonth}-01`);
        const lastDayOfMonth = firstDayOfMonth.endOf('month');

        let cursor;
        const dayOfWeek = firstDayOfMonth.day(); 
        if (dayOfWeek === 0) { // Sunday is 0, start week on Monday
            cursor = firstDayOfMonth.subtract(6, 'day');
        } else { // Monday is 1, subtract dayOfWeek - 1
            cursor = firstDayOfMonth.subtract(dayOfWeek - 1, 'day');
        }
        
        const weeks: { start: dayjs.Dayjs; end: dayjs.Dayjs }[] = [];

        while (cursor.isSameOrBefore(lastDayOfMonth.endOf('week'), 'day')) {
            const weekStart = cursor.startOf('day');
            const weekEnd = cursor.add(6, 'day').endOf('day');
            if (weekStart.isSameOrBefore(lastDayOfMonth, 'day')) {
                 weeks.push({ start: weekStart, end: weekEnd });
=======
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
        Alert.alert("Lỗi", "Không thể tải thời khóa biểu.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [teacherId, selectedYear, currentMonth, schoolYears, totalWeeksInMonth.length]);
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
>>>>>>> Stashed changes
            }
            cursor = cursor.add(7, 'day');
        }
        
        return weeks;
    }, [currentMonth, selectedYear, schoolYears]);


    useEffect(() => {
        if (!teacherId || !selectedYear) return;
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await teacherApis.getTimetableTeacher({
                    teacherId,
                    schoolYear: selectedYear,
                    month: String(currentMonth),
                });
                setTimetableData(res);

<<<<<<< Updated upstream
                const today = dayjs();
                const selectedSchoolYearData = schoolYears.find(y => y.schoolYear === selectedYear);
                if (!selectedSchoolYearData) {
                    setCurrentWeek(1);
                    return;
                }
                const schoolStartDate = dayjs(selectedSchoolYearData.startDate);
                const schoolStartMonth = schoolStartDate.month() + 1;
                const schoolStartYear = schoolStartDate.year();
                const year = currentMonth >= schoolStartMonth ? schoolStartYear : schoolStartYear + 1;

                if (totalWeeksInMonth.length > 0 && currentMonth === today.month() + 1 && year === today.year()) {
                    const index = totalWeeksInMonth.findIndex(
                        (week) => today.isBetween(week.start, week.end, 'day', '[]')
                    );
                    setCurrentWeek(index >= 0 ? index + 1 : 1);
                } else {
                    setCurrentWeek(1);
                }

            } catch (err) {
                console.error(err);
                setTimetableData(null);
                Alert.alert("Lỗi", "Không thể tải thời khóa biểu.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [teacherId, selectedYear, currentMonth, schoolYears, totalWeeksInMonth]); 

    const handleWeekChange = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentWeek > 1) {
            setCurrentWeek(currentWeek - 1);
        } else if (direction === 'next') {
            const nextWeek = currentWeek + 1;
            if (nextWeek <= totalWeeksInMonth.length) {
                setCurrentWeek(nextWeek);
            } else {
                Toast.show({
                    type: 'info',
                    text1: 'Thông báo',
                    text2: 'Đã hết các tuần trong tháng này. Vui lòng chọn tháng khác.',
                });
            }
        }
    };

    const getDaysOfWeek: DayData[] = useMemo(() => {
        if (!timetableData || currentWeek > totalWeeksInMonth.length || currentWeek < 1) return [];
        const { start, end } = totalWeeksInMonth[currentWeek - 1] || {};
        if (!start || !end) return [];
        return timetableData.scheduleDays.filter((day) =>
            dayjs(day.date).isBetween(start, end, 'day', '[]')
        );
    }, [timetableData, currentWeek, totalWeeksInMonth]);

    const uniqueStartTimes = useMemo(() => {
        if (!getDaysOfWeek.length) return [];
        const all = getDaysOfWeek.flatMap((d) => d.activities);
        // Lọc ra các thời gian bắt đầu duy nhất và sắp xếp
        const times = [...new Set(all.map((a) => a.startTime))];
        times.sort((a, b) => (a || 0) - (b || 0));
        return times;
    }, [getDaysOfWeek]);

    const dataSource: IScheduleRow[] = useMemo(() => {
        if (!getDaysOfWeek.length || uniqueStartTimes.length === 0) return [];
        
        // Tạo một cấu trúc dữ liệu phẳng theo hàng (thời gian)
        return uniqueStartTimes.map((startTime) => {
            const time = formatMinutesToTime(startTime);
            const row: IScheduleRow = { key: time, time };
            
            getDaysOfWeek.forEach((day, index) => {
                // Tìm hoạt động khớp với startTime trong ngày này
                const activity = day.activities.find((a) => a.startTime === startTime);
                row[`day_${index}`] = activity || null;
            });
            return row;
        });
    }, [getDaysOfWeek, uniqueStartTimes]);

    const classInfo = timetableData ? `${timetableData.className || ''} (${timetableData.schoolYear || ''})` : '';

    const renderTimeColumn = (isHeader: boolean) => (
        // Chỉ bọc fixedCol ở đây, và không bọc cell Header nếu không phải là Header
        <View style={newStyles.fixedCol}>
            {isHeader ? (
                // Header cell
                <View style={[newStyles.headerCell, newStyles.fixedHeaderCell]}>
                    <Text style={newStyles.headerTextCol}>Giờ</Text>
                </View>
            ) : (
                // Data cells
                dataSource.map((row) => (
                    <View key={(row as IScheduleRow).key} style={[newStyles.timeCell]}>
                        <Text style={newStyles.timeCellText}>{(row as IScheduleRow).time}</Text>
=======
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
>>>>>>> Stashed changes
                    </View>
                ))
            )}
        </View>
    );

    const renderHeaderRow = () => (
        <View style={newStyles.scrollableHeaderRow}>
            {getDaysOfWeek.map((day) => {
                const isToday = dayjs(day.date).isSame(dayjs(), 'day');
                return (
                    <View key={day._id} style={[newStyles.headerCell, { width: DAY_COLUMN_WIDTH }, isToday && newStyles.todayHeader]}>
                        <Text style={[newStyles.headerTextCol, isToday && newStyles.todayHeaderText]} numberOfLines={1}>
                            {day.dayName.split(' ')[1] || day.dayName} 
                        </Text>
                        <Text style={[newStyles.dateText, isToday && newStyles.todayDateText]}>
                            {dayjs(day.date).format('DD/MM')}
                        </Text>
                    </View>
                );
            })}
        </View>
    );

    const renderDataRows = () => (
        dataSource.map((row, rowIndex) => (
            <View key={row.key} style={newStyles.dataRow}>
                {getDaysOfWeek.map((day, dayIndex) => {
                    const activity = row[`day_${dayIndex}`] as (IActivity | null);
                    
                    if (!activity) {
                        return <View key={dayIndex} style={[newStyles.emptyCell, { width: DAY_COLUMN_WIDTH }]} />;
                    }

                    const props = getActivityProps(activity);

                    // Xử lý ô hoạt động
                    return (
                        <View key={dayIndex} style={[newStyles.activityCell, { width: DAY_COLUMN_WIDTH, backgroundColor: '#fff' }]}>
                            <TouchableOpacity style={[newStyles.tag, { borderColor: props.color, backgroundColor: props.color + '1A' }]}
                                onPress={() => {
                                    if (activity.activityName) {
                                        Alert.alert(
                                            activity.activityName,
                                            `Thời gian: ${formatMinutesToTime(activity.startTime)} - ${formatMinutesToTime(activity.endTime)}\nLoại: ${props.typeText}\n\n${activity.tittle || 'Không có chi tiết.'}`,
                                            [{ text: 'Đóng' }]
                                        );
                                    }
                                }}
                            >
                                <Icon 
                                    name={props.iconName} 
                                    type={props.iconName === 'lightbulb-outline' ? 'material' : 'antdesign'} 
                                    color={props.color} 
                                    size={14} 
                                    style={{ marginRight: 5 }} 
                                />
                                <Text style={[newStyles.tagText, { color: props.color }]} numberOfLines={1}>{activity.activityName || 'Trống'}</Text>
                            </TouchableOpacity>
                            
                            {(activity.type === 'Bình thường' || activity.type === 'Sự kiện') && activity.tittle && (
                                <View style={newStyles.detailsContainer}>
                                    {/* Hiển thị tittle dưới dạng bullet point hoặc mô tả ngắn */}
                                    {activity.tittle.split('\n').slice(0, 2).map((line, i) => ( 
                                        <Text key={i} style={newStyles.bulletItemRN} numberOfLines={1}>
                                            • {line.trim()}
                                        </Text>
                                    ))}
                                    {activity.tittle.split('\n').length > 2 && (
                                        <Text style={newStyles.moreText}>...</Text>
                                    )}
                                </View>
                            )}
                            
                            {/* Hiển thị thời gian kết thúc (nếu khác giờ bắt đầu) */}
                            {activity.endTime !== activity.startTime && (
                                <Text style={newStyles.endTimeText}>
                                    - {formatMinutesToTime(activity.endTime)}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </View>
        ))
    );

<<<<<<< Updated upstream
    return (
        <View style={newStyles.mainContainer}>
            <Toast />
            <ScrollView style={{ flex: 1 }}> 
                <Card containerStyle={newStyles.cardStyle}>
                    <View style={newStyles.headerContainer}>
                        <Text style={newStyles.titleText}>⏰ Thời khóa biểu giáo viên</Text>
                        {classInfo && <Text style={newStyles.subtitleText}>{classInfo}</Text>}
                    </View>

                    <View style={newStyles.controlsGrid}>
                        <View style={newStyles.pickerGroup}>
                            <CustomPicker
                                selectedValue={selectedYear}
                                onValueChange={(itemValue) => setSelectedYear(itemValue)}
                                items={schoolYears.map(y => ({ label: y.schoolYear, value: y.schoolYear }))}
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
                                    value: i + 1 
                                }))}
                                placeholder="Chọn Tháng"
                            />
                        </View>
=======
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
>>>>>>> Stashed changes

                        <View style={newStyles.segmentControl}>
                            <Button
                                title="Tuần"
                                onPress={() => setViewMode('week')}
                                buttonStyle={[newStyles.segmentButton, viewMode === 'week' && newStyles.segmentActive]}
                                titleStyle={[newStyles.segmentTitle, viewMode === 'week' && newStyles.segmentActiveTitle]}
                            />
                            <Button
                                title="Ngày"
                                onPress={() => { setViewMode('day'); setCurrentWeek(1); }} 
                                buttonStyle={[newStyles.segmentButton, viewMode === 'day' && newStyles.segmentActive]}
                                titleStyle={[newStyles.segmentTitle, viewMode === 'day' && newStyles.segmentActiveTitle]}
                            />
                        </View>
                        
                    </View>
                    
                    {viewMode === 'week' && (
                        <View style={newStyles.weekNavRow}>
                            <Button
                                icon={<Icon name="chevron-left" type="font-awesome" color="#007AFF" size={18} />}
                                onPress={() => handleWeekChange('prev')}
                                disabled={currentWeek === 1}
                                buttonStyle={newStyles.navButtonRN}
                            />
                            <View style={newStyles.weekDisplay}>
                                <Text style={newStyles.weekDisplayText}>
                                    {totalWeeksInMonth[currentWeek - 1]
                                        ? `${totalWeeksInMonth[currentWeek - 1].start.format('DD/MM')} - ${totalWeeksInMonth[currentWeek - 1].end.format('DD/MM')} (Tuần ${currentWeek})`
                                        : `Tuần ${currentWeek}`}
                                </Text>
                            </View>
                            <Button
                                icon={<Icon name="chevron-right" type="font-awesome" color="#007AFF" size={18} />}
                                onPress={() => handleWeekChange('next')}
                                disabled={currentWeek >= totalWeeksInMonth.length}
                                buttonStyle={newStyles.navButtonRN}
                            />
                        </View>
                    )}

                    <View style={newStyles.contentArea}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 50 }} />
                        ) : !getDaysOfWeek.length && !loading ? (
                            <View style={newStyles.emptyContainer}>
                                <Icon name="calendar-times-o" type="font-awesome" color="#909090" size={50} />
                                <Text style={newStyles.emptyText}>Không có dữ liệu thời khóa biểu</Text>
                            </View>
                        ) : viewMode === 'week' ? (
                            <View style={newStyles.weekTableWrapper}>
                                {/* Header Row */}
                                <View style={newStyles.tableHeaderRow}>
                                    {renderTimeColumn(true)} {/* Hiển thị tiêu đề "Giờ" */}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {renderHeaderRow()}
                                    </ScrollView>
                                </View>
                                
                                {/* Data Rows - Đảm bảo căn chỉnh hàng ngang */}
                                <View style={newStyles.tableDataContainer}>
                                    {renderTimeColumn(false)} {/* Chỉ hiển thị cột thời gian (data cells) */}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                        <View>
                                            {renderDataRows()}
                                        </View>
                                    </ScrollView>
                                </View>

                            </View>
                        ) : (
                            <TimetableDayView getDaysOfWeek={getDaysOfWeek} />
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
        backgroundColor: '#f5f5f5',
    },
    cardStyle: {
        margin: 10,
        borderRadius: 12,
        padding: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerContainer: {
        marginBottom: 10,
    },
    titleText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    subtitleText: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    controlsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginVertical: 10,
    },
    pickerGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    pickerWrapper: { 
        width: 120, 
        height: 38, 
        borderWidth: 1,
        borderColor: '#d9d9d9',
        borderRadius: 6,
        overflow: 'hidden', 
        justifyContent: 'center',
        position: 'relative', 
    },
    picker: {
        width: '100%', 
        height: '100%',
        color: Platform.OS === 'ios' ? 'transparent' : '#333', 
        position: Platform.OS === 'ios' ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        zIndex: Platform.OS === 'ios' ? 2 : 1, 
        opacity: 1,
    },
    androidPicker: {
        paddingVertical: 0,
        height: 38,
    },
    pickerItemStyle: Platform.select({
        ios: {
            textAlign: 'left',
            paddingLeft: 10,
            fontSize: 13,
        },
        default: {}
    }),
    pickerDisplayOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        pointerEvents: 'none', 
        backgroundColor: '#fff', 
        zIndex: 1, 
    },
    pickerDisplayText: {
        fontSize: 13,
        color: '#333',
    },
    segmentControl: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 6,
        overflow: 'hidden',
    },
    segmentButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        height: 38,
        borderRadius: 0,
    },
    segmentActive: {
        backgroundColor: '#007AFF',
    },
    segmentTitle: {
        color: '#007AFF',
        fontSize: 13,
        fontWeight: '600',
    },
    segmentActiveTitle: {
        color: '#fff',
    },
    weekNavRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    navButtonRN: {
        backgroundColor: 'transparent',
        paddingHorizontal: 8,
        height: 38,
    },
    weekDisplay: {
        flex: 1,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 38,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#f9f9f9',
    },
    weekDisplayText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    contentArea: {
        minHeight: 250,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 50,
    },
    emptyText: {
        marginTop: 10,
        color: '#909090',
    },
    // --- Table Styles for Fixed Column ---
    weekTableWrapper: { 
        minWidth: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d9d9d9',
        borderRadius: 6,
        overflow: 'hidden',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#d9d9d9',
        backgroundColor: '#f5f5f5', 
    },
    tableDataContainer: {
        flexDirection: 'row', 
        flex: 1,
    },
    dataRow: {
        flexDirection: 'row',
    },
    scrollableHeaderRow: {
        flexDirection: 'row',
        borderLeftWidth: 1,
        borderColor: '#d9d9d9',
    },

    // Fixed Column (Time)
    fixedCol: {
        width: TIME_COLUMN_WIDTH, 
        backgroundColor: '#f5f5f5', 
        zIndex: 10,
        borderRightWidth: 1,
        borderColor: '#d9d9d9', 
    },
    fixedHeaderCell: {
        height: MIN_CELL_HEIGHT, 
        borderRightWidth: 0, 
        width: TIME_COLUMN_WIDTH,
    },
    timeCell: {
        width: TIME_COLUMN_WIDTH,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 0,
        borderBottomWidth: 1, 
        borderColor: '#f0f0f0',
        paddingVertical: 10, 
        minHeight: MIN_CELL_HEIGHT, 
    },
    timeCellText: {
        fontWeight: '600',
        fontSize: 12, 
        color: '#333',
    },

    // Day Cell Styles
    headerCell: {
        height: MIN_CELL_HEIGHT,
        backgroundColor: '#f5f5f5', 
        paddingHorizontal: 5,
        paddingVertical: 8,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        alignItems: 'center',
    },
    headerTextCol: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#333',
    },
    dateText: {
        fontSize: 11,
        color: '#6c757d',
        marginTop: 2,
    },
    todayHeader: {
        backgroundColor: '#007AFF10', 
    },
    todayHeaderText: {
        color: '#007AFF',
    },
    todayDateText: {
        color: '#007AFF',
        fontWeight: '600',
    },

    // Activity Cell Styles
    activityCell: {
        padding: 8, 
        justifyContent: 'center', 
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        minHeight: MIN_CELL_HEIGHT, 
    },
    emptyCell: {
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
        minHeight: MIN_CELL_HEIGHT, 
    },
    // Tag Styles
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 4,
        borderWidth: 1,
        marginVertical: 2, 
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailsContainer: {
        alignSelf: 'flex-start',
        marginTop: 2,
        width: '100%',
    },
    bulletItemRN: {
        fontSize: 11,
        color: '#6c757d',
        lineHeight: 16,
    },
    moreText: {
        fontSize: 11,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 2,
    },
    endTimeText: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    }
});

export default TimeTable;