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
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppSelector } from "../../../redux/hooks";
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";
import { ConfirmTuitionPayload } from "../../../types/auth";

// Kích hoạt LayoutAnimation trên Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type Props = NativeStackScreenProps<AuthStackParamList, "Tuition">;

// --- Types ---
type RevenueItem = {
  revenueId: string;
  revenueCode: string;
  revenueName: string;
  amount: number;
  source: string;
};

type TuitionRecord = {
  tuitionId: string;
  tuitionName: string;
  month: number;
  totalAmount: number;
  state: string;
  studentId?: string;
  studentName?: string;
  schoolYear: string;
  receiptCode: string;
  receiptName: string;
  revenueList: RevenueItem[];
  createdAt: string;
  enrollementId?: string;
};

type TuitionResponse = {
  message: string;
  data: TuitionRecord[];
  totalAmount: number;
};

// --- Colors ---
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
  success: "#4CAF50", // Green
  error: "#F44336",   // Red
  warning: "#FF9800", // Orange
  inputBg: "#F5F9FA",
  overlay: "rgba(0,0,0,0.5)",
};

const TuitionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student: initialStudent } = route.params;
  const currentUser = useAppSelector((state) => state.auth.user);
  
  // Danh sách con của phụ huynh
  const studentList = currentUser?.students && currentUser.students.length > 0 
    ? currentUser.students 
    : [initialStudent];

  const [selectedStudent, setSelectedStudent] = useState(initialStudent);
  const [allTuitions, setAllTuitions] = useState<TuitionRecord[]>([]);
  const [filteredTuitions, setFilteredTuitions] = useState<TuitionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // State quản lý expand/collapse
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // State quản lý loading khi thanh toán
  const [paymentLoading, setPaymentLoading] = useState(false);

  // --- Helpers ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusColor = (state: string) => {
    const normalizedState = state?.toLowerCase() || "";
    if (normalizedState === "đã thanh toán") return COLORS.success;
    if (normalizedState === "chưa thanh toán") return COLORS.error;
    return COLORS.warning;
  };

  // --- Fetch Data ---
  const fetchTuitions = useCallback(async () => {
    if (!currentUser?.parent) return;
    
    setLoading(true);
    try {
      const res: TuitionResponse = await userApis.getTuitionByParent(currentUser.parent);
      if (res && res.data) {
        setAllTuitions(res.data);
      } else {
        setAllTuitions([]);
      }
    } catch (error) {
      setAllTuitions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.parent]);

  useEffect(() => {
    fetchTuitions();
  }, [fetchTuitions]);

  // Handle reload when coming back from Payment (Success case)
  useEffect(() => {
    // @ts-ignore
    if (route.params?.shouldRefresh) {
        fetchTuitions();
        navigation.setParams({ shouldRefresh: undefined } as any);
    }
  }, [route.params, fetchTuitions]);

  useEffect(() => {
    if (allTuitions.length > 0) {
      // Kiểm tra xem trong danh sách có item nào có studentId không
      const hasStudentId = allTuitions.some(t => t.studentId);
      
      if (hasStudentId) {
        // Nếu có, lọc theo bé đang chọn
        const filtered = allTuitions.filter(t => t.studentId === selectedStudent._id);
        setFilteredTuitions(filtered);
      } else {
        // Nếu API trả về data không có studentId (như phí nhập học), hiển thị tất cả
        setFilteredTuitions(allTuitions);
      }
    } else {
        setFilteredTuitions([]);
    }
  }, [selectedStudent, allTuitions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTuitions();
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  // --- Handle Payment ---
  const handlePayment = async (item?: TuitionRecord) => {
    const itemsToPay = item ? [item] : filteredTuitions.filter(t => t.state === "Chưa thanh toán");

    if (itemsToPay.length === 0) {
      Alert.alert("Thông báo", "Không có khoản phí nào cần thanh toán.");
      return;
    }

    const totalPayAmount = itemsToPay.reduce((sum, t) => sum + t.totalAmount, 0);
    // Lấy enrollementId nếu có (ưu tiên item lẻ, hoặc lấy cái đầu tiên của list)
    const enrollementId = item ? item.enrollementId : itemsToPay[0]?.enrollementId;
    
    if (!currentUser?.parent) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin phụ huynh.");
        return;
    }

    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn muốn thanh toán qua PayOS?\nSố tiền: ${formatCurrency(totalPayAmount)}`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            setPaymentLoading(true);
            try {
              const payload: ConfirmTuitionPayload = {
                parentId: currentUser.parent,
                totalAmount: totalPayAmount,
                enrollementId: enrollementId,
              };

              const res = await userApis.confirmTuition(payload);
              
              if (res.success && res.data?.paymentUrl) {
                 setPaymentLoading(false);
                 // @ts-ignore
                 navigation.navigate('PaymentWebView', { url: res.data.paymentUrl });
              } else {
                 throw new Error(res.message || "Không lấy được link thanh toán từ hệ thống.");
              }

            } catch (error: any) {
              setPaymentLoading(false);
              let errorMessage = "Có lỗi xảy ra khi tạo giao dịch.";
              if (error.response && error.response.data && error.response.data.message) {
                  errorMessage = error.response.data.message;
              } else if (error.message) {
                  errorMessage = error.message;
              }
              Alert.alert("Lỗi thanh toán", errorMessage);
            }
          }
        }
      ]
    );
  };

  // --- Logic kiểm tra hiển thị Student Selector ---
  // Hiển thị nếu: Dữ liệu Rỗng HOẶC Có ít nhất một bản ghi chứa studentId
  const shouldShowStudentSelector = allTuitions.length === 0 || allTuitions.some(t => t.studentId);

  // --- Render Item ---
  const renderTuitionItem = ({ item }: { item: TuitionRecord }) => {
    const isExpanded = expandedId === item.tuitionId;
    const statusColor = getStatusColor(item.state);
    const isUnpaid = item.state === "Chưa thanh toán";

    return (
      <View style={styles.card}>
        <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => toggleExpand(item.tuitionId)}
            style={styles.cardHeader}
        >
            <View style={styles.headerRow}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="cash-multiple" size={24} color={COLORS.white} />
                </View>
                <View style={{flex: 1, marginLeft: 12}}>
                    <Text style={styles.tuitionName}>{item.tuitionName}</Text>
                    <Text style={styles.tuitionCode}>Mã phiếu: {item.receiptCode}</Text>
                    
                    {/* CHỈ HIỂN THỊ TÊN HỌC SINH NẾU CÓ TRONG DATA */}
                    {(item.studentName || item.studentId) && (
                        <Text style={styles.studentNameText}>
                           Học sinh: {item.studentName || selectedStudent.fullName}
                        </Text>
                    )}
                    
                </View>
                <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
                    <Text style={styles.monthText}>Tháng {item.month}</Text>
                </View>
            </View>

            <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}> 
                    <Text style={[styles.statusText, { color: statusColor }]}>{item.state}</Text>
                </View>
                <MaterialCommunityIcons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color={COLORS.textLight} 
                />
            </View>
        </TouchableOpacity>

        {isExpanded && (
            <View style={styles.detailsContainer}>
                <View style={styles.divider} />
                <Text style={styles.detailsTitle}>Chi tiết khoản thu:</Text>
                {item.revenueList.map((rev, index) => (
                    <View key={index} style={styles.revenueItem}>
                        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                            <MaterialCommunityIcons name="circle-small" size={20} color={COLORS.primary} />
                            <Text style={styles.revenueName}>{rev.revenueName}</Text>
                        </View>
                        <Text style={styles.revenueAmount}>{formatCurrency(rev.amount)}</Text>
                    </View>
                ))}
                
                <View style={styles.summaryFooter}>
                   <Text style={styles.summaryLabel}>Tổng cộng:</Text>
                   <Text style={styles.summaryValue}>{formatCurrency(item.totalAmount)}</Text>
                </View>

                {isUnpaid && (
                  <TouchableOpacity 
                    style={styles.payButton}
                    onPress={() => handlePayment(item)}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="credit-card-outline" size={20} color={COLORS.white} />
                        <Text style={styles.payButtonText}>Thanh toán ngay</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
            </View>
        )}
      </View>
    );
  };

  const totalUnpaid = filteredTuitions
    .filter(t => t.state === "Chưa thanh toán")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin học phí</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.container}>
        
        {/* Student Selector - CHỈ HIỂN THỊ KHI CẦN THIẾT */}
        {shouldShowStudentSelector && (
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
        )}

        {/* Summary Card */}
        {filteredTuitions.length > 0 && (
             <View style={styles.summaryCard}>
                <View style={styles.summaryContent}>
                  <View>
                      <Text style={styles.summaryCardLabel}>Cần thanh toán</Text>
                      <Text style={styles.summaryCardValue}>{formatCurrency(totalUnpaid)}</Text>
                  </View>
                  <MaterialCommunityIcons name="wallet-outline" size={40} color={COLORS.white} style={{opacity: 0.8}} />
                </View>

                {totalUnpaid > 0 && (
                  <TouchableOpacity 
                    style={styles.payAllButton}
                    onPress={() => handlePayment()} 
                    disabled={paymentLoading}
                  >
                    <Text style={styles.payAllButtonText}>
                      {paymentLoading ? "Đang xử lý..." : "Tiến hành thanh toán tất cả"}
                    </Text>
                    {!paymentLoading && <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                )}
             </View>
        )}

        {/* List */}
        {loading && !refreshing ? (
           <View style={styles.loadingContainer}>
             <ActivityIndicator size="large" color={COLORS.primary} />
           </View>
        ) : (
          <FlatList
            data={filteredTuitions}
            keyExtractor={(item) => item.tuitionId}
            renderItem={renderTuitionItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="file-document-outline" size={60} color={COLORS.border} />
                    <Text style={styles.emptyText}>Không có dữ liệu học phí.</Text>
                </View>
            }
          />
        )}
      </View>

      {/* Modal Chọn bé */}
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

  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  summaryCardLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600', opacity: 0.9 },
  summaryCardValue: { color: COLORS.white, fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  
  payAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    borderRadius: 30,
  },
  payAllButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8,
  },

  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: COLORS.textSecondary, fontStyle: 'italic' },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center'
  },
  tuitionName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  tuitionCode: { fontSize: 12, color: COLORS.textSecondary },
  studentNameText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontStyle: 'italic' },
  totalAmount: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark },
  monthText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },

  detailsContainer: {
    backgroundColor: COLORS.inputBg,
    padding: 16,
    paddingTop: 0,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  detailsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  revenueItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  revenueName: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  revenueAmount: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  summaryFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border, borderStyle: 'dashed',
    marginBottom: 16,
  },
  summaryLabel: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  summaryValue: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark },

  payButton: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 8,
  },
  payButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },

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

export default TuitionScreen;