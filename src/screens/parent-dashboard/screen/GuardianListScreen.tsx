import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  RefreshControl,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useIsFocused } from "@react-navigation/native"; // Import hook này để refresh khi quay lại
import { useAppSelector } from "../../../redux/hooks";
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "GuardianList">;

// Type dựa trên response JSON
type Guardian = {
  _id?: string; // Có thể có hoặc không trong response mẫu, nhưng nên có để làm key
  fullName: string;
  dob: string;
  phoneNumber: string;
  relationship: string;
  relationshipDetail?: string;
  pickUpDate: string;
  note?: string;
  active: boolean;
};

const COLORS = {
  background: "#F0F8FF",
  white: "#FFFFFF",
  primary: "#00B4D8",
  primaryDark: "#0077B6",
  accent: "#FFA726",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#E0E0E0",
  success: "#4CAF50",
  error: "#F44336",
  inputBg: "#F5F9FA",
  overlay: "rgba(0,0,0,0.5)",
};

const GuardianListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student: initialStudent } = route.params;
  const isFocused = useIsFocused(); // Hook kiểm tra màn hình có đang được focus không
  
  const currentUser = useAppSelector((state) => state.auth.user);
  const studentList = currentUser?.students && currentUser.students.length > 0 
    ? currentUser.students 
    : [initialStudent];

  const [selectedStudent, setSelectedStudent] = useState(initialStudent);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Helper format ngày hiển thị
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const fetchGuardians = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApis.getGuardiansByStudent(selectedStudent._id);
      console.log("🚀 ~ GuardianListScreen ~ res:", res)
      if (res && res.data) {
        setGuardians(res.data);
      } else {
        setGuardians([]);
      }
    } catch (error) {
      setGuardians([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStudent._id]);

  useEffect(() => {
    if (isFocused) {
      fetchGuardians();
    }
  }, [isFocused, fetchGuardians]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuardians();
  };

  const handleCreateNew = () => {
    navigation.navigate("Guardian", { student: selectedStudent });
  };

  const renderGuardianItem = ({ item, index }: { item: Guardian; index: number }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="account-check" size={24} color={COLORS.primary} />
          <Text style={styles.guardianName}>{item.fullName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.active ? "#E8F5E9" : "#FFEBEE" }]}>
          <Text style={[styles.statusText, { color: item.active ? COLORS.success : COLORS.error }]}>
            {item.active ? "Đang hiệu lực" : "Hết hạn"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.rowInfo}>
          <MaterialCommunityIcons name="account-heart-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.infoLabel}>Quan hệ:</Text>
          <Text style={styles.infoValue}>{item.relationship} {item.relationshipDetail ? `(${item.relationshipDetail})` : ""}</Text>
        </View>

        <View style={styles.rowInfo}>
          <MaterialCommunityIcons name="phone-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.infoLabel}>SĐT:</Text>
          <Text style={styles.infoValue}>{item.phoneNumber}</Text>
        </View>
        
        <View style={styles.rowInfo}>
          <MaterialCommunityIcons name="cake-variant-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.infoLabel}>Ngày sinh:</Text>
          <Text style={styles.infoValue}>{formatDateDisplay(item.dob)}</Text>
        </View>

        <View style={styles.rowInfo}>
          <MaterialCommunityIcons name="calendar-clock" size={18} color={COLORS.accent} />
          <Text style={styles.infoLabel}>Ngày đón:</Text>
          <Text style={[styles.infoValue, { color: COLORS.accent, fontWeight: '600' }]}>
            {formatDateDisplay(item.pickUpDate)}
          </Text>
        </View>

        {item.note ? (
          <View style={styles.noteContainer}>
            <MaterialCommunityIcons name="note-text-outline" size={18} color={COLORS.textLight} />
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách người đưa đón</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.container}>
        {/* Student Selector */}
        <TouchableOpacity 
            style={styles.studentSelector} 
            onPress={() => studentList.length > 1 && setShowStudentModal(true)}
            disabled={studentList.length <= 1}
        >
            <View style={styles.studentInfo}>
                <Text style={styles.studentLabel}>Học sinh:</Text>
                <Text style={styles.studentName}>{selectedStudent.fullName}</Text>
            </View>
            {studentList.length > 1 && (
                <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.primary} />
            )}
        </TouchableOpacity>

        {/* List */}
        {loading && !refreshing ? (
           <View style={styles.loadingContainer}>
             <ActivityIndicator size="large" color={COLORS.primary} />
           </View>
        ) : (
          <FlatList
            data={guardians}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderGuardianItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="account-group-outline" size={60} color={COLORS.border} />
                    <Text style={styles.emptyText}>Chưa có người đăng ký đưa đón nào.</Text>
                </View>
            }
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={handleCreateNew}>
            <MaterialCommunityIcons name="plus" size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Modal Chọn bé (Tái sử dụng logic giống GuardianScreen) */}
      <Modal
          visible={showStudentModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStudentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn bé</Text>
                <TouchableOpacity onPress={() => setShowStudentModal(false)}>
                   <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={studentList}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                        styles.studentItem, 
                        selectedStudent._id === item._id && styles.selectedStudentItem
                    ]}
                    onPress={() => {
                      setSelectedStudent(item);
                      setShowStudentModal(false);
                    }}
                  >
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.itemStudentName}>{item.fullName}</Text>
                        <Text style={styles.itemStudentCode}>{item.studentCode}</Text>
                    </View>
                    {selectedStudent._id === item._id && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
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
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.primaryDark },
  
  container: { flex: 1 },
  
  // Student Selector Bar
  studentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center' },
  studentLabel: { fontSize: 14, color: COLORS.textSecondary, marginRight: 8 },
  studentName: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark },

  // List
  listContainer: { padding: 16, paddingBottom: 80 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: COLORS.textSecondary, fontStyle: 'italic' },

  // Card Style
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  guardianName: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: COLORS.inputBg, marginBottom: 12 },
  
  cardBody: {},
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 8, marginRight: 4, width: 80 },
  infoValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500', flex: 1 },
  
  noteContainer: { 
    flexDirection: 'row', 
    marginTop: 8, 
    backgroundColor: COLORS.inputBg, 
    padding: 8, 
    borderRadius: 8 
  },
  noteText: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 8, fontStyle: 'italic', flex: 1 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  // Modal Styles (Copy from GuardianScreen)
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: COLORS.white, width: '100%', borderRadius: 16, padding: 16, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primaryDark },
  studentItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.inputBg },
  selectedStudentItem: { backgroundColor: "#E1F5FE", borderRadius: 8 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  itemStudentName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  itemStudentCode: { fontSize: 14, color: COLORS.textSecondary },
});

export default GuardianListScreen;