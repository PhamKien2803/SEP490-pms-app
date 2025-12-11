import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import dayjs, { Dayjs } from "dayjs";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

import {
  IAttendanceCreatePayload,
  IAttendanceDetailResponse,
  IClassInfo,
  IStudent,
  ITeacherClassStudentResponse,
  IAttendanceStudentPayload,
} from "../../../types/teacher";
import { SchoolYearListItem } from "../../../types/schoolYear";
import { schoolYearApis, teacherApis } from "../../../services/apiServices";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

type TAttendanceStatus = "Có mặt" | "Vắng mặt";

const STATUS_CONFIG: Record<
  TAttendanceStatus,
  {
    iconName: string;
    color: string;
    text: string;
  }
> = {
  "Có mặt": { iconName: "check-circle", color: "#52c41a", text: "Có mặt" },
  "Vắng mặt": { iconName: "close-circle", color: "#f5222d", text: "Vắng mặt" },
};

interface IStudentAttendanceState {
  status: TAttendanceStatus;
  note?: string;
  timeCheckIn?: string | null;
}

const TakeAttendance = () => {
  const user = useCurrentUser();
  const navigation = useNavigation();
  const teacherId = useMemo(() => user?.staff, [user]);

  const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>([]);
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<
    string | undefined
  >();
  const [teacherData, setTeacherData] =
    useState<ITeacherClassStudentResponse | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const [attendanceState, setAttendanceState] = useState<
    Map<string, IStudentAttendanceState>
  >(new Map());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [currentAttendanceId, setCurrentAttendanceId] = useState<string | null>(
    null
  );
  const [generalNote, setGeneralNote] = useState<string>("");
  const [isFutureDate, setIsFutureDate] = useState(false);
  const [isPastDate, setIsPastDate] = useState(false);
  const [isLoadingTeacherData, setIsLoadingTeacherData] = useState(true);
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const currentClass: IClassInfo | undefined = useMemo(
    () => teacherData?.classes?.find((c) => c?._id === selectedClassId),
    [teacherData, selectedClassId]
  );
  const studentList: IStudent[] = useMemo(
    () => currentClass?.students || [],
    [currentClass]
  );

  useEffect(() => {
    const init = async () => {
      if (!teacherId) return;
      setIsLoadingTeacherData(true);

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
        const latestYear = sorted[0]?._id;
        setSchoolYears(sorted);
        setSelectedSchoolYearId(latestYear);

        if (latestYear) {
          const data = await teacherApis.getClassAndStudentByTeacher(
            teacherId,
            latestYear
          );
          setTeacherData(data);
          if (data.classes?.length > 0) {
            setSelectedClassId(data?.classes?.[0]?._id);
          } else {
            Alert.alert(
              "Thông báo",
              "Giáo viên chưa được phân công lớp học trong năm học gần nhất."
            );
          }
        }
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error.toString() || "Không thể tải thông tin giáo viên hoặc năm học."
        );
      } finally {
        setIsLoadingTeacherData(false);
      }
    };

    init();
  }, [teacherId]);

  useEffect(() => {
    const defaultState = new Map<string, IStudentAttendanceState>();
    studentList.forEach((student) => {
      defaultState.set(student?._id, {
        status: "Vắng mặt",
        note: "",
        timeCheckIn: null,
      });
    });
    setAttendanceState(defaultState);
    setGeneralNote("");
    setCurrentAttendanceId(null);
  }, [studentList]);

  const fetchAttendanceData = useCallback(
    async (classId: string, date: string) => {
      if (!classId || !date || studentList.length === 0) return;
      setCurrentAttendanceId(null);
      setIsFetchingAttendance(true);
      try {
        const data: IAttendanceDetailResponse =
          await teacherApis.getAttendanceByClassAndDate(classId, date);

        const newState = new Map<string, IStudentAttendanceState>();
        data?.students?.forEach((item) => {
          let normalizedStatus: TAttendanceStatus;
          const oldStatus = item.status as any;

          if (
            oldStatus === "Có mặt" ||
            oldStatus === "Đi muộn" ||
            oldStatus === "Đã đón trẻ"
          ) {
            normalizedStatus = "Có mặt";
          } else {
            normalizedStatus = "Vắng mặt";
          }

          newState.set(item?.student?._id, {
            status: normalizedStatus,
            note: item.note || item.noteCheckout || "",
            timeCheckIn: item.timeCheckIn || null,
          });
        });
        setAttendanceState(newState);
        setGeneralNote(data?.generalNote || "");
        setCurrentAttendanceId(data?._id);

        if (dayjs().isSame(selectedDate, "day")) {
          Alert.alert(
            "Thông báo",
            "Bạn đã điểm danh hôm nay. Không thể điểm danh lại."
          );
        }
      } catch (error: any) {
        if (error?.status !== 404) {
          console.error(error);
        }
        const defaultState = new Map<string, IStudentAttendanceState>();
        studentList.forEach((student) => {
          defaultState.set(student?._id, {
            status: "Vắng mặt",
            note: "",
            timeCheckIn: null,
          });
        });
        setAttendanceState(defaultState);
        setGeneralNote("");
        setCurrentAttendanceId(null);
      } finally {
        setIsFetchingAttendance(false);
      }
    },
    [studentList.length, selectedDate]
  );

  useEffect(() => {
    if (selectedClassId) {
      fetchAttendanceData(selectedClassId, selectedDate.format("YYYY-MM-DD"));
    }
  }, [selectedClassId, selectedDate, fetchAttendanceData]);

  useEffect(() => {
    const now = dayjs().startOf("day");
    const selected = selectedDate.startOf("day");
    setIsFutureDate(selected.isAfter(now));
    setIsPastDate(selected.isBefore(now));
  }, [selectedDate]);

  const handleAttendanceChange = (
    studentId: string,
    field: "status" | "note",
    value: string
  ) => {
    setAttendanceState((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(studentId) || {
        status: "Vắng mặt" as TAttendanceStatus,
        note: "",
        timeCheckIn: null,
      };
      if (field === "status") {
        current.status = value as TAttendanceStatus;
        if (
          current.status === "Có mặt" &&
          dayjs().isSame(selectedDate, "day")
        ) {
          current.timeCheckIn = dayjs().toISOString();
        } else {
          current.timeCheckIn = null;
        }
      } else if (field === "note") {
        current.note = value;
      }
      newMap.set(studentId, current);
      return newMap;
    });
  };

  const handleSubmit = async () => {
    if (!currentClass || !teacherId || !teacherData) {
      Alert.alert("Lỗi", "Thiếu thông tin giáo viên hoặc lớp học.");
      return;
    }

    if (currentAttendanceId) {
      Alert.alert("Cảnh báo", "Buổi học hôm nay đã được điểm danh.");
      return;
    }

    if (isPastDate) {
      Alert.alert("Cảnh báo", "Không thể điểm danh cho ngày trong quá khứ.");
      return;
    }

    setIsSaving(true);
    const studentsPayload: IAttendanceStudentPayload[] = Array.from(
      attendanceState.entries()
    ).map(([studentId, data]) => ({
      student: studentId,
      status: data.status,
      note: data.note || undefined,
      noteCheckout: undefined,
      timeCheckIn: data.timeCheckIn || null,
      timeCheckOut: null,
      guardian: null,
    }));

    const payload: IAttendanceCreatePayload = {
      class: currentClass?._id,
      schoolYear: currentClass?.schoolYear?._id,
      date: selectedDate.format("YYYY-MM-DD"),
      students: studentsPayload,
      takenBy: teacherId,
      generalNote: generalNote || undefined,
    };

    try {
      const res = await teacherApis.createAttendance(payload);
      setCurrentAttendanceId(res?._id);
      Alert.alert("Thành công", "Đã lưu điểm danh thành công!");
    } catch (error: any) {
      Alert.alert("Lỗi", error.toString() || "Lưu điểm danh thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const attendanceSummary = useMemo(() => {
    const stats = { present: 0, absent: 0, total: 0 };
    stats.total = studentList.length;
    for (const state of attendanceState.values()) {
      if (state.status === "Có mặt") stats.present++;
      else if (state.status === "Vắng mặt") stats.absent++;
    }
    return stats;
  }, [attendanceState, studentList]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(dayjs(selectedDate));
    }
  };

  if (isLoadingTeacherData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>Đang tải dữ liệu giáo viên...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStudentItem = (student: IStudent) => {
    const state = attendanceState.get(student?._id) || {
      status: "Vắng mặt" as TAttendanceStatus,
      note: "",
      timeCheckIn: null,
    };
    const config = STATUS_CONFIG[state.status];

    return (
      <View key={student?._id} style={styles.studentItem}>
        <View style={styles.studentInfo}>
          <Image
            source={
              student.imageStudent
                ? { uri: student.imageStudent }
                : require("../../../assets/logoDolphin.png")
            }
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.studentName}>{student.fullName}</Text>
            <Text style={styles.studentCode}>{student.studentCode}</Text>
          </View>
        </View>

        <View style={styles.attendanceControl}>
          <View style={styles.radioGroup}>
            {Object.keys(STATUS_CONFIG).map((key) => {
              const sKey = key as TAttendanceStatus;
              const cfg = STATUS_CONFIG[sKey];
              const isSelected = state.status === sKey;
              return (
                <TouchableOpacity
                  key={sKey}
                  style={[
                    styles.radioButton,
                    isSelected && { backgroundColor: cfg.color },
                    { borderColor: cfg.color },
                  ]}
                  onPress={() =>
                    handleAttendanceChange(student?._id, "status", sKey)
                  }
                  disabled={
                    currentAttendanceId !== null || isPastDate || isFutureDate
                  }
                >
                  <Icon
                    name={cfg.iconName}
                    size={16}
                    color={isSelected ? "#fff" : cfg.color}
                  />
                  <Text
                    style={[
                      styles.radioText,
                      { color: isSelected ? "#fff" : cfg.color },
                    ]}
                  >
                    {cfg.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {state.status === "Có mặt" && state.timeCheckIn && (
            <View style={styles.checkInTime}>
              <Icon name="clock-time-four-outline" size={16} color="#52c41a" />
              <Text style={styles.checkInText}>
                Giờ vào: {dayjs(state.timeCheckIn).format("HH:mm")}
              </Text>
            </View>
          )}

          {state.status === "Vắng mặt" && (
            <TextInput
              style={styles.noteInput}
              placeholder="Ghi chú (Bị ốm, ...)"
              value={state.note}
              onChangeText={(text) =>
                handleAttendanceChange(student?._id, "note", text)
              }
              multiline
              numberOfLines={2}
              editable={
                currentAttendanceId === null && !isPastDate && !isFutureDate
              }
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        {currentClass && (
          <View style={styles.summaryContainer}>
            <Text style={styles.classText}>Lớp: {currentClass.className}</Text>
            <View style={styles.tagsRow}>
              <View style={styles.tagBase}>
                <Text style={styles.tagTextBase}>
                  Sĩ số: {attendanceSummary.total}
                </Text>
              </View>
              <View
                style={[
                  styles.tagBase,
                  { backgroundColor: "#e6f7ff", borderColor: "#52c41a" },
                ]}
              >
                <Text style={[styles.tagTextBase, { color: "#52c41a" }]}>
                  Có mặt: {attendanceSummary.present}
                </Text>
              </View>
              <View
                style={[
                  styles.tagBase,
                  { backgroundColor: "#fff1f0", borderColor: "#f5222d" },
                ]}
              >
                <Text style={[styles.tagTextBase, { color: "#f5222d" }]}>
                  Vắng mặt: {attendanceSummary.absent}
                </Text>
              </View>
            </View>
            {isPastDate && (
              <Text style={styles.warningText}>
                Ngày này đã qua, không thể điểm danh lại.
              </Text>
            )}
            {currentAttendanceId && (
              <Text style={styles.warningText}>
                Ngày này đã được điểm danh, không thể tạo mới.
              </Text>
            )}
            {isFutureDate && (
              <Text style={styles.warningText}>
                Không thể điểm danh cho ngày trong tương lai.
              </Text>
            )}
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isFetchingAttendance ? (
            <ActivityIndicator
              size="small"
              color="#1890ff"
              style={styles.loading}
            />
          ) : isFutureDate ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Vui lòng chọn ngày hôm nay hoặc quá khứ gần nhất.
              </Text>
            </View>
          ) : !currentClass ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Vui lòng chọn lớp để điểm danh.
              </Text>
            </View>
          ) : studentList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Lớp học này chưa có học sinh.
              </Text>
            </View>
          ) : (
            <>
              {studentList.map(renderStudentItem)}

              <View style={styles.generalNoteContainer}>
                <Text style={styles.generalNoteTitle}>Ghi chú chung</Text>
                <TextInput
                  style={styles.generalNoteInput}
                  placeholder="Nhập ghi chú chung (ví dụ: Lớp ngoan, thời tiết...)"
                  value={generalNote}
                  onChangeText={setGeneralNote}
                  multiline
                  numberOfLines={3}
                  editable={
                    currentAttendanceId === null && !isPastDate && !isFutureDate
                  }
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (currentAttendanceId !== null ||
                    isPastDate ||
                    isFutureDate) &&
                    styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={
                  currentAttendanceId !== null ||
                  isPastDate ||
                  isFutureDate ||
                  isSaving
                }
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="content-save-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>
                      {currentAttendanceId
                        ? "Đã điểm danh"
                        : isPastDate || isFutureDate
                        ? "Không thể điểm danh"
                        : "Lưu điểm danh"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
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
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 5,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 10,
  },
  datePickerContainer: {},
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dateButtonText: {
    marginLeft: 5,
    fontSize: 15,
  },
  summaryContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  classText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  tagBase: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f0f0f0",
  },
  tagTextBase: {
    fontSize: 12,
  },
  warningText: {
    color: "red",
    marginTop: 5,
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  studentItem: {
    flexDirection: "column",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  attendanceControl: {
    paddingLeft: 50,
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 8,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 8,
    borderWidth: 1,
  },
  radioText: {
    marginLeft: 5,
    fontWeight: "bold",
  },
  checkInTime: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  checkInText: {
    marginLeft: 5,
    color: "#52c41a",
    fontSize: 14,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginTop: 8,
    fontSize: 14,
    backgroundColor: "#fafafa",
    textAlignVertical: "top",
  },
  generalNoteContainer: {
    marginTop: 20,
  },
  generalNoteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  generalNoteInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
    textAlignVertical: "top",
    minHeight: 80,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1890ff",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    marginTop: 30,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 10,
    color: "#888",
    textAlign: "center",
    fontSize: 15,
  },
  loading: {},
});

export default TakeAttendance;
