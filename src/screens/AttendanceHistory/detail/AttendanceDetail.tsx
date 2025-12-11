import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";

import { IAttendanceDetailResponse } from "../../../types/teacher";
import { teacherApis } from "../../../services/apiServices";

type TAttendanceStatus = "Có mặt" | "Đã đón trẻ" | "Vắng mặt";

const STATUS_CONFIG: Record<
  TAttendanceStatus,
  { iconName: string; color: string; text: string }
> = {
  "Có mặt": {
    iconName: "check-circle",
    color: "#52c41a",
    text: "Có mặt",
  },
  "Đã đón trẻ": {
    iconName: "minus-circle",
    color: "#fa8c16",
    text: "Đã đón trẻ",
  },
  "Vắng mặt": {
    iconName: "close-circle",
    color: "#f5222d",
    text: "Vắng mặt",
  },
};

const AttendanceDetails = ({ route }: any) => {
  const { id: attendanceId } = route.params;
  const navigation = useNavigation();

  const [data, setData] = useState<IAttendanceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attendanceId) {
      setLoading(true);
      teacherApis
        .getAttendanceById(attendanceId)
        .then(setData)
        .catch((err) => {
          console.error(err);
          Alert.alert("Lỗi", "Không thể tải dữ liệu điểm danh.");
        })
        .finally(() => setLoading(false));
    }
  }, [attendanceId]);

  const stats = useMemo(() => {
    const stats = {
      present: 0,
      pickedUpChild: 0,
      absent: 0,
      total: data?.students.length || 0,
    };

    if (!data) return stats;

    data.students.forEach((item) => {
      const oldStatus = item.status;
      if (oldStatus === "Có mặt" || oldStatus === "Đi muộn") {
        stats.present++;
      } else if (oldStatus === "Đã đón trẻ") {
        stats.pickedUpChild++;
      } else {
        stats.absent++;
      }
    });

    return stats;
  }, [data]);

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );

  if (!data)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Icon name="information-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>
            Không tìm thấy dữ liệu điểm danh.
          </Text>
        </View>
      </SafeAreaView>
    );

  const normalizeStatus = (oldStatus: string): TAttendanceStatus => {
    if (oldStatus === "Có mặt" || oldStatus === "Đi muộn") {
      return "Có mặt";
    }
    if (oldStatus === "Đã đón trẻ") {
      return "Đã đón trẻ";
    }
    return "Vắng mặt";
  };

  const renderStudentItem = (
    item: IAttendanceDetailResponse["students"][0]
  ) => {
    const status = normalizeStatus(item.status);
    const config = STATUS_CONFIG[status];
    const hasDetails =
      (status === "Vắng mặt" && item.note) ||
      ((status === "Có mặt" || status === "Đã đón trẻ") && item.timeCheckIn) ||
      (status === "Đã đón trẻ" &&
        (item.timeCheckOut || item.guardian || item.noteCheckout));

    return (
      <View
        key={item.student._id}
        style={[
          styles.studentItem,
          status === "Vắng mặt" && { backgroundColor: "#fffbe6" },
        ]}
      >
        <View style={styles.studentInfoContainer}>
          <Image
            source={
              item.student.imageStudent
                ? { uri: item.student.imageStudent }
                : require("../../../assets/logoDolphin.png")
            }
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.studentName}>{item.student.fullName}</Text>
            <Text style={styles.studentCode}>{item.student.studentCode}</Text>
          </View>
          <View style={styles.statusTag}>
            <Icon name={config.iconName} size={16} color={config.color} />
            <Text style={[styles.statusTagText, { color: config.color }]}>
              {config.text}
            </Text>
          </View>
        </View>

        {hasDetails && (
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              {(status === "Có mặt" || status === "Đã đón trẻ") && (
                <View style={styles.detailItem}>
                  <Icon
                    name="clock-time-four-outline"
                    size={16}
                    color="#52c41a"
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Giờ vào:</Text>{" "}
                    {item.timeCheckIn
                      ? dayjs(item.timeCheckIn).format("HH:mm")
                      : "N/A"}
                  </Text>
                </View>
              )}

              {status === "Đã đón trẻ" && item.timeCheckOut && (
                <View style={styles.detailItem}>
                  <Icon
                    name="clock-time-four-outline"
                    size={16}
                    color="#fa8c16"
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Giờ ra:</Text>{" "}
                    {dayjs(item.timeCheckOut).format("HH:mm")}
                  </Text>
                </View>
              )}
            </View>

            {status === "Đã đón trẻ" && item.guardian && (
              <View style={styles.detailNote}>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Người đón:</Text>{" "}
                  {item.guardian.fullName} ({item.guardian.relationship}) -{" "}
                  {item.guardian.phoneNumber}
                </Text>
              </View>
            )}

            {status === "Đã đón trẻ" && item.noteCheckout && (
              <View style={styles.detailNote}>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Ghi chú đón:</Text>{" "}
                  {item.noteCheckout}
                </Text>
              </View>
            )}

            {status === "Vắng mặt" && item.note && (
              <View style={styles.detailNote}>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Ghi chú:</Text> {item.note}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoTag}>
              <Text style={styles.infoTagText}>
                Lớp: {data.class.className}
              </Text>
            </View>
            <View style={styles.infoTag}>
              <Text style={styles.infoTagText}>
                Ngày: {dayjs(data.date).format("DD/MM/YYYY")}
              </Text>
            </View>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryTag}>
              <Text style={styles.summaryTagText}>Sĩ số: {stats.total}</Text>
            </View>
            <View
              style={[
                styles.summaryTag,
                { backgroundColor: "#e6f7ff", borderColor: "#52c41a" },
              ]}
            >
              <Text style={[styles.summaryTagText, { color: "#52c41a" }]}>
                Có mặt: {stats.present}
              </Text>
            </View>
            <View
              style={[
                styles.summaryTag,
                { backgroundColor: "#fff7e6", borderColor: "#fa8c16" },
              ]}
            >
              <Text style={[styles.summaryTagText, { color: "#fa8c16" }]}>
                Đón trẻ: {stats.pickedUpChild}
              </Text>
            </View>
            <View
              style={[
                styles.summaryTag,
                { backgroundColor: "#fff1f0", borderColor: "#f5222d" },
              ]}
            >
              <Text style={[styles.summaryTagText, { color: "#f5222d" }]}>
                Vắng mặt: {stats.absent}
              </Text>
            </View>
          </View>

          <View style={styles.listContainer}>
            {data.students.map(renderStudentItem)}
          </View>

          <View style={styles.generalNoteSection}>
            <Text style={styles.generalNoteTitle}>Ghi chú chung</Text>
            <Text style={styles.generalNoteText}>
              {data.generalNote || (
                <Text style={{ color: "#888", fontStyle: "italic" }}>
                  Không có ghi chú
                </Text>
              )}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  scrollContainer: {
    padding: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  infoTag: {
    backgroundColor: "#e6f7ff",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#1890ff",
  },
  infoTagText: {
    color: "#1890ff",
    fontSize: 14,
  },
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  summaryTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f0f0f0",
  },
  summaryTagText: {
    fontSize: 14,
  },
  listContainer: {},
  studentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  studentInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#e6e6e6",
  },
  nameContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  studentCode: {
    fontSize: 13,
    color: "#888",
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  statusTagText: {
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 14,
  },
  detailsBox: {
    marginLeft: 50,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ccc",
    marginTop: 5,
  },
  detailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  detailLabel: {
    fontWeight: "bold",
    marginRight: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
  },
  detailNote: {
    marginTop: 5,
  },
  generalNoteSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  generalNoteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  generalNoteText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    color: "#888",
    textAlign: "center",
  },
});

export default AttendanceDetails;
