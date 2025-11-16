import React, { useState, useEffect, useMemo, JSX } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Modal,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import dayjs from "dayjs";
import {
  IClassInfo,
  IStudent,
  ITeacherClassStudentResponse,
} from "../../types/teacher";
import { teacherApis, schoolYearApis } from "../../services/apiServices";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { SchoolYearListItem } from "../../types/schoolYear";
import { useNavigation } from "@react-navigation/native";

const COLORS = {
  primary: "#1890ff",
  textSecondary: "#8c8c8c",
  infoBg: "#e6f7ff",
  success: "#52c41a",
  warning: "#faad14",
  border: "#d9d9d9",
  borderSecondary: "#f0f0f0",
  headerBg: "#fafafa",
  text: "#000",
  background: "#f0f2f5",
};

const AvatarRN: React.FC<{
  size: number;
  src?: string;
  name: string;
  iconSize?: number;
  color?: string;
}> = ({ size, src, name, iconSize = 16, color = COLORS.primary }) => {
  const letter = name?.[0]?.toUpperCase() || (
    <FontAwesome5 name="user" size={iconSize} color="#fff" />
  );
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : typeof letter === "string" ? (
        <Text style={styles.avatarText}>{letter}</Text>
      ) : (
        letter
      )}
    </View>
  );
};
const TagRN: React.FC<{
  color: string;
  icon: JSX.Element;
  children: React.ReactNode;
}> = ({ color, icon, children }) => (
  <View style={[styles.tag, { backgroundColor: color, borderColor: color }]}>
    {icon}
    <Text style={styles.tagText}>{children}</Text>
  </View>
);
const StatisticRN: React.FC<{
  title: string;
  value: string | number;
  prefix: JSX.Element;
  color?: string;
}> = ({ title, value, prefix, color = COLORS.textSecondary }) => (
  <View style={styles.statisticContainer}>
    <Text style={styles.statisticTitle}>{title}</Text>
    <View style={styles.statisticValueRow}>
      <View style={{ marginRight: 5 }}>{prefix}</View>
      <Text style={[styles.statisticValue, { color: color }]}>{value}</Text>
    </View>
  </View>
);

const SchoolYearSelectModal: React.FC<{
  schoolYears: SchoolYearListItem[];
  selectedYearId: string | undefined;
  onSelect: (yearId: string) => void;
  onClose: () => void;
  isVisible: boolean;
}> = ({ schoolYears, selectedYearId, onSelect, onClose, isVisible }) => {
  const renderYearItem = ({ item }: { item: SchoolYearListItem }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        item._id === selectedYearId && styles.modalItemSelected,
      ]}
      onPress={() => {
        onSelect(item._id);
        onClose();
      }}
    >
      <Text
        style={[
          styles.modalItemText,
          item._id === selectedYearId && styles.modalItemSelectedText,
        ]}
      >
        {item.schoolYear}
      </Text>
      {item._id === selectedYearId && (
        <FontAwesome5 name="check" size={16} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chọn Năm Học</Text>
          <FlatList
            data={schoolYears}
            renderItem={renderYearItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 300 }}
            ListEmptyComponent={
              <Text style={styles.noStudentText}>Không có năm học nào.</Text>
            }
          />
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

function InformationClass() {
  const user = useCurrentUser();
  const teacherId = user?.staff;
  const navigation = useNavigation();

  const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [classData, setClassData] =
    useState<ITeacherClassStudentResponse | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);

  const primaryColor = COLORS.primary;
  const infoBgColor = COLORS.infoBg;

  useEffect(() => {
    const fetchSchoolYears = async () => {
      try {
        const res = await schoolYearApis.getSchoolYearList({
          page: 1,
          limit: 100,
        });

        const sorted = [...res.data].sort((a, b) => {
          const endYearA = parseInt(a.schoolYear.split("-")[1]);
          const endYearB = parseInt(b.schoolYear.split("-")[1]);
          return endYearB - endYearA;
        });
        setSchoolYears(sorted);
        if (sorted.length > 0) {
          setSelectedYear(sorted[0]._id);
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải danh sách năm học.");
      }
    };

    fetchSchoolYears();
  }, []);

  useEffect(() => {
    if (!teacherId || !selectedYear) return;

    const fetchClassData = async () => {
      setIsLoadingData(true);
      try {
        const response = await teacherApis.getClassAndStudentByTeacher(
          teacherId,
          selectedYear
        );
        setClassData(response);
        if (response.classes.length > 0) {
          if (
            !activeTab ||
            !response.classes.find((c: any) => c._id === activeTab)
          ) {
            setActiveTab(response.classes[0]._id);
          }
        } else {
          setActiveTab(undefined);
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải thông tin lớp học.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchClassData();
  }, [teacherId, selectedYear]);

  const handleYearSelect = (yearId: string) => {
    setSelectedYear(yearId);
    setActiveTab(undefined);
  };
  const handlePressStudent = (studentId: string) => {
    navigation.navigate("StudentDetail", {
      studentId: studentId,
    });
  };
  const renderStudentItem = ({ item }: { item: IStudent }) => {
    return (
      <TouchableOpacity
        onPress={() => handlePressStudent(item._id)}
        style={styles.tableRow}
      >
        <Text style={[styles.tableCell, { width: 100, fontWeight: "bold" }]}>
          {item.studentCode}
        </Text>

        <View
          style={[
            styles.tableCell,
            { width: 150, flexDirection: "row", alignItems: "center" },
          ]}
        >
          <AvatarRN
            size={25}
            src={item.imageStudent}
            name={item.fullName}
            color={primaryColor}
            iconSize={12}
          />
          <Text style={[styles.cellText, { marginLeft: 8 }]}>
            {item.fullName}
          </Text>
        </View>

        <Text style={[styles.tableCell, { width: 100 }]}>
          {item.dob ? dayjs(item.dob).format("DD/MM/YYYY") : "-"}
        </Text>
      </TouchableOpacity>
    );
  };

  const TeacherInfoCard = () => (
    <View
      style={[
        styles.headerCard,
        { backgroundColor: infoBgColor, borderColor: primaryColor },
      ]}
    >
      <View style={styles.rowBetween}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AvatarRN
            size={50}
            name={classData?.teacher?.fullName || user?.email || "GV"}
            color={primaryColor}
            iconSize={25}
          />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.teacherName}>
              {classData?.teacher?.fullName || user?.email || "Giáo viên"}
            </Text>
            <Text style={styles.teacherEmail}>
              {classData?.teacher?.email || user?.email}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoadingData || user === undefined) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      );
    }

    if (!classData || classData.classes.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Giáo viên hiện chưa được phân công lớp học nào trong năm học này.
          </Text>
        </View>
      );
    }

    const { classes } = classData;
    const currentClass =
      classes.find((c: any) => c._id === activeTab) || classes[0];

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBar}
          >
            {classes.map((classInfo: IClassInfo) => (
              <TouchableOpacity
                key={classInfo._id}
                style={[
                  styles.tabButton,
                  {
                    borderBottomColor:
                      activeTab === classInfo._id
                        ? primaryColor
                        : "transparent",
                  },
                ]}
                onPress={() => setActiveTab(classInfo._id)}
              >
                <FontAwesome5
                  name="users"
                  size={16}
                  color={
                    activeTab === classInfo._id
                      ? primaryColor
                      : COLORS.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === classInfo._id
                          ? primaryColor
                          : COLORS.textSecondary,
                    },
                  ]}
                >
                  {classInfo.className}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Nội dung TabPane */}
          <View style={styles.tabContent}>
            {currentClass && (
              <View>
                {/* Thông tin Thống kê */}
                <View style={styles.statisticRow}>
                  <StatisticRN
                    title="Mã lớp"
                    value={currentClass.classCode}
                    prefix={
                      <FontAwesome5
                        name="barcode" // Tên icon tương đương với BarcodeOutlined
                        size={18}
                        color={COLORS.textSecondary}
                      />
                    }
                  />
                  <StatisticRN
                    title="Phòng học"
                    value={currentClass.room?.roomName || "--"}
                    prefix={
                      <FontAwesome5
                        name="home" // Tên icon tương đương với HomeOutlined
                        size={18}
                        color={COLORS.success}
                      />
                    }
                    color={COLORS.success}
                  />
                  <StatisticRN
                    title="Độ tuổi"
                    value={`${currentClass.age || "--"} tuổi`}
                    prefix={
                      <FontAwesome5
                        name="smile" // Tên icon tương đương với SmileOutlined
                        size={18}
                        color={COLORS.warning}
                      />
                    }
                    color={COLORS.warning}
                  />
                  <StatisticRN
                    title="Sĩ số"
                    value={currentClass.students?.length || 0}
                    prefix={
                      <FontAwesome5
                        name="users" // Tên icon tương đương với UsergroupAddOutlined
                        size={18}
                        color={primaryColor}
                      />
                    }
                    color={primaryColor}
                  />
                </View>

                <View style={styles.divider} />

                {/* Danh sách Học sinh */}
                <Text style={styles.listTitle}>Danh sách học sinh</Text>

                {/* Header Table */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.headerText,
                      { width: 100 },
                    ]}
                  >
                    Mã HS
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.headerText,
                      { width: 150 },
                    ]}
                  >
                    Họ và Tên
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.headerText,
                      { width: 100 },
                    ]}
                  >
                    Ngày sinh
                  </Text>
                </View>

                {/* Body Table (FlatList) */}
                <FlatList
                  data={currentClass.students}
                  renderItem={renderStudentItem}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <Text style={styles.noStudentText}>
                      Lớp học chưa có học sinh nào.
                    </Text>
                  }
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  const currentYearName = useMemo(() => {
    return (
      schoolYears.find((y) => y._id === selectedYear)?.schoolYear ||
      "Đang tải..."
    );
  }, [schoolYears, selectedYear]);

  return (
    <View style={styles.container}>
      <TeacherInfoCard />
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.selectYearButton}
          onPress={() => setIsYearModalVisible(true)}
        >
          <FontAwesome5
            name="calendar-alt"
            size={20}
            color={primaryColor}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.selectYearButtonText}>Năm học: </Text>
          <Text style={[styles.selectYearButtonText, { fontWeight: "bold" }]}>
            {currentYearName}
          </Text>
          <FontAwesome5
            name="caret-down"
            size={18}
            color={COLORS.textSecondary}
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>

      {renderContent()}

      <SchoolYearSelectModal
        schoolYears={schoolYears}
        selectedYearId={selectedYear}
        onSelect={handleYearSelect}
        onClose={() => setIsYearModalVisible(false)}
        isVisible={isYearModalVisible}
      />

      {/* Modal Chi tiết Học sinh (Nếu có) */}
      {/* {selectedStudentId && (
            <StudentDetailModal
                studentId={selectedStudentId}
                open={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />
        )} */}
    </View>
  );
}

export default InformationClass;

// --- Stylesheet (Đã chỉnh sửa) ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "flex-start", // Nút chọn năm học nằm bên trái
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  // STYLE CHO NÚT CHỌN NĂM HỌC
  selectYearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.0,
    elevation: 1,
  },
  selectYearButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },

  loadingContainer: {
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  // STYLE CHO THÔNG TIN GIÁO VIÊN (headerCard)
  headerCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  teacherEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tabsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.0,
    elevation: 1,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderColor: COLORS.borderSecondary,
    paddingHorizontal: 15,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginRight: 10,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  tabContent: {
    padding: 15,
  },
  statisticRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statisticContainer: {
    width: "48%",
    marginBottom: 10,
  },
  statisticTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statisticValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  statisticValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderSecondary,
    marginVertical: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  tableHeader: {
    backgroundColor: COLORS.headerBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderSecondary,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.borderSecondary,
    backgroundColor: "#fff",
  },
  tableCell: {
    fontSize: 14,
    paddingHorizontal: 5,
  },
  headerText: {
    fontWeight: "bold",
    color: COLORS.text,
  },
  cellText: {
    fontSize: 14,
  },
  noStudentText: {
    textAlign: "center",
    padding: 20,
    color: COLORS.textSecondary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: COLORS.primary,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSecondary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemSelected: {
    backgroundColor: COLORS.infoBg,
    borderRadius: 4,
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalItemSelectedText: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
