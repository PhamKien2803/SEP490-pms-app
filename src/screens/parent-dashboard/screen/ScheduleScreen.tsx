import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";
import {
  MonthlySchedule,
  Activity,
  ScheduleDay,
} from "../../../types/auth";

// --- Helper Types ---
type WeekGroup = {
  id: string;
  label: string;
  days: ScheduleDay[];
};

type ApiResponse = MonthlySchedule[];

type Props = NativeStackScreenProps<AuthStackParamList, "Schedule">;

const ScheduleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student } = route.params;
  const classId = "691757179b7ad0c9496f4372"; // Thay bằng student.class?._id nếu có

  const [loading, setLoading] = useState(false);
  const [monthOptions, setMonthOptions] = useState<{ label: string; value: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Data States
  const [weekGroups, setWeekGroups] = useState<WeekGroup[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeekGroup | null>(null);
  const [selectedDay, setSelectedDay] = useState<ScheduleDay | null>(null);

  // --- Helpers ---
  const formatTime = (minutes: number | undefined) => {
    if (minutes === undefined || minutes === null) return "--:--";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const groupDaysIntoWeeks = (days: ScheduleDay[]): WeekGroup[] => {
    const weeks: WeekGroup[] = [];
    let currentWeek: ScheduleDay[] = [];

    days.forEach((day, index) => {
      currentWeek.push(day);
      // Ngắt tuần vào Chủ Nhật hoặc ngày cuối cùng
      if (day.dayName === "Chủ nhật" || index === days.length - 1) {
        if (currentWeek.length > 0) {
          const weekNumber = weeks.length + 1;
          const start = formatDateShort(currentWeek[0].date);
          const end = formatDateShort(currentWeek[currentWeek.length - 1].date);
          weeks.push({
            id: currentWeek[0]._id,
            label: `Tuần ${weekNumber} (${start} - ${end})`,
            days: currentWeek,
          });
          currentWeek = [];
        }
      }
    });
    return weeks;
  };

  // --- Effects ---
  useEffect(() => {
    const months = Array.from({ length: 12 }, (v, k) => ({
      label: `Tháng ${k + 1}`,
      value: k + 1,
    }));
    setMonthOptions(months);
  }, []);

  useEffect(() => {
    if (!classId || !selectedMonth) return;

    const fetchSchedule = async () => {
      setLoading(true);
      setWeekGroups([]);
      setSelectedWeek(null);
      setSelectedDay(null);

      try {
        const res: ApiResponse = await userApis.getScheduleByClassAndMonth(
          classId,
          selectedMonth
        );

        if (res && res.length > 0) {
          const monthData = res[0];
          const weeks = groupDaysIntoWeeks(monthData.scheduleDays);
          setWeekGroups(weeks);

          // Mặc định chọn tuần đầu tiên & ngày đầu tiên của tuần đó
          if (weeks.length > 0) {
            setSelectedWeek(weeks[0]);
            if (weeks[0].days.length > 0) {
              setSelectedDay(weeks[0].days[0]);
            }
          }
        }
      } catch (err) {
        // Xử lý lỗi im lặng hoặc show toast
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedMonth, classId]);

  // Khi chọn tuần mới, tự động chọn ngày đầu tiên của tuần đó
  const handleSelectWeek = (weekId: string) => {
    const newWeek = weekGroups.find((w) => w.id === weekId);
    if (newWeek) {
      setSelectedWeek(newWeek);
      if (newWeek.days.length > 0) {
        setSelectedDay(newWeek.days[0]);
      }
    }
  };

  // --- Render Item ---
  const renderActivity = (activity: Activity) => (
    <View key={activity._id} style={styles.activityCard}>
      {/* Cột trái: Thời gian */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(activity.startTime)}</Text>
        <View style={styles.verticalLine} />
        <Text style={styles.timeText}>{formatTime(activity.endTime)}</Text>
      </View>

      {/* Cột phải: Nội dung */}
      <View style={styles.contentContainer}>
        <Text style={styles.activityName}>
          {activity.activityName || "Hoạt động"}
        </Text>
        {activity.tittle ? (
          <Text style={styles.activityTitle}>Topic: {activity.tittle}</Text>
        ) : null}
        {/* Nếu muốn hiển thị thêm category hoặc age, thêm tại đây */}
      </View>
    </View>
  );

  const renderDaySelector = () => {
    if (!selectedWeek) return null;
    return (
      <View style={styles.daySelectorWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.daySelectorContent}
        >
          {selectedWeek.days.map((day) => {
            const isSelected = selectedDay?._id === day._id;
            return (
              <TouchableOpacity
                key={day._id}
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonActive,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayNameBtn, isSelected && styles.textWhite]}>
                  {day.dayName}
                </Text>
                <Text style={[styles.dateBtn, isSelected && styles.textWhite]}>
                  {formatDateShort(day.date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Tiêu đề */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="calendar-month" size={28} color={COLORS.primaryDark} />
          <Text style={styles.headerTitle}>Lịch học</Text>
        </View>

        {/* Bộ chọn Tháng & Tuần */}
        <View style={styles.filterContainer}>
          {/* Picker Tháng */}
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(val) => setSelectedMonth(val)}
              style={styles.picker}
            >
              {monthOptions.map((m) => (
                <Picker.Item key={m.value} label={m.label} value={m.value} style={{fontSize: 14}} />
              ))}
            </Picker>
          </View>

          {/* Picker Tuần */}
          <View style={[styles.pickerWrapper, { marginLeft: 10 }]}>
            <Picker
              selectedValue={selectedWeek?.id}
              onValueChange={(val) => handleSelectWeek(val)}
              enabled={weekGroups.length > 0}
              style={styles.picker}
            >
              {weekGroups.length > 0 ? (
                weekGroups.map((w) => (
                  <Picker.Item key={w.id} label={w.label} value={w.id} style={{fontSize: 14}} />
                ))
              ) : (
                <Picker.Item label="Chưa có lịch" value={null} />
              )}
            </Picker>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : !selectedDay ? (
           <View style={styles.centerMessage}>
             <Text style={styles.textSecondary}>Không có dữ liệu hiển thị</Text>
           </View>
        ) : (
          <>
            {/* Thanh chọn ngày ngang */}
            {renderDaySelector()}

            {/* Nội dung chi tiết của ngày đã chọn */}
            <ScrollView 
              style={styles.scheduleContent} 
              showsVerticalScrollIndicator={false}
            >
              {/* Tiêu đề ngày */}
              <View style={styles.dayTitleContainer}>
                <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.primary} />
                <Text style={styles.currentDayTitle}>
                  {selectedDay.dayName}, ngày {formatDateShort(selectedDay.date)}
                </Text>
              </View>

              {selectedDay.isHoliday ? (
                <View style={styles.holidayBox}>
                   <MaterialCommunityIcons name="balloon" size={40} color={COLORS.accent} />
                   <Text style={styles.holidayText}>Hôm nay là ngày nghỉ!</Text>
                </View>
              ) : selectedDay.activities.length === 0 ? (
                <View style={styles.holidayBox}>
                   <Text style={styles.textSecondary}>Không có hoạt động nào được ghi nhận.</Text>
                </View>
              ) : (
                <View style={styles.timelineList}>
                  {selectedDay.activities.map(renderActivity)}
                </View>
              )}
              
              {/* Khoảng trống dưới cùng để không bị che bởi tabbar nếu có */}
              <View style={{height: 20}} />
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

// --- Colors & Styles ---
const COLORS = {
  background: "#F0F8FF", // AliceBlue
  white: "#FFFFFF",
  primary: "#00B4D8", // Sky Blue
  primaryDark: "#0077B6", // Darker Blue
  accent: "#FFA726", // Orange
  textPrimary: "#333333",
  textSecondary: "#666666",
  border: "#E0E0E0",
  successLight: "#E8F5E9",
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 16 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginLeft: 8,
  },

  // Filter Area
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    overflow: "hidden",
    height: 50,
    justifyContent: 'center'
  },
  picker: {
    // Style cho Android/iOS picker
    width: '100%',
  },

  // Day Selector (Horizontal)
  daySelectorWrapper: {
    marginBottom: 16,
  },
  daySelectorContent: {
    paddingVertical: 4,
  },
  dayButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 70,
  },
  dayButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
  },
  dayNameBtn: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dateBtn: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  textWhite: {
    color: COLORS.white,
  },

  // Schedule Detail
  scheduleContent: {
    flex: 1,
  },
  dayTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#E1F5FE",
    padding: 8,
    borderRadius: 8,
  },
  currentDayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginLeft: 8,
  },
  
  // Timeline / Activity Card
  timelineList: {
    paddingHorizontal: 2,
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeContainer: {
    alignItems: "center",
    width: 60,
    marginRight: 12,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#B3E5FC",
    marginVertical: 4,
    borderRadius: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  activityName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },

  // Empty States
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holidayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    marginTop: 10,
  },
  holidayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginTop: 8,
  },
  textSecondary: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default ScheduleScreen;