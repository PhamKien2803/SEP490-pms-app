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
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// Import Redux hooks và action logout
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import { logout } from "../../../redux/authSlice";
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";
import { ChangePasswordPayload, ParentProfile, UpdateParentPayload } from "../../../types/auth";
// Import Types từ file parent.ts

type Props = NativeStackScreenProps<AuthStackParamList, "ParentProfile">;

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

const ParentProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch(); // Sử dụng dispatch cho logout
  const currentUser = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- State cho việc chỉnh sửa thông tin ---
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateParentPayload>({
    phoneNumber: "",
    IDCard: "",
    job: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  // --- State cho việc đổi mật khẩu ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordPayload>({
    oldPassword: "",
    newPassword: "",
  });
  const [passLoading, setPassLoading] = useState(false);

  // --- 1. Hàm lấy thông tin phụ huynh ---
  const fetchProfile = async () => {
    const parentIdToFetch = currentUser?.parent || currentUser?._id;
    
    if (!parentIdToFetch) {
        setLoading(false);
        return;
    }

    try {
      const res = await userApis.getParentInfo(parentIdToFetch);
      if (res && res.success) {
        setProfile(res.data);
        // Khởi tạo dữ liệu cho form edit
        setEditData({
          phoneNumber: res.data.phoneNumber || "",
          IDCard: res.data.IDCard || "",
          job: res.data.job || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  // --- 2. Xử lý cập nhật thông tin ---
  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setUpdateLoading(true);
    try {
      await userApis.updateParent(profile._id, editData);
      
      Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân!");
      setIsEditing(false);
      fetchProfile(); // Load lại dữ liệu mới nhất
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Lỗi", "Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // --- 3. Xử lý đổi mật khẩu ---
  const handleChangePassword = async () => {
    if (!profile) return;
    
    if (passwordData.newPassword.length < 6) {
        Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
        return;
    }

    setPassLoading(true);
    try {
        const payload: ChangePasswordPayload = {
            oldPassword: passwordData.oldPassword, // Gửi kèm nếu backend yêu cầu verify
            newPassword: passwordData.newPassword,
        };
        
        const res = await userApis.changeParentPassword(profile._id, payload);
        
        if (res && res.success) {
            Alert.alert("Thành công", "Đổi mật khẩu thành công!");
            setShowPasswordModal(false);
            // Reset form
            setPasswordData({ oldPassword: "", newPassword: ""});
        } else {
             Alert.alert("Lỗi", res.message || "Đổi mật khẩu thất bại.");
        }
    } catch (error: any) {
        let msg = "Đã có lỗi xảy ra.";
        if(error.response?.data?.message) msg = error.response.data.message;
        Alert.alert("Lỗi", msg);
    } finally {
        setPassLoading(false);
    }
  };

  // --- 4. Xử lý Đăng xuất ---
  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: () => {
            dispatch(logout());
            // Reset stack về màn hình Login
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]
    );
  };

  // --- Helper Render Input ---
  const renderInfoItem = (
      label: string, 
      value: string, 
      icon: string, 
      fieldKey?: keyof UpdateParentPayload, // Key để map với state editData
      editable = false // Có được phép sửa hay không
  ) => {
    // Ép kiểu boolean để tránh lỗi Type mismatch
    const isFieldEditable = !!(isEditing && editable && fieldKey);

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[
                styles.inputContainer, 
                isFieldEditable ? styles.editingInput : styles.disabledInput
            ]}>
                <MaterialCommunityIcons name={icon as any} size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, !isFieldEditable && styles.disabledText]}
                    // Kiểm tra fieldKey tồn tại để truy cập editData an toàn
                    value={(isFieldEditable && fieldKey) ? editData[fieldKey] : value}
                    editable={isFieldEditable}
                    onChangeText={(text) => {
                        if (fieldKey) {
                            setEditData(prev => ({ ...prev, [fieldKey]: text }));
                        }
                    }}
                    placeholder={isFieldEditable ? `Nhập ${label.toLowerCase()}` : "Chưa cập nhật"}
                />
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
        <Text style={styles.headerTitle}>Hồ sơ phụ huynh</Text>
        
        {/* Nút Edit / Save */}
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

      {/* Body */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : !profile ? (
        <View style={styles.errorContainer}>
           <MaterialCommunityIcons name="account-off-outline" size={60} color={COLORS.textLight} />
           <Text style={styles.errorText}>Không tìm thấy thông tin</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
             <MaterialCommunityIcons name="logout" size={24} color={COLORS.white} />
             <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
               <Text style={styles.avatarText}>
                 {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "P"}
               </Text>
            </View>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileCode}>{profile.parentCode}</Text>
          </View>

          {/* Thông tin chung */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Thông tin chung</Text>
                {isEditing && <Text style={styles.editingTag}>Đang chỉnh sửa</Text>}
            </View>

            {/* Các trường Read-only */}
            {renderInfoItem("Họ và tên", profile.fullName, "account", undefined, false)}
            {renderInfoItem("Email", profile.email, "email", undefined, false)}
            {renderInfoItem("Giới tính", profile.gender, "gender-male-female", undefined, false)}

            {/* Các trường Editable */}
            {renderInfoItem("Số điện thoại", profile.phoneNumber, "phone", "phoneNumber", true)}
            {renderInfoItem("CMND/CCCD", profile.IDCard, "card-account-details", "IDCard", true)}
            {renderInfoItem("Nghề nghiệp", profile.job || "", "briefcase", "job", true)}
            
            {/* Nút Hủy Edit */}
            {isEditing && (
                <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => {
                        setIsEditing(false);
                        // Reset lại dữ liệu edit về ban đầu
                        setEditData({ 
                            phoneNumber: profile.phoneNumber,
                            IDCard: profile.IDCard,
                            job: profile.job || ""
                        });
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
                disabled={isEditing} // Không cho đổi pass khi đang edit info
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialCommunityIcons name="lock-reset" size={24} color={COLORS.primary} />
                    <Text style={styles.changePassText}>Đổi mật khẩu</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* Danh sách con */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Danh sách con</Text>
            {profile.students && profile.students.length > 0 ? (
              profile.students.map((child: any) => (
                <View key={child._id} style={styles.childCard}>
                  <Image 
                    source={{ uri: child.imageStudent || "https://via.placeholder.com/100" }} 
                    style={styles.childImage} 
                  />
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.fullName}</Text>
                    <Text style={styles.childDetail}>Mã HS: {child.studentCode}</Text>
                    <Text style={styles.childDetail}>
                      Ngày sinh: {new Date(child.dob).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
               <Text style={styles.noChildText}>Chưa có thông tin học sinh</Text>
            )}
          </View>

          {/* --- NÚT ĐĂNG XUẤT --- */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
             <MaterialCommunityIcons name="logout" size={24} color={COLORS.white} />
             <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>

        </ScrollView>
      )}

      {/* --- MODAL ĐỔI MẬT KHẨU --- */}
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
                        onChangeText={(t) => setPasswordData(p => ({...p, oldPassword: t}))}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mật khẩu mới</Text>
                    <TextInput 
                        style={styles.modalInput} 
                        secureTextEntry 
                        placeholder="Nhập mật khẩu mới"
                        value={passwordData.newPassword}
                        onChangeText={(t) => setPasswordData(p => ({...p, newPassword: t}))}
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

  // Avatar Section
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
    overflow: 'hidden',
  },

  // General Section
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
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 16
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
      fontWeight: '600',
      backgroundColor: '#E8F5E9',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4
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
    height: 48,
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
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  cancelButton: {
      alignSelf: 'center',
      padding: 10,
      marginTop: -10
  },
  cancelButtonText: {
      color: COLORS.error,
      fontWeight: '600'
  },

  // Change Password
  changePassButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
      paddingVertical: 8
  },
  changePassText: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.textPrimary,
      marginLeft: 10
  },

  // Child Card
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FDFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1F5FE",
    marginBottom: 10,
  },
  childImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: COLORS.border,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  childDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  noChildText: {
    fontStyle: "italic",
    color: COLORS.textLight,
    textAlign: "center",
    padding: 10,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
  },
  modalContainer: {
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      elevation: 5
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.primaryDark
  },
  modalInput: {
      backgroundColor: COLORS.inputBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16
  },
  savePassButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 10
  },
  savePassText: {
      color: COLORS.white,
      fontWeight: '700',
      fontSize: 16
  }
});

export default ParentProfileScreen;