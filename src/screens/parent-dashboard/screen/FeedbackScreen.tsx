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
import { userApis } from "../../../services/apiServices"; // Đảm bảo đã thêm getFeedbackByStudentAndDate
import { AuthStackParamList } from "../../../routes/AuthStack"; // Đảm bảo đã thêm 'Feedback'

// --- Định nghĩa Typescript ---

type StudentInfo = {
  _id: string;
  studentCode: string;
  fullName: string;
};

type ClassInfo = {
  _id: string;
  className: string;
};

type TeacherInfo = {
  _id: string;
  fullName: string;
};

type EatingFeedback = {
  breakfast: string;
  lunch: string;
  snack: string;
  note: string;
};

type SleepingFeedback = {
  duration: string;
  quality: string;
  note: string;
};

type HygieneFeedback = {
  toilet: string;
  handwash: string;
  note: string;
};

type LearningFeedback = {
  focus: string;
  participation: string;
  note: string;
};

type SocialFeedback = {
  friendInteraction: string;
  emotionalState: string;
  behavior: string;
  note: string;
};

type HealthFeedback = {
  note: string;
};

type FeedbackRecord = {
  _id: string;
  studentId: StudentInfo;
  classId: ClassInfo;
  teacherId: TeacherInfo;
  date: string;
  eating: EatingFeedback;
  sleeping: SleepingFeedback;
  hygiene: HygieneFeedback;
  learning: LearningFeedback;
  social: SocialFeedback;
  health: HealthFeedback;
  dailyHighlight: string;
  teacherNote: string;
  reminders: string[];
  createdAt: string;
};


// --- Định nghĩa Props ---
type Props = NativeStackScreenProps<AuthStackParamList, "Feedback">;

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
const InfoRow: React.FC<{
  icon: string;
  label: string;
  value: string | number;
}> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
    <Text style={styles.labelText}>{label}:</Text>
    <Text style={styles.valueText}>{value || "N/A"}</Text>
  </View>
);

// --- Component List tái sử dụng (cho lời dặn) ---
const InfoList: React.FC<{
  icon: string;
  label: string;
  items: string[];
}> = ({ icon, label, items }) => (
  <View style={styles.infoListContainer}>
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
      <Text style={styles.labelText}>{label}:</Text>
    </View>
    {items && items.length > 0 ? (
      items.map((item, index) => (
        <Text key={index} style={styles.listItem}>
          • {item}
        </Text>
      ))
    ) : (
      <Text style={styles.listItem}>• Không có lời dặn.</Text>
    )}
  </View>
);

// --- Màn hình chính ---
const FeedbackScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student } = route.params;
  const studentId = student._id;

  const [loading, setLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackRecord | null>(null);
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

  const onDateChange = (
    event: DateTimePickerEvent,
    newDate: Date | undefined
  ) => {
    setShowDatePicker(Platform.OS === "ios");
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  // --- UseEffect ---
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setFeedbackData(null);
      const dateString = formatDateForAPI(selectedDate);

      try {
        const res = await userApis.getFbByStuAndDate(
          studentId,
          dateString
        );

        if (res && res.data) {
          setFeedbackData(res.data);
        } else {
          setFeedbackData(null);
        }
      } catch (err) {
        setFeedbackData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [selectedDate, studentId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="file-star-outline"
            size={30}
            color={COLORS.primaryDark}
          />
          <Text style={styles.title}>Nhận xét ngày</Text>
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
        ) : !feedbackData ? (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons
              name="comment-search-outline"
              size={60}
              color={COLORS.grey}
            />
            <Text style={styles.noDataText}>
              Không có nhận xét cho ngày này
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {/* Thẻ Thông tin chung */}
            <SectionCard title="Thông tin chung" icon="information-outline">
              <InfoRow
                icon="account"
                label="Học sinh"
                value={feedbackData.studentId.fullName}
              />
              <InfoRow
                icon="account-tie"
                label="Giáo viên"
                value={feedbackData.teacherId.fullName}
              />
              <InfoRow
                icon="google-classroom"
                label="Lớp"
                value={feedbackData.classId.className}
              />
            </SectionCard>

            {/* Thẻ Bữa ăn */}
            <SectionCard title="Bữa ăn" icon="food-apple">
              <InfoRow
                icon="food-croissant"
                label="Sáng"
                value={feedbackData.eating.breakfast}
              />
              <InfoRow
                icon="food"
                label="Trưa"
                value={feedbackData.eating.lunch}
              />
              <InfoRow
                icon="cupcake"
                label="Xế"
                value={feedbackData.eating.snack}
              />
              <InfoRow
                icon="notebook-outline"
                label="Ghi chú"
                value={feedbackData.eating.note}
              />
            </SectionCard>

            {/* Thẻ Giấc ngủ */}
            <SectionCard title="Giấc ngủ" icon="sleep">
              <InfoRow
                icon="clock-time-four-outline"
                label="Thời gian"
                value={feedbackData.sleeping.duration}
              />
              <InfoRow
                icon="star-outline"
                label="Chất lượng"
                value={feedbackData.sleeping.quality}
              />
              <InfoRow
                icon="notebook-outline"
                label="Ghi chú"
                value={feedbackData.sleeping.note}
              />
            </SectionCard>

            {/* Thẻ Vệ sinh */}
            <SectionCard title="Vệ sinh" icon="hand-water">
              <InfoRow
                icon="human-male-female"
                label="Đi vệ sinh"
                value={feedbackData.hygiene.toilet}
              />
              <InfoRow
                icon="hand-wash-outline"
                label="Rửa tay"
                value={feedbackData.hygiene.handwash}
              />
              <InfoRow
                icon="notebook-outline"
                label="Ghi chú"
                value={feedbackData.hygiene.note}
              />
            </SectionCard>

            {/* Thẻ Học tập */}
            <SectionCard title="Học tập" icon="book-open-variant">
              <InfoRow
                icon="head-dots-horizontal-outline"
                label="Tập trung"
                value={feedbackData.learning.focus}
              />
              <InfoRow
                icon="hand-back-right-outline"
                label="Tham gia"
                value={feedbackData.learning.participation}
              />
              <InfoRow
                icon="notebook-outline"
                label="Ghi chú"
                value={feedbackData.learning.note}
              />
            </SectionCard>

            {/* Thẻ Xã hội */}
            <SectionCard title="Cảm xúc & Xã hội" icon="account-heart">
              <InfoRow
                icon="account-multiple"
                label="Tương tác"
                value={feedbackData.social.friendInteraction}
              />
              <InfoRow
                icon="emoticon-happy-outline"
                label="Cảm xúc"
                value={feedbackData.social.emotionalState}
              />
              <InfoRow
                icon="human-greeting-variant"
                label="Hành vi"
                value={feedbackData.social.behavior}
              />
              <InfoRow
                icon="notebook-outline"
                label="Ghi chú"
                value={feedbackData.social.note}
              />
            </SectionCard>

            {/* Thẻ Sức khỏe */}
            <SectionCard title="Sức khỏe" icon="heart-pulse">
              <InfoRow
                icon="notebook-outline"
                label="Ghi chú"
                value={feedbackData.health.note}
              />
            </SectionCard>

            {/* Thẻ Điểm nhấn */}
            <SectionCard title="Điểm nhấn trong ngày" icon="star-circle">
              <Text style={styles.noteText}>
                {feedbackData.dailyHighlight || "Không có."}
              </Text>
            </SectionCard>

            {/* Thẻ Lời dặn cô */}
            <SectionCard title="Lời dặn của cô" icon="message-text">
              <Text style={styles.noteText}>
                {feedbackData.teacherNote || "Không có."}
              </Text>
            </SectionCard>

            {/* Thẻ Lời dặn phụ huynh */}
            <SectionCard title="Phụ huynh cần chuẩn bị" icon="clipboard-list">
              <InfoList
                icon="check-outline"
                label="Lời dặn"
                items={feedbackData.reminders}
              />
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
    alignItems: "flex-start",
    marginBottom: 12,
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
    color: COLORS.textSecondary,
    flex: 1,
  },
  noteText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    lineHeight: 24,
  },
  infoListContainer: {
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 32,
    marginTop: 4,
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

export default FeedbackScreen;