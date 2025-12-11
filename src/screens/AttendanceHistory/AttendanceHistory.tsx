import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import dayjs from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

import {
  IAttendanceDetailResponse,
  ITeacherClassStudentResponse,
  IClassInfo,
} from "../../types/teacher";
import { SchoolYearListItem } from "../../types/schoolYear";
import { schoolYearApis, teacherApis } from "../../services/apiServices";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import CustomSelect from "../../components/select/CustomSelect";
import LoadingOverlay from "../../components/loading/Loading";

const usePagePermission = () => ({ canUpdate: true, canCreate: true });

interface AttendanceTableRecord extends IAttendanceDetailResponse {}

const AttendanceHistory = () => {
  const navigation = useNavigation<any>();
  const user = useCurrentUser();
  const teacherId = useMemo(() => user?.staff, [user]);
  const { canUpdate, canCreate } = usePagePermission();

  const [loading, setLoading] = useState(false);
  const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<
    string | undefined
  >(undefined);
  const [teacherClassInfo, setTeacherClassInfo] = useState<IClassInfo | null>(
    null
  );
  const [attendanceList, setAttendanceList] = useState<AttendanceTableRecord[]>(
    []
  );

  const fetchAttendanceData = useCallback(
    async (yearId: string | undefined) => {
      if (!teacherId || !yearId) {
        setAttendanceList([]);
        setTeacherClassInfo(null);
        return;
      }

      setLoading(true);
      try {
        const teacherData: ITeacherClassStudentResponse =
          await teacherApis.getClassAndStudentByTeacher(teacherId, yearId);
        const currentClass = teacherData.classes?.[0];

        if (!currentClass) {
          setTeacherClassInfo(null);
          setAttendanceList([]);
          // Alert.alert("Cảnh báo", "Không tìm thấy lớp học trong năm học này");
          return;
        }

        setTeacherClassInfo(currentClass);
        const attendanceData =
          await teacherApis.getAttendanceByClassAndSchoolYear(
            currentClass._id,
            yearId
          );

        const sortedData = (
          Array.isArray(attendanceData) ? attendanceData : [attendanceData]
        ).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

        setAttendanceList(sortedData);
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error.toString() || "Không thể tải dữ liệu điểm danh."
        );
        setAttendanceList([]);
      } finally {
        setLoading(false);
      }
    },
    [teacherId]
  );

  useEffect(() => {
    const fetchSchoolYears = async () => {
      try {
        const res = await schoolYearApis.getSchoolYearList({
          page: 1,
          limit: 100,
        });
        const sorted = res.data.sort(
          (a, b) =>
            parseInt(b.schoolYear.split("-")[0]) -
            parseInt(a.schoolYear.split("-")[0])
        );
        setSchoolYears(sorted);

        const firstYearId = sorted[0]?._id;
        if (firstYearId) {
          setSelectedSchoolYearId(firstYearId);
        }
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error.toString() || "Không thể tải danh sách năm học."
        );
      }
    };

    if (teacherId) {
      fetchSchoolYears();
    }
  }, [teacherId]);

  useEffect(() => {
    if (selectedSchoolYearId && teacherId) {
      fetchAttendanceData(selectedSchoolYearId);
    }
  }, [selectedSchoolYearId, teacherId, fetchAttendanceData]);

  const handleNavigateToTakeAttendance = () => {
    navigation.navigate("TakeAttendance");
  };

  const handleNavigateToDetail = (id: string) => {
    navigation.navigate("AttendanceDetails", { id });
  };

  const handleNavigateToEdit = (id: string) => {
    navigation.navigate("EditAttendance", { id });
  };

  const schoolYearOptions: any[] = useMemo(
    () =>
      schoolYears.map((sy) => ({
        label: sy.schoolYear,
        value: sy._id,
      })),
    [schoolYears]
  );

  const renderAttendanceItem = ({ item }: { item: AttendanceTableRecord }) => {
    const studentCount = item.students?.length || 0;
    return (
      <View style={styles.listItem}>
        <View style={styles.listItemHeader}>
          <Icon name="calendar-check" size={20} color="#1890ff" />
          <Text style={styles.dateText}>
            Ngày: {dayjs(item.date).format("DD/MM/YYYY")}
          </Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.schoolYear.schoolYear}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Người điểm danh:</Text>
          <Text style={styles.value}>{item.takenBy?.fullName || "N/A"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Sĩ số:</Text>
          <Text style={styles.value}>{studentCount}</Text>
        </View>
        {item.generalNote && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Ghi chú chung:</Text>
            <Text style={styles.value} numberOfLines={2}>
              {item.generalNote}
            </Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#1890ff" }]}
            onPress={() => handleNavigateToDetail(item._id)}
          >
            <Icon name="eye-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Xem</Text>
          </TouchableOpacity>
          {canUpdate && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#faad14" }]}
              onPress={() => handleNavigateToEdit(item._id)}
            >
              <Icon name="pencil-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Sửa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleCard}>
          <Icon name="history" size={24} color="#333" />
          <Text style={styles.title}>Lịch sử điểm danh</Text>
          {teacherClassInfo && (
            <View style={styles.classTag}>
              <Text style={styles.classTagText}>
                Lớp: {teacherClassInfo.className}
              </Text>
            </View>
          )}
        </View>

        {canCreate && (
          <TouchableOpacity
            style={styles.takeAttendanceButton}
            onPress={handleNavigateToTakeAttendance}
            disabled={!teacherClassInfo || loading}
          >
            <Icon name="plus-circle-outline" size={20} color="#fff" />
            <Text style={styles.takeAttendanceButtonText}>
              Điểm danh hôm nay
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.controlsContainer}>
          <CustomSelect
            data={schoolYearOptions}
            selectedValue={selectedSchoolYearId}
            onValueChange={setSelectedSchoolYearId}
            placeholder="Chọn năm học"
            disabled={loading}
            style={styles.selectControl}
          />
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => fetchAttendanceData(selectedSchoolYearId)}
            disabled={loading || !selectedSchoolYearId}
          >
            <Icon name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.listWrapper}>
          {loading && attendanceList.length === 0 && (
            <ActivityIndicator
              size="large"
              color="#1890ff"
              style={styles.loading}
            />
          )}

          {attendanceList.length === 0 && !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="information-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                {!teacherClassInfo
                  ? "Vui lòng chọn năm học để xem lớp."
                  : "Không có dữ liệu điểm danh nào cho lớp/năm học này."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={attendanceList}
              renderItem={renderAttendanceItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  titleCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    flex: 1,
  },
  classTag: {
    backgroundColor: "#1890ff",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
  },
  classTagText: {
    color: "#fff",
    fontSize: 14,
  },
  takeAttendanceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#52c41a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  takeAttendanceButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    zIndex: 1,
  },
  selectControl: {
    flex: 1,
    marginRight: 8,
  },
  refreshButton: {
    backgroundColor: "#faad14",
    padding: 12,
    borderRadius: 8,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  listWrapper: {
    flex: 1,
  },
  loading: {
    marginTop: 50,
  },
  loadingSmall: {
    paddingVertical: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#1890ff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  listItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
    color: "#333",
  },
  tag: {
    backgroundColor: "#e6f7ff",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    color: "#1890ff",
    fontSize: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    width: 120,
    fontSize: 14,
    color: "#555",
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  actionContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 10,
    color: "#888",
    textAlign: "center",
  },
});

export default AttendanceHistory;
