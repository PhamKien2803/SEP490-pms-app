import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  FlatList,
  Platform,
  Pressable,
} from "react-native";
import dayjs, { Dayjs } from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  IClassInfo,
  IFeedbackListItem,
  IStudent,
} from "../../../types/teacher";
import { schoolYearApis, teacherApis } from "../../../services/apiServices";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import CustomSelect, {
  SelectOption,
} from "../../../components/select/CustomSelect";
import LoadingOverlay from "../../../components/loading/Loading";

const TakeFeedbackList = () => {
  const navigation = useNavigation<any>();
  const user = useCurrentUser();
  const teacherId = user?.staff;

  const [date, setDate] = useState<Dayjs>(dayjs());
  const [loading, setLoading] = useState(true);
  const [currentClass, setCurrentClass] = useState<IClassInfo | null>(null);
  const [currentStudents, setCurrentStudents] = useState<IStudent[]>([]);
  const [existingFeedbacks, setExistingFeedbacks] = useState<
    IFeedbackListItem[]
  >([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [teacherData, setTeacherData] = useState<any>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!teacherId) return;
      setLoading(true);
      try {
        const res = await schoolYearApis.getSchoolYearList({
          page: 1,
          limit: 100,
        });
        const latestYear = res.data.sort(
          (a, b) => parseInt(b.schoolYear) - parseInt(a.schoolYear)
        )[0]?._id;

        if (latestYear) {
          const data: { classes: IClassInfo[] } =
            await teacherApis.getClassAndStudentByTeacher(
              teacherId,
              latestYear
            );
          setTeacherData(data);
          if (data.classes?.length > 0) {
            const firstClass = data.classes[0];
            setCurrentClass(firstClass);
            setCurrentStudents(firstClass.students || []);
            setSelectedClassId(firstClass._id);
          } else {
            Alert.alert("Cảnh báo", "Giáo viên chưa được phân công lớp nào.");
          }
        }
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error.toString() || "Không thể tải thông tin lớp hoặc năm học."
        );
      }
    };
    init();
  }, [teacherId]);

  const fetchExistingFeedbacks = useCallback(async () => {
    if (!selectedClassId) {
      setLoading(false);
      return;
    }

    if (teacherData) {
      const newClass = teacherData.classes.find(
        (c: IClassInfo) => c._id === selectedClassId
      );
      setCurrentClass(newClass || null);
      setCurrentStudents(newClass?.students || []);
    }

    if (!currentClass && !selectedClassId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data: IFeedbackListItem[] =
        await teacherApis.getFeedbackByClassAndDate(
          selectedClassId,
          date.format("YYYY-MM-DD")
        );
      setExistingFeedbacks(data);
    } catch (error: any) {
      setExistingFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, date, teacherData, currentClass]);

  useEffect(() => {
    fetchExistingFeedbacks();
  }, [fetchExistingFeedbacks]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setDate(dayjs(selectedDate));
    }
  };

  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleStudentPress = (student: IStudent) => {
    const existingFeedback = existingFeedbacks.find(
      (f) => f.studentId._id === student._id
    );

    navigation.navigate("TakeFeedbackForm", {
      student: student,
      currentClass: currentClass,
      date: date.toISOString(),
      isExisting: !!existingFeedback,
      initialFeedback: existingFeedback,
    });
  };

  const classOptions: SelectOption[] = useMemo(
    () =>
      teacherData?.classes?.map((cls: IClassInfo) => ({
        label: cls.className,
        value: cls._id,
      })) || [],
    [teacherData]
  );

  const renderStudentItem = ({ item: student }: { item: IStudent }) => {
    const has = existingFeedbacks.some((f) => f.studentId._id === student._id);
    const isPast = dayjs(date).isBefore(dayjs().startOf("day"));

    let statusText = "Nhập";
    let statusColor = "#8c8c8c";
    let statusBg = "#f5f5f5";
    let statusIcon = "clock-time-three-outline";

    if (has) {
      statusText = "Đã lưu";
      statusColor = "#52c41a";
      statusBg = "#d9f7be";
      statusIcon = "check-circle";
    } else if (isPast) {
      statusText = "Chưa đánh giá";
      statusColor = "#ffc107";
      statusBg = "#fcf8e3";
      statusIcon = "alert";
    }

    return (
      <TouchableOpacity
        onPress={() => handleStudentPress(student)}
        style={styles.studentListItem}
        disabled={loading}
      >
        {student.imageStudent ? (
          <Image source={{ uri: student.imageStudent }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Icon name="account-circle" size={30} color="#1890ff" />
          </View>
        )}

        <View style={styles.studentMeta}>
          <Text style={styles.studentNameList} numberOfLines={1}>
            {student.fullName}
          </Text>
          <Text style={styles.studentCode}>MSHS: {student.studentCode}</Text>
        </View>
        <View style={[styles.statusTagList, { backgroundColor: statusBg }]}>
          <Icon name={statusIcon as any} size={14} color={statusColor} />
          <Text style={[styles.statusTagText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LoadingOverlay visible={loading} />
        <View style={styles.headerCard}>
          <View style={styles.headerInfo}>
            <Icon
              name="comment-text-multiple-outline"
              size={24}
              color="#1890ff"
            />
            <Text style={styles.headerTitle}>
              {currentClass?.className || "Chọn lớp..."}
            </Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{currentStudents.length} HS</Text>
            </View>
          </View>

          <View style={styles.controlsRow}>
            <CustomSelect
              data={classOptions}
              selectedValue={selectedClassId || undefined}
              onValueChange={setSelectedClassId}
              placeholder="Chọn lớp"
              disabled={loading}
              style={styles.classSelect}
            />

            {Platform.OS === "android" ? (
              <View>
                <Pressable
                  onPress={handleOpenDatePicker}
                  style={styles.dateButton}
                  disabled={loading}
                >
                  <Icon name="calendar-month-outline" size={20} color="#333" />
                  <Text style={styles.dateButtonText}>
                    {date.format("DD/MM/YYYY")}
                  </Text>
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={date.toDate()}
                    mode="date"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            ) : (
              <DateTimePicker
                value={date.toDate()}
                mode="date"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Icon name="account-group-outline" size={20} color="#333" />
            <Text style={styles.listTitle}>
              Danh sách học sinh ({currentStudents.length})
            </Text>
          </View>

          {loading && currentStudents.length === 0 ? (
            <ActivityIndicator
              animating={loading}
              size="large"
              color="#1890ff"
              style={styles.loadingFull}
            />
          ) : (
            <FlatList
              data={currentStudents}
              keyExtractor={(item) => item._id}
              renderItem={renderStudentItem}
              ListEmptyComponent={
                !loading && !currentStudents.length ? (
                  <Text style={styles.emptyListText}>
                    Không có học sinh trong lớp.
                  </Text>
                ) : null
              }
            />
          )}
        </View>
      </View>
      <LoadingOverlay visible={false} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  container: { flex: 1, padding: 16 },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 8, flex: 1 },
  tag: {
    backgroundColor: "#e6f7ff",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tagText: { color: "#1890ff", fontSize: 12, fontWeight: "500" },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    zIndex: 10,
  },
  classSelect: { flex: 1, marginRight: 8 },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    height: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    minWidth: 120,
  },
  dateButtonText: { marginLeft: 5, fontSize: 15 },

  listCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
  },
  listTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  loadingFull: { paddingVertical: 50 },
  emptyListText: { textAlign: "center", padding: 20, color: "#888" },

  studentListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f7f7f7",
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    backgroundColor: "#e6f7ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1890ff",
  },
  studentMeta: { flex: 1, justifyContent: "center" },
  studentNameList: { fontWeight: "600", fontSize: 15, color: "#333" },
  studentCode: { fontSize: 13, color: "#888" },
  statusTagList: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 110,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  statusTagText: { fontSize: 12, marginLeft: 4, fontWeight: "bold" },
});

export default TakeFeedbackList;
