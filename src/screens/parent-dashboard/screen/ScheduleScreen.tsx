import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";
// --- Sửa lỗi Type: Import trực tiếp từ file types của bạn ---
import {
  MonthlySchedule,
  Activity, // Import Activity chính xác
  ScheduleDay, // Import ScheduleDay chính xác
} from "../../../types/auth";

// --- Định nghĩa Typescript ---

// Kiểu dữ liệu mới để nhóm các tuần lại
type WeekGroup = {
  id: string; // Dùng _id của ngày đầu tiên làm ID
  label: string; // Ví dụ: "Tuần 1 (01/11 - 07/11)"
  days: ScheduleDay[];
};

// Kiểu dữ liệu cho API response (là một mảng)
type ApiResponse = MonthlySchedule[];

// --- Định nghĩa Props ---
type Props = NativeStackScreenProps<AuthStackParamList, "Schedule">;

// --- Màn hình chính ---
const ScheduleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student } = route.params;
  // Giả sử student object có class
  const classId = "691757179b7ad0c9496f4372"; // Lấy classId từ student
// student.class?._id || 
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<MonthlySchedule | null>(null);
  const [monthOptions, setMonthOptions] = useState<{ label: string; value: number }[]>(
    []
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );

  // --- State mới cho việc chọn tuần ---
  const [weekGroups, setWeekGroups] = useState<WeekGroup[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeekGroup | null>(null);

  // --- Helper Functions ---

  // Chuyển đổi số phút (ví dụ: 435) sang "HH:mm" (ví dụ: "07:15")
  const formatTime = (minutes: number) => {
    if (minutes === null || minutes === undefined) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Format ngày "YYYY-MM-DDTHH..." -> "DD/MM"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  // --- Helper mới: Chia các ngày thành các tuần ---
  const groupDaysIntoWeeks = (days: ScheduleDay[]): WeekGroup[] => {
    const weeks: WeekGroup[] = [];
    let currentWeek: ScheduleDay[] = [];

    days.forEach((day, index) => {
      currentWeek.push(day);

      // Nếu là "Chủ nhật" hoặc là ngày cuối cùng của mảng, đóng tuần lại
      if (day.dayName === "Chủ nhật" || index === days.length - 1) {
        if (currentWeek.length > 0) {
          const weekNumber = weeks.length + 1;
          const startDate = formatDate(currentWeek[0].date);
          const endDate = formatDate(currentWeek[currentWeek.length - 1].date);

          weeks.push({
            id: currentWeek[0]._id,
            label: `Tuần ${weekNumber} (${startDate} - ${endDate})`,
            days: currentWeek,
          });
          currentWeek = []; // Bắt đầu tuần mới
        }
      }
    });
    return weeks;
  };

  // --- UseEffect ---

  // 1. Tạo danh sách 12 tháng cho Picker
  useEffect(() => {
    const months = Array.from({ length: 12 }, (v, k) => ({
      label: `Tháng ${k + 1}`,
      value: k + 1,
    }));
    setMonthOptions(months);
    setSelectedMonth(new Date().getMonth() + 1);
  }, []);

  // 2. Fetch dữ liệu khi `selectedMonth` hoặc `classId` thay đổi
  useEffect(() => {
    if (!classId || !selectedMonth) return;

    const fetchSchedule = async () => {
      setLoading(true);
      setScheduleData(null);
      setWeekGroups([]); // Xóa các tuần cũ
      setSelectedWeek(null); // Xóa tuần đã chọn
      try {
        const res: ApiResponse = await userApis.getScheduleByClassAndMonth(
          classId,
          selectedMonth
        );

        if (res && res.length > 0) {
          const monthData = res[0];
          setScheduleData(monthData);

          // Nhóm các ngày thành tuần
          const weeks = groupDaysIntoWeeks(monthData.scheduleDays);
          setWeekGroups(weeks);

          // Tự động chọn tuần đầu tiên
          if (weeks.length > 0) {
            setSelectedWeek(weeks[0]);
          }
        } else {
          setScheduleData(null);
        }
      } catch (err) {
        setScheduleData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedMonth, classId]);

  // --- Render Functions ---

  // Sử dụng 'Activity' đã được import
  const renderActivity = (activity: Activity) => (
    <View key={activity._id} style={styles.activityRow}>
      {/* Cột thời gian */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{formatTime(activity.startTime)}</Text>
        <Text style={styles.timeText}>-</Text>
        <Text style={styles.timeText}>{formatTime(activity.endTime)}</Text>
      </View>
      {/* Đường kẻ phân cách */}
      <View style={styles.separator} />
      {/* Cột thông tin hoạt động */}
      <View style={styles.infoColumn}>
        <Text style={styles.activityNameText}>
          {activity.activityName || "Hoạt động"}
        </Text>
        {activity.tittle && (
          <Text style={styles.activityTittleText}>({activity.tittle})</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={30}
            color={COLORS.primaryDark}
          />
          <Text style={styles.title}>Lịch học</Text>
        </View>

        {/* Picker chọn tháng */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(val) => setSelectedMonth(val)}
          >
            {monthOptions.map((m) => (
              <Picker.Item key={m.value} label={m.label} value={m.value} />
            ))}
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : !scheduleData || weekGroups.length === 0 ? (
          // Hiển thị nếu không có lịch của tháng
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons
              name="calendar-remove-outline"
              size={60}
              color={COLORS.grey}
            />
            <Text style={styles.noDataText}>
              Không có lịch học cho tháng này
            </Text>
          </View>
        ) : (
          // Nếu có dữ liệu, hiển thị Picker Tuần và Lịch học
          <>
            {/* Picker chọn tuần (MỚI) */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedWeek?.id}
                onValueChange={(val) => {
                  const week = weekGroups.find((w) => w.id === val);
                  setSelectedWeek(week || null);
                }}
              >
                {weekGroups.map((w) => (
                  <Picker.Item key={w.id} label={w.label} value={w.id} />
                ))}
              </Picker>
            </View>

            {/* ScrollView chỉ hiển thị các ngày trong `selectedWeek` */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {selectedWeek?.days.map((day) => (
                <View key={day._id} style={styles.dayContainer}>
                  {/* Tiêu đề của ngày */}
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayNameText}>{day.dayName}</Text>
                    <Text style={styles.dateText}>{formatDate(day.date)}</Text>
                  </View>

                  {/* Nội dung của ngày */}
                  {day.isHoliday ? (
                    <View style={styles.holidayContainer}>
                      <MaterialCommunityIcons
                        name="party-popper"
                        size={24}
                        color={COLORS.accent}
                      />
                      <Text style={styles.holidayText}>Ngày nghỉ</Text>
                    </View>
                  ) : day.activities.length === 0 ? (
                    <View style={styles.holidayContainer}>
                      <Text style={styles.noActivityText}>
                        Không có hoạt động
                      </Text>
                    </View>
                  ) : (
                    day.activities.map(renderActivity)
                  )}
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

// Bảng màu (Chủ đề mầm non - xanh)
const COLORS = {
  background: "#f0f8ff", // AliceBlue
  white: "#FFFFFF",
  primary: "#00b4d8", // Màu xanh da trời chính
  primaryDark: "#0077b6", // Xanh đậm cho tiêu đề
  accent: "#FFA726", // Cam (điểm nhấn)
  textPrimary: "#333333",
  textSecondary: "#555555",
  textLight: "#757575",
  borderColor: "#e0f7fa", // Xanh rất nhạt
  shadow: "rgba(0, 0, 0, 0.1)",
  grey: "#BDBDBD",
  holiday: "#f8bbd0", // Hồng nhạt cho ngày nghỉ
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primaryDark,
    textAlign: "center",
    marginLeft: 10,
  },
  pickerContainer: {
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: "hidden",
  },
  dayContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderColor,
    paddingBottom: 10,
    marginBottom: 10,
  },
  dayNameText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  dateText: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12, // Tăng khoảng cách
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  // Cột thời gian
  timeColumn: {
    width: 80, // Cố định chiều rộng
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.accent, // Dùng màu nhấn
  },
  // Dấu gạch dọc
  separator: {
    width: 2,
    height: "100%",
    backgroundColor: COLORS.primary,
    opacity: 0.5,
    borderRadius: 1,
  },
  // Cột thông tin
  infoColumn: {
    flex: 1, // Tự động chiếm không gian còn lại
    paddingLeft: 16,
  },
  activityNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4, // Khoảng cách nếu có tittle
  },
  activityTittleText: {
    fontSize: 14,
    fontStyle: "italic",
    color: COLORS.textSecondary,
  },
  // Thông báo ngày nghỉ
  holidayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff9c4", // Màu vàng nhạt
    borderRadius: 10,
  },
  holidayText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.accent,
    marginLeft: 10,
  },
  noActivityText: {
    fontSize: 16,
    fontStyle: "italic",
    color: COLORS.textLight,
  },
  // Thông báo không có dữ liệu
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    opacity: 0.8,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 18,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
});

export default ScheduleScreen;