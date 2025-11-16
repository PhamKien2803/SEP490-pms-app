import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
// Thêm Picker
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";

// --- Định nghĩa Typescript (Giữ nguyên) ---

type StudentInfo = {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  healthCertId: string;
};

type PhysicalDevelopment = {
  height: number;
  weight: number;
  bodyMassIndex: number;
  evaluation: string;
};

type ComprehensiveExamination = {
  mentalDevelopment: string;
  motorDevelopment: string;
  diseasesDetected: string[];
  abnormalSigns: string[];
  diseaseRisk: string[];
  notes: string;
};

type Conclusion = {
  healthStatus: string;
  advice: string;
};

type ClassInfo = {
  _id: string;
  classCode: string;
  className: string;
};

type SchoolYearInfo = {
  _id: string;
  schoolYear: string;
};

type HealthCertFiles = {
  _id: string;
  length: number;
  chunkSize: number;
  uploadDate: string;
  filename: string;
};

type MedicalRecord = {
  _id: string;
  student: StudentInfo;
  physicalDevelopment: PhysicalDevelopment;
  comprehensiveExamination: ComprehensiveExamination;
  conclusion: Conclusion;
  createdBy: string;
  updatedBy: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  class: ClassInfo;
  schoolYear: SchoolYearInfo;
  healthCertFiles: HealthCertFiles;
};

type ApiResponse = {
  data: MedicalRecord[];
  page: {
    totalCount: number;
    limit: number;
    page: number;
  };
};

type Props = NativeStackScreenProps<AuthStackParamList, "HealthProfile">;

// --- Component Card tái sử dụng (Giữ nguyên) ---
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

// --- Component Row tái sử dụng (Giữ nguyên) ---
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

// --- Component List tái sử dụng (Giữ nguyên) ---
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
      <Text style={styles.listItem}>• Không có</Text>
    )}
  </View>
);

// --- Màn hình chính (Đã cập nhật) ---
const HealthProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student } = route.params;
  const studentId = student._id;

  const [loading, setLoading] = useState(false);
  // State mới: Lưu trữ tất cả bản ghi
  const [allRecords, setAllRecords] = useState<MedicalRecord[]>([]);
  // State mới: Lưu trữ bản ghi đang được chọn
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );

  // Hàm format ngày (Giữ nguyên)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchHealthProfile = async () => {
      setLoading(true);
      setAllRecords([]);
      setSelectedRecord(null);
      try {
        const res: ApiResponse = await userApis.getMedByStu(studentId) || [];
        if (res && res.data && res.data.length > 0) {
          // Sắp xếp các bản ghi, đưa bản ghi mới nhất (theo createdAt) lên đầu
          const sortedData = res.data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAllRecords(sortedData);
          // Chọn bản ghi mới nhất làm mặc định
          setSelectedRecord(sortedData[0]);
        } else {
          setAllRecords([]);
          setSelectedRecord(null);
        }
      } catch (err) {
        console.log("🚀 ~ fetchHealthProfile ~ err:", err)
        setAllRecords([]);
        setSelectedRecord(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthProfile();
  }, [studentId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="heart-pulse"
            size={30}
            color={COLORS.primaryDark}
          />
          <Text style={styles.title}>Hồ sơ sức khỏe</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : allRecords.length === 0 ? (
          // Hiển thị nếu không có bản ghi nào HOẶC API lỗi
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons
              name="file-question-outline"
              size={60}
              color={COLORS.grey}
            />
            <Text style={styles.noDataText}>
              Bé chưa có hồ sơ sức khỏe
            </Text>
          </View>
        ) : (
          // Hiển thị Picker và nội dung chi tiết
          <>
            {/* --- PICKER CHỌN NĂM HỌC --- */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedRecord?._id}
                onValueChange={(itemValue, itemIndex) => {
                  const newRecord = allRecords.find(
                    (r) => r._id === itemValue
                  );
                  setSelectedRecord(newRecord || null);
                }}
              >
                {allRecords.map((rec) => (
                  <Picker.Item
                    key={rec._id}
                    // Thêm ngày khám để phân biệt nếu có nhiều bản ghi trong 1 năm
                    label={`Năm học: ${rec.schoolYear.schoolYear
                      } (Ngày khám: ${formatDate(rec.createdAt)})`}
                    value={rec._id}
                  />
                ))}
              </Picker>
            </View>

            {/* --- SCROLLVIEW HIỂN THỊ CHI TIẾT --- */}
            {/* Chỉ render ScrollView nếu đã chọn 1 bản ghi */}
            {selectedRecord && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
              >
                {/* Card 1: Thông tin chung */}
                <SectionCard
                  title="Thông tin khám"
                  icon="information-outline"
                >
                  <InfoRow
                    icon="calendar"
                    label="Ngày khám"
                    value={formatDate(selectedRecord.createdAt)}
                  />
                  <InfoRow
                    icon="account"
                    label="Học sinh"
                    value={selectedRecord.student.fullName}
                  />
                  <InfoRow
                    icon="google-classroom"
                    label="Lớp"
                    value={selectedRecord.class.className}
                  />
                  <InfoRow
                    icon="calendar-range"
                    label="Năm học"
                    value={selectedRecord.schoolYear.schoolYear}
                  />
                </SectionCard>

                {/* Card 2: Thể chất */}
                <SectionCard
                  title="Phát triển thể chất"
                  icon="human-male-height"
                >
                  <InfoRow
                    icon="ruler"
                    label="Chiều cao"
                    value={`${selectedRecord.physicalDevelopment.height} cm`}
                  />
                  <InfoRow
                    icon="weight-kilogram"
                    label="Cân nặng"
                    value={`${selectedRecord.physicalDevelopment.weight} kg`}
                  />
                  <InfoRow
                    icon="chart-line"
                    label="BMI"
                    value={selectedRecord.physicalDevelopment.bodyMassIndex}
                  />
                  <InfoRow
                    icon="check-circle-outline"
                    label="Đánh giá"
                    value={selectedRecord.physicalDevelopment.evaluation}
                  />
                </SectionCard>

                {/* Card 3: Tổng quát */}
                <SectionCard title="Khám tổng quát" icon="stethoscope">
                  <InfoRow
                    icon="brain"
                    label="Tinh thần"
                    value={
                      selectedRecord.comprehensiveExamination
                        .mentalDevelopment
                    }
                  />
                  <InfoRow
                    icon="run-fast"
                    label="Vận động"
                    value={
                      selectedRecord.comprehensiveExamination.motorDevelopment
                    }
                  />
                  <InfoList
                    icon="alert-circle-outline"
                    label="Bệnh phát hiện"
                    items={
                      selectedRecord.comprehensiveExamination.diseasesDetected
                    }
                  />
                  <InfoList
                    icon="alert-outline"
                    label="Dấu hiệu bất thường"
                    items={
                      selectedRecord.comprehensiveExamination.abnormalSigns
                    }
                  />
                  <InfoList
                    icon="hazard-lights"
                    label="Nguy cơ"
                    items={selectedRecord.comprehensiveExamination.diseaseRisk}
                  />
                  <InfoRow
                    icon="notebook-outline"
                    label="Ghi chú"
                    value={selectedRecord.comprehensiveExamination.notes}
                  />
                </SectionCard>

                {/* Card 4: Kết luận */}
                <SectionCard title="Kết luận" icon="clipboard-check-outline">
                  <InfoRow
                    icon="list-status"
                    label="Tình trạng"
                    value={selectedRecord.conclusion.healthStatus}
                  />
                  <InfoRow
                    icon="lightbulb-on-outline"
                    label="Lời khuyên"
                    value={selectedRecord.conclusion.advice}
                  />
                </SectionCard>

                {/* Card 5: Tệp (Nếu có) */}
                {selectedRecord.healthCertFiles && (
                  <SectionCard
                    title="Tệp đính kèm"
                    icon="file-document-outline"
                  >
                    <InfoRow
                      icon="file-pdf-box"
                      label="Tên tệp"
                      value={selectedRecord.healthCertFiles.filename}
                    />
                  </SectionCard>
                )}
              </ScrollView>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

// Bảng màu (Tương tự MenuScreen)
const COLORS = {
  background: "#f0f8ff", // AliceBlue
  white: "#FFFFFF",
  primary: "#00796B", // Màu Teal đậm
  primaryDark: "#004D40", // Màu tiêu đề chính
  lightBlue: "#81D4FA", // Màu xanh da trời sáng
  textPrimary: "#333333",
  textSecondary: "#555555",
  textLight: "#757575",
  borderColor: "#B2DFDB", // Màu viền nhạt
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
  // Style mới cho Picker (copy từ MenuScreen)
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

export default HealthProfileScreen;