import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Hoặc react-native-vector-icons
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

// Redux
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import { logout } from "../../../redux/authSlice";

// Services & Types
import { teacherApis } from "../../../services/apiServices";
import {
  TeacherProfile,
  UpdateTeacherPayload,
  ChangeTeacherPasswordPayload
} from "../../../types/teacher";

// Màu chủ đạo (Xanh da trời)
const COLORS = {
  primary: "#00B4D8",
  primaryDark: "#0077B6",
  background: "#F0F8FF",
  white: "#FFFFFF",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#E0E0E0",
  inputBg: "#F5F9FA",
  editBg: "#E1F5FE",
  success: "#4CAF50",
  error: "#F44336",
};

const Setting = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Lấy thông tin user từ Redux (giả sử user.staff lưu ID của giáo viên)
  const currentUser = useAppSelector((state: any) => state.auth.user);

  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- State: Chỉnh sửa thông tin ---
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateTeacherPayload>({
    fullName: "",
    dob: "",
    IDCard: "",
    gender: "",
    phoneNumber: "",
    address: "",
    nation: "",
    religion: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  // DatePicker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDob, setSelectedDob] = useState<Date>(new Date());

  // --- State: Đổi mật khẩu ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passLoading, setPassLoading] = useState(false);

  // --- 1. Fetch Data ---
  const fetchProfile = async () => {
    // Lấy ID giáo viên từ redux (currentUser.staff hoặc currentUser._id tuỳ cấu trúc)
    const teacherId = currentUser?.staff || currentUser?._id;

    if (!teacherId) {
      setLoading(false);
      return;
    }

    try {
      const res = await teacherApis.getTeacherInfo(teacherId);
      if (res && res.success) {
        setProfile(res.data);

        // Format dữ liệu edit ban đầu
        setEditData({
          fullName: res.data.fullName || "",
          dob: res.data.dob || new Date().toISOString(),
          IDCard: res.data.IDCard || "",
          gender: res.data.gender || "",
          phoneNumber: res.data.phoneNumber || "",
          address: res.data.address || "",
          nation: res.data.nation || "",
          religion: res.data.religion || "",
        });

        if (res.data.dob) {
          setSelectedDob(new Date(res.data.dob));
        }
      }
    } catch (error) {
      // Xử lý lỗi im lặng hoặc Alert nhẹ
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  // --- 2. Xử lý Logout ---
  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        onPress: () => {
          dispatch(logout());
          // Reset navigation về Login (tuỳ vào cấu trúc nav của bạn)
          // navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); 
        },
      },
    ]);
  };

  // --- 3. Xử lý Cập nhật thông tin ---
  const handleSaveProfile = async () => {
    if (!profile) return;

    setUpdateLoading(true);
    try {
      // Convert date sang ISO string trước khi gửi
      const payload = { ...editData, dob: selectedDob.toISOString() };

      await teacherApis.updateTeacher(profile._id, payload);

      Alert.alert("Thành công", "Cập nhật thông tin thành công!");
      setIsEditing(false);
      fetchProfile(); // Refresh data
    } catch (error) {
      Alert.alert("Lỗi", "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // --- 4. Xử lý Đổi mật khẩu ---
  const handleChangePassword = async () => {
    if (!profile) return;

    if (!passwordData.newPassword || !passwordData.oldPassword) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ mật khẩu cũ và mới.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setPassLoading(true);
    try {
      const payload: ChangeTeacherPasswordPayload = {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      };

      const res = await teacherApis.changeTeacherPassword(profile._id, payload);

      if (res && res.success) {
        Alert.alert("Thành công", "Đổi mật khẩu thành công!");
        setShowPasswordModal(false);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        Alert.alert("Lỗi", res.message || "Đổi mật khẩu thất bại.");
      }
    } catch (error: any) {
      let msg = error;
      if (error.response?.data?.message) msg = error.response.data.message;
      Alert.alert("Lỗi", msg);
    } finally {
      setPassLoading(false);
    }
  };

  // --- Helpers ---
  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) {
      setSelectedDob(date);
      setEditData(prev => ({ ...prev, dob: date.toISOString() }));
    }
  };

  // Component render input field
  const renderInfoItem = (
    label: string,
    value: string,
    icon: string,
    fieldKey?: keyof UpdateTeacherPayload,
    editable = false,
    isDate = false
  ) => {
    const isFieldEditable = !!(isEditing && editable && fieldKey);

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.inputContainer,
            isFieldEditable ? styles.editingInput : styles.disabledInput,
          ]}
        >
          <MaterialCommunityIcons
            name={icon as any}
            size={20}
            color={COLORS.primary}
            style={styles.inputIcon}
          />
          {isDate ? (
            <TouchableOpacity
              disabled={!isFieldEditable}
              onPress={() => setShowDatePicker(true)}
              style={{ flex: 1, paddingVertical: 12 }}
            >
              <Text style={[
                styles.inputText,
                !isFieldEditable && styles.disabledText
              ]}>
                {new Date(selectedDob).toLocaleDateString("vi-VN")}
              </Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              style={[styles.input, !isFieldEditable && styles.disabledText]}
              value={isFieldEditable && fieldKey ? editData[fieldKey] : value}
              editable={isFieldEditable}
              onChangeText={(text) => {
                if (fieldKey) {
                  setEditData((prev) => ({ ...prev, [fieldKey]: text }));
                }
              }}
              placeholder={`Nhập ${label.toLowerCase()}`}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ giáo viên</Text>

        {/* Nút Edit */}
        {!loading && profile && (
          <TouchableOpacity
            onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            style={styles.editButton}
            disabled={updateLoading}
          >
            {updateLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <MaterialCommunityIcons
                name={isEditing ? "check" : "pencil"}
                size={24}
                color={isEditing ? COLORS.success : COLORS.primary}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : !profile ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="account-alert" size={50} color={COLORS.textLight} />
          <Text style={styles.errorText}>Không tìm thấy thông tin</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "T"}
              </Text>
            </View>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileCode}>{profile.staffCode}</Text>
          </View>

          {/* Thông tin cá nhân */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
              {isEditing && <Text style={styles.editingTag}>Đang chỉnh sửa</Text>}
            </View>

            {/* Editable Fields */}
            {renderInfoItem("Họ và tên", profile.fullName, "account", "fullName", true)}
            {renderInfoItem("Ngày sinh", profile.dob, "calendar", "dob", true, true)}
            {renderInfoItem("Số điện thoại", profile.phoneNumber, "phone", "phoneNumber", true)}
            {renderInfoItem("CMND/CCCD", profile.IDCard, "card-account-details", "IDCard", true)}
            {renderInfoItem("Giới tính", profile.gender, "gender-male-female", "gender", true)}
            {renderInfoItem("Địa chỉ", profile.address, "map-marker", "address", true)}
            {renderInfoItem("Dân tộc", profile.nation, "flag-variant", "nation", true)}
            {renderInfoItem("Tôn giáo", profile.religion, "book-open-page-variant", "religion", true)}

            {/* Read-only Fields */}
            {renderInfoItem("Email", profile.email, "email", undefined, false)}

            {/* Nút Hủy Edit */}
            {isEditing && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  // Reset data
                  setEditData({
                    fullName: profile.fullName,
                    dob: profile.dob,
                    IDCard: profile.IDCard,
                    gender: profile.gender,
                    phoneNumber: profile.phoneNumber,
                    address: profile.address,
                    nation: profile.nation,
                    religion: profile.religion,
                  });
                  if (profile.dob) setSelectedDob(new Date(profile.dob));
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bảo mật */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Bảo mật</Text>
            <TouchableOpacity
              style={styles.changePassButton}
              onPress={() => setShowPasswordModal(true)}
              disabled={isEditing}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name="lock-reset" size={24} color={COLORS.primary} />
                <Text style={styles.changePassText}>Đổi mật khẩu</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>

        </ScrollView>
      )}

      {/* --- Date Picker --- */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDob}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      {/* --- Modal Đổi Mật Khẩu --- */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu cũ</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                placeholder="Nhập mật khẩu hiện tại"
                value={passwordData.oldPassword}
                onChangeText={(t) => setPasswordData((p) => ({ ...p, oldPassword: t }))}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                placeholder="Nhập mật khẩu mới"
                value={passwordData.newPassword}
                onChangeText={(t) => setPasswordData((p) => ({ ...p, newPassword: t }))}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                placeholder="Nhập lại mật khẩu mới"
                value={passwordData.confirmPassword}
                onChangeText={(t) => setPasswordData((p) => ({ ...p, confirmPassword: t }))}
              />
            </View>

            <TouchableOpacity
              style={styles.savePassButton}
              onPress={handleChangePassword}
              disabled={passLoading}
            >
              {passLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.savePassText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  backButton: { padding: 4 },
  editButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.primaryDark },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", opacity: 0.7 },
  errorText: { marginTop: 10, color: COLORS.textSecondary, fontSize: 16 },

  scrollContent: { paddingBottom: 40 },

  // Avatar
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: COLORS.white,
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#E1F5FE",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileCode: {
    fontSize: 14,
    color: COLORS.textSecondary,
    backgroundColor: "#E0F7FA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },

  // Sections
  sectionContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    textTransform: "uppercase",
  },
  editingTag: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  editingInput: {
    backgroundColor: "#FFFFFF",
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 10,
  },
  inputText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },

  cancelButton: {
    alignSelf: "center",
    padding: 10,
    marginTop: -10,
  },
  cancelButtonText: {
    color: COLORS.error,
    fontWeight: "600",
  },

  // Change Password
  changePassButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingVertical: 8,
  },
  changePassText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginLeft: 10,
  },

  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  modalInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  savePassButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  savePassText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
});

export default Setting;