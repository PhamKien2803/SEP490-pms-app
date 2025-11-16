import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";

// --- Định nghĩa Typescript (ĐÃ CẬP NHẬT) ---

type ClassInfo = {
  _id: string;
  className: string;
};

type TeacherInfo = {
  _id: string;
  fullName: string;
  phoneNumber: string;
};

type StudentInfo = {
  _id: string;
  studentCode: string;
  fullName: string;
  gender: string;
};

// Cập nhật theo log mới: Không có _doc
type StudentAttendanceRecord = {
  status: string;
  note?: string;
  student: StudentInfo;
  timeCheckIn: string | null; // Thêm trường này
  timeCheckOut: string | null; // Thêm trường này
  guardian: string | null;
};

// Cập nhật theo log mới
type AttendanceResponse = {
  success: boolean;
  class: ClassInfo;
  teacher: TeacherInfo;
  date: string;
  generalNote: string;
  student: StudentAttendanceRecord; // Cập nhật type ở đây
};

// --- Định nghĩa Props ---
type Props = NativeStackScreenProps<AuthStackParamList, "Attendance">;

// --- Component Card tái sử dụng ---
const SectionCard: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <View style={styles.card}>
    <View style={styles.cardTitleContainer}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={COLORS.primaryDark}
      />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

// --- Component Row tái sử dụng ---
// Cập nhật để có thể tùy chỉnh màu giá trị (value)
const InfoRow: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  valueColor?: string;
}> = ({ icon, label, value, valueColor = COLORS.textSecondary }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
    <Text style={styles.labelText}>{label}:</Text>
    <Text style={[styles.valueText, { color: valueColor }]}>
      {value || "N/A"}
    </Text>
  </View>
);

// --- Màn hình chính ---
const AttendanceScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student } = route.params;
  const studentId = student._id;
  console.log("🚀 ~ AttendanceScreen ~ studentId111111:", studentId)

  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Helper Functions ---

  const formatDateForAPI = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDateForDisplay = (date: Date) => {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    const dayName = days[date.getDay()];
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${dayName}, ${d}/${m}/${y}`;
  };

  // --- Helper MỚI: Format thời gian ---
  const formatTimeDisplay = (isoString: string | null) => {
    if (!isoString) {
      return "Chưa có";
    }
    try {
      const date = new Date(isoString);
      const h = String(date.getHours()).padStart(2, "0");
      const m = String(date.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    } catch (e) {
      return "N/A";
    }
  };

  const onDateChange = (
    event: DateTimePickerEvent,
    newDate: Date | undefined
  ) => {
    setShowDatePicker(Platform.OS === "ios");
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  // --- UseEffect (Sửa logic kiểm tra res) ---
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setAttendanceData(null);
      const dateString = formatDateForAPI(selectedDate);

      try {
        const res = await userApis.getAttByStuDate(
          studentId,
          dateString
        );

        // Kiểm tra 'success' để đảm bảo có dữ liệu
        if (res && res.success) {
          setAttendanceData(res);
        } else {
          setAttendanceData(null);
        }
      } catch (err) {
        setAttendanceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedDate, studentId]);

  // --- Render Functions (Cập nhật logic) ---
  const renderStatusCard = () => {
    if (!attendanceData) return null;

    // Truy cập trực tiếp (không cần _doc)
    const { status, note, student, timeCheckIn, timeCheckOut } =
      attendanceData.student;
    const studentName = student.fullName;

    let iconName: string = "help-circle";
    let iconColor: string = COLORS.grey;
    let statusColor: string = COLORS.textPrimary;
    const isAbsent = status.includes("Vắng mặt");

    switch (status) {
      case "Có mặt":
        iconName = "check-circle";
        iconColor = COLORS.success;
        statusColor = COLORS.success;
        break;
      case "Vắng mặt có phép":
      case "Vắng mặt": // Bắt cả trường hợp "Vắng mặt"
        iconName = "close-circle-outline";
        iconColor = COLORS.warning;
        statusColor = COLORS.warning;
        break;
      case "Vắng mặt không phép":
        iconName = "close-circle";
        iconColor = COLORS.error;
        statusColor = COLORS.error;
        break;
      case "Đi muộn":
        iconName = "clock-alert-outline";
        iconColor = COLORS.accent;
        statusColor = COLORS.accent;
        break;
    }

    return (
      <View style={[styles.statusCard, { borderColor: iconColor }]}>
        <MaterialCommunityIcons name={iconName} size={60} color={iconColor} />
        <View style={styles.statusInfo}>
          <Text style={styles.studentNameText}>{studentName}</Text>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>

          {/* --- MỚI: Hiển thị thời gian --- */}
          {/* Chỉ hiển thị khi bé không vắng mặt */}
          {!isAbsent && (
            <View style={styles.timeContainer}>
              <InfoRow
                icon="clock-in"
                label="Giờ vào:"
                value={formatTimeDisplay(timeCheckIn)}
                valueColor={COLORS.textPrimary}
              />
              <InfoRow
                icon="clock-out"
                label="Giờ ra:"
                value={formatTimeDisplay(timeCheckOut)}
                valueColor={COLORS.textPrimary}
              />
            </View>
          )}
          {/* ---------------------------- */}

          {/* Hiển thị ghi chú của bé */}
          {note ? (
            <Text style={styles.statusNote}>Ghi chú: {note}</Text>
          ) : (
            status === "Có mặt" && (
              <Text style={styles.statusNote}>Bé đã đến lớp an toàn!</Text>
            )
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="check-all"
            size={30}
            color={COLORS.primaryDark}
          />
          <Text style={styles.title}>Điểm danh</Text>
        </View>

        {/* Nút chọn ngày */}
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons
            name="calendar-search"
            size={24}
            color={COLORS.primaryDark}
          />
          <Text style={styles.datePickerText}>
            {formatDateForDisplay(selectedDate)}
          </Text>
        </TouchableOpacity>

        {/* Modal/Picker chọn ngày */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : !attendanceData ? (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons
              name="calendar-remove-outline"
              size={60}
              color={COLORS.grey}
            />
            <Text style={styles.noDataText}>
              Không có dữ liệu điểm danh cho ngày này
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {/* Thẻ Trạng thái */}
            {renderStatusCard()}

            {/* Thẻ Thông tin chung */}
            <SectionCard title="Thông tin lớp" icon="google-classroom">
              <InfoRow
                icon="account-group"
                label="Lớp"
                value={attendanceData.class.className}
              />
              <InfoRow
                icon="account-tie"
                label="Giáo viên"
                value={attendanceData.teacher.fullName}
              />
            </SectionCard>

            {/* Thẻ Nhận xét chung */}
            <SectionCard title="Nhận xét chung của lớp" icon="notebook-outline">
              <Text style={styles.generalNoteText}>
                {attendanceData.generalNote || "Không có nhận xét."}
              </Text>
            </SectionCard>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

// Bảng màu
const COLORS = {
  background: "#f0f8ff",
  white: "#FFFFFF",
  primary: "#00b4d8",
  primaryDark: "#0077b6",
  accent: "#FFA726",
  success: "#00796B",
  warning: "#F57C00",
  error: "#D32F2F",
  textPrimary: "#333333",
  textSecondary: "#555555",
  textLight: "#757575",
  borderColor: "#e0f7fa",
  shadow: "rgba(0, 0, 0, 0.1)",
  grey: "#BDBDBD",
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
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  datePickerText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primaryDark,
    marginLeft: 10,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
  },
  studentNameText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusNote: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 8, // Thêm khoảng cách
  },
  // Style mới cho khung thời gian
  timeContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  card: {
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
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderColor,
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center", // Đổi thành center
    marginBottom: 8, // Giảm margin
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginLeft: 10,
    marginRight: 5,
  },
  valueText: {
    fontSize: 16,
    flex: 1,
  },
  generalNoteText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    lineHeight: 24,
  },
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

export default AttendanceScreen;