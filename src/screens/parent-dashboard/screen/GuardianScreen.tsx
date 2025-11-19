import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useAppSelector } from "../../../redux/hooks"; // Giả sử bạn có hooks redux
import { userApis } from "../../../services/apiServices"; // Đảm bảo thêm hàm createGuardian vào đây
import { AuthStackParamList } from "../../../routes/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Guardian">;

// Màu chủ đạo (Xanh da trời)
const COLORS = {
  background: "#F0F8FF", // AliceBlue
  white: "#FFFFFF",
  primary: "#00B4D8", // Sky Blue
  primaryDark: "#0077B6", // Darker Blue
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#E0E0E0",
  error: "#FF5252",
  inputBg: "#F5F9FA",
};

const GuardianScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student } = route.params;
  const currentUser = useAppSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<Date | null>(null); // Ngày sinh người đón
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relationship, setRelationship] = useState(""); // Vd: Bà
  const [relationshipDetail, setRelationshipDetail] = useState(""); // Vd: Bà nội
  const [pickUpDate, setPickUpDate] = useState<Date>(new Date()); // Ngày đón
  const [note, setNote] = useState("");

  // --- DatePicker Visibility States ---
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showPickUpDatePicker, setShowPickUpDatePicker] = useState(false);

  // --- Helper Functions ---

  // Format Date YYYY-MM-DD (cho API)
  const formatDateApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Format Date DD/MM/YYYY (cho hiển thị)
  const formatDateDisplay = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const onChangeDob = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDobPicker(Platform.OS === "ios");
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const onChangePickUpDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPickUpDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setPickUpDate(selectedDate);
    }
  };

  const handleCreateGuardian = async () => {
    // 1. Validation cơ bản
    if (!fullName || !phoneNumber || !relationship || !dob) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ: Tên, Ngày sinh, SĐT và Mối quan hệ.");
      return;
    }

    // 2. Chuẩn bị dữ liệu payload
    const payload = {
      fullName,
      dob: formatDateApi(dob),
      phoneNumber,
      relationship,
      relationshipDetail: relationshipDetail || relationship,
      studentId: student._id,
      parentId: currentUser?._id || "unknown_parent_id",
      pickUpDate: formatDateApi(pickUpDate),
      note,
      createdBy: currentUser?.email || "parent_app",
      updatedBy: currentUser?.email || "parent_app",
      active: true,
    };

    // 3. Gọi API
    setLoading(true);
    try {
      await userApis.createGuardian(payload);
      Alert.alert("Thành công", "Đã đăng ký người đưa đón thành công!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Create Guardian Error:", error);
      Alert.alert("Lỗi", "Không thể tạo đăng ký. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primaryDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đăng ký người đưa đón</Text>
            <View style={{width: 24}} /> 
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Section: Thông tin học sinh (Read only) */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Thông tin bé</Text>
            <View style={styles.rowInfo}>
              <MaterialCommunityIcons name="face-man-profile" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{student.fullName}</Text>
            </View>
            <View style={styles.rowInfo}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>Mã HS: {student.studentCode}</Text>
            </View>
          </View>

          {/* Section: Form Đăng ký */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Thông tin người đón</Text>

            {/* Họ tên */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Thị Hoa"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Ngày sinh & SĐT (Chung 1 hàng) */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Ngày sinh <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowDobPicker(true)}>
                  <Text style={dob ? styles.dateText : styles.placeholderText}>
                    {dob ? formatDateDisplay(dob) : "Chọn ngày"}
                  </Text>
                  <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Số điện thoại <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="0912..."
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {/* Quan hệ */}
            <View style={styles.rowInputs}>
                 <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Quan hệ <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="VD: Bà"
                        value={relationship}
                        onChangeText={setRelationship}
                    />
                </View>
                 <View style={[styles.inputGroup, { flex: 1.5 }]}>
                    <Text style={styles.label}>Chi tiết</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="VD: Bà nội của bé"
                        value={relationshipDetail}
                        onChangeText={setRelationshipDetail}
                    />
                </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Thời gian & Ghi chú</Text>

             {/* Ngày đón */}
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày đón <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickUpDatePicker(true)}>
                  <Text style={styles.dateText}>
                    {formatDateDisplay(pickUpDate)}
                  </Text>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Ghi chú */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="VD: Đón bé về sớm lúc 16h00"
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateGuardian}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.submitButtonText}>Gửi đăng ký</Text>
                )}
            </TouchableOpacity>

          </View>
        </ScrollView>

        {/* Date Pickers Modal */}
        {showDobPicker && (
          <DateTimePicker
            value={dob || new Date(1990, 0, 1)} // Default date for easier picking
            mode="date"
            display="default"
            onChange={onChangeDob}
            maximumDate={new Date()} // Không sinh nhật trong tương lai
          />
        )}

        {showPickUpDatePicker && (
          <DateTimePicker
            value={pickUpDate}
            mode="date"
            display="default"
            onChange={onChangePickUpDate}
            minimumDate={new Date()} // Không đón trong quá khứ (tùy logic)
          />
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  // Card thông tin bé
  infoCard: {
    backgroundColor: "#E1F5FE", // Xanh rất nhạt
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 10,
    fontWeight: "500",
  },
  // Form styles
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Date Input custom style
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 10,
    marginBottom: 20,
  },
  // Button
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
});

export default GuardianScreen;