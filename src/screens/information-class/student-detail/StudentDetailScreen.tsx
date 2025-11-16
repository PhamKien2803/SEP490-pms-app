import React, { useEffect, useState, useCallback, JSX } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import dayjs from "dayjs";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { StudentDetailResponse } from "../../../types/teacher";
import { teacherApis } from "../../../services/apiServices";
import { useRoute } from "@react-navigation/native";
import LoadingOverlay from "../../../components/loading/Loading";
import Avatar from "../../../components/avatar/Avatar";

type RouterParams = { studentId?: string } | undefined;

const COLORS = {
  primary: "#1890ff",
  secondary: "#faad14",
  success: "#52c41a",
  danger: "#f5222d",
  infoBg: "#e6f7ff",
  text: "#000",
  textSecondary: "#8c8c8c",
  background: "#f0f2f5",
  border: "#d9d9d9",
  borderSecondary: "#f0f0f0",
};

const TagRN: React.FC<{ color: string; children: React.ReactNode }> = ({
  color,
  children,
}) => (
  <View style={[styles.tag, { backgroundColor: color, borderColor: color }]}>
    <Text style={styles.tagText}>{children}</Text>
  </View>
);

const DetailItem: React.FC<{
  label: string;
  value?: string | number | JSX.Element;
  fullWidth?: boolean;
}> = ({ label, value, fullWidth = false }) => (
  <View
    style={[styles.detailItem, fullWidth ? styles.fullWidth : styles.halfWidth]}
  >
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={fullWidth ? undefined : 1}>
      {value || "--"}
    </Text>
  </View>
);

interface FileInfo {
  filename: string;
  _id: string;
}

interface Props {
  onGoBack?: () => void;
}

function StudentDetailScreen({ onGoBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const router = useRoute();

  const studentId = (router.params as RouterParams)?.studentId;

  const [activeTab, setActiveTab] = useState<"1" | "2" | "3">("1");

  const handleViewPDF = useCallback(
    async (fileId: string, filename: string) => {
      Alert.alert(
        "Xem Hồ Sơ",
        `Thực hiện tải và xem file PDF: ${filename} (ID: ${fileId}).\nLưu ý: Chức năng này cần thư viện Native trong môi trường mobile.`,
        [{ text: "Đóng" }]
      );
    },
    []
  );

  useEffect(() => {
    if (!studentId) {
      setStudent(null);
      return;
    }

    setLoading(true);
    setStudent(null);
    teacherApis
      .getStudentDetails(studentId)
      .then(setStudent)
      .catch((error) => {
        console.error("Fetch Student Detail Error:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin học sinh.");
        setStudent(null);
        if (onGoBack) onGoBack();
      })
      .finally(() => setLoading(false));
  }, [studentId, onGoBack]);

  const renderFileLink = (file: FileInfo | undefined | null, title: string) => {
    const hasFile = file && file._id;

    return (
      <TouchableOpacity
        key={title}
        style={styles.fileItem}
        onPress={() => hasFile && handleViewPDF(file._id, file.filename)}
        disabled={!hasFile}
      >
        <View style={styles.fileItemContent}>
          <FontAwesome5
            name="file-pdf"
            size={24}
            color={hasFile ? COLORS.danger : COLORS.textSecondary}
            style={{ marginRight: 15 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.fileTitle}>{title}</Text>
            <Text
              style={[
                styles.fileDescription,
                { color: hasFile ? COLORS.primary : COLORS.textSecondary },
              ]}
              numberOfLines={1}
            >
              {hasFile ? file.filename : "Chưa có file"}
            </Text>
          </View>
          {hasFile && (
            <FontAwesome5
              name="chevron-right"
              size={16}
              color={COLORS.primary}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPersonalInfo = (s: StudentDetailResponse) => (
    <View style={styles.tabContent}>
      <View style={styles.detailsGrid}>
        <DetailItem
          label="Ngày sinh"
          value={dayjs(s.dob).format("DD/MM/YYYY")}
        />
        <DetailItem
          label="Giới tính"
          value={
            <TagRN color={s.gender === "Nam" ? "#2db7f5" : "#f759ab"}>
              {s.gender}
            </TagRN>
          }
        />
        <DetailItem label="Dân tộc" value={s.nation} />
        <DetailItem label="Tôn giáo" value={s.religion} />
        <DetailItem label="Nhóm lớp" value={s.classGroup} />
        <DetailItem
          label="Tình trạng"
          value={
            s.active ? (
              <TagRN color={COLORS.success}>Đang học</TagRN>
            ) : (
              <TagRN color={COLORS.danger}>Ngưng học</TagRN>
            )
          }
        />
        <DetailItem label="Địa chỉ" value={s.address} fullWidth />
      </View>
    </View>
  );

  const renderFiles = (s: StudentDetailResponse) => (
    <View style={styles.tabContent}>
      {renderFileLink(s.birthCertFile, "Giấy khai sinh")}
      {renderFileLink(s.healthCertFile, "Giấy khám sức khỏe")}
      {!s.birthCertFile && !s.healthCertFile && (
        <View style={styles.emptyContainer}>
          <FontAwesome5
            name="folder-open"
            size={40}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyText}>Không có hồ sơ đính kèm nào.</Text>
        </View>
      )}
    </View>
  );

  const renderSystemInfo = (s: StudentDetailResponse) => (
    <View style={styles.tabContent}>
      <View style={styles.detailsGrid}>
        <DetailItem label="Người tạo" value={s.createdBy} />
        <DetailItem
          label="Ngày tạo"
          value={dayjs(s.createdAt).format("DD/MM/YYYY HH:mm")}
        />
        <DetailItem label="Người cập nhật" value={s.updatedBy} />
        <DetailItem
          label="Ngày cập nhật"
          value={dayjs(s.updatedAt).format("DD/MM/YYYY HH:mm")}
        />
      </View>
    </View>
  );

  if (loading) {
    return <LoadingOverlay visible={true} message="Đang tải thông tin..." />;
  }

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesome5
          name="exclamation-triangle"
          size={30}
          color={COLORS.danger}
          style={{ marginBottom: 10 }}
        />
        <Text style={styles.loadingText}>Không có dữ liệu học sinh.</Text>
        {onGoBack && (
          <TouchableOpacity style={styles.backButtonCenter} onPress={onGoBack}>
            <Text style={{ color: COLORS.primary, fontSize: 16 }}>
              Quay lại
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Avatar
          size={70}
          src={student.imageStudent}
          name={student.fullName}
          color={COLORS.primary}
          style={{ marginRight: 15 }}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.fullName}>{student.fullName}</Text>
          <Text style={styles.studentCode}>Mã HS: {student.studentCode}</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "1" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("1")}
          >
            <FontAwesome5
              name="user-alt"
              size={16}
              color={activeTab === "1" ? COLORS.primary : COLORS.textSecondary}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "1" && styles.activeTabText,
              ]}
            >
              Cá nhân
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "2" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("2")}
          >
            <FontAwesome5
              name="paperclip"
              size={16}
              color={activeTab === "2" ? COLORS.primary : COLORS.textSecondary}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "2" && styles.activeTabText,
              ]}
            >
              Hồ sơ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "3" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("3")}
          >
            <FontAwesome5
              name="database"
              size={16}
              color={activeTab === "3" ? COLORS.primary : COLORS.textSecondary}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "3" && styles.activeTabText,
              ]}
            >
              Hệ thống
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {activeTab === "1" && renderPersonalInfo(student)}
        {activeTab === "2" && renderFiles(student)}
        {activeTab === "3" && renderSystemInfo(student)}
      </ScrollView>
    </View>
  );
}

export default StudentDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  backButtonCenter: {
    marginTop: 20,
    padding: 10,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 10,
  },
  nameContainer: {
    flex: 1,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },
  studentCode: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Tabs
  tabsContainer: {
    backgroundColor: "#fff",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginRight: 8,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: COLORS.primary,
  },
  tabIcon: {
    marginRight: 5,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  activeTabText: {
    color: COLORS.primary,
  },

  // Tab Content
  contentScroll: {
    flex: 1,
    paddingHorizontal: 15,
  },
  tabContent: {
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSecondary,
  },
  halfWidth: {
    width: "48%",
  },
  fullWidth: {
    width: "100%",
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
  },

  // Tag
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  tagText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  fileItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fileItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileTitle: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "bold",
  },
  fileDescription: {
    fontSize: 13,
    marginTop: 2,
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
