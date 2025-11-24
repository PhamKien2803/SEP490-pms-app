import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import dayjs, { Dayjs } from "dayjs";

import {
  IAttendanceDetailResponse,
  IAttendanceUpdatePayload,
  IGuardian,
} from "../../../types/teacher";
import { teacherApis } from "../../../services/apiServices";

type TAttendanceStatus = "Có mặt" | "Đã đón trẻ" | "Vắng mặt";

const STATUS_CONFIG: Record<
  TAttendanceStatus,
  {
    iconName: string;
    color: string;
    text: string;
  }
> = {
  "Có mặt": { iconName: "check-circle", color: "#52c41a", text: "Có mặt" },
  "Đã đón trẻ": {
    iconName: "minus-circle",
    color: "#fa8c16",
    text: "Đã đón trẻ",
  },
  "Vắng mặt": { iconName: "close-circle", color: "#f5222d", text: "Vắng mặt" },
};

interface IStudentAttendanceState {
  status: TAttendanceStatus;
  note?: string;
  noteCheckout?: string;
  timeCheckIn?: string | null;
  timeCheckOut?: string | null;
  guardian?: IGuardian | null;
}

const EditAttendance = ({ route }: any) => {
  const { id: attendanceId } = route.params;
  const navigation = useNavigation();

  const [attendanceData, setAttendanceData] =
    useState<IAttendanceDetailResponse | null>(null);
  const [attendanceState, setAttendanceState] = useState<
    Map<string, IStudentAttendanceState>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [generalNote, setGeneralNote] = useState<string>("");
  const [isEditLocked, setIsEditLocked] = useState(false);
  const [editingTimeStudentId, setEditingTimeStudentId] = useState<
    string | null
  >(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!attendanceId) return;

    setIsLoading(true);
    teacherApis
      .getAttendanceById(attendanceId)
      .then((data) => {
        setAttendanceData(data);
        setGeneralNote(data.generalNote || "");

        const stateMap = new Map<string, IStudentAttendanceState>();
        data.students.forEach((item) => {
          let normalizedStatus: TAttendanceStatus;
          const oldStatus = item.status as any;

          if (oldStatus === "Có mặt" || oldStatus === "Đi muộn") {
            normalizedStatus = "Có mặt";
          } else if (oldStatus === "Đã đón trẻ") {
            normalizedStatus = "Đã đón trẻ";
          } else {
            normalizedStatus = "Vắng mặt";
          }

          stateMap.set(item.student._id, {
            status: normalizedStatus,
            note: item.note || "",
            noteCheckout: item.noteCheckout || "",
            timeCheckIn: item.timeCheckIn || null,
            timeCheckOut: item.timeCheckOut || null,
            guardian: item.guardian || null,
          });
        });
        setAttendanceState(stateMap);

        const attendanceDate = dayjs(data.date).startOf("day");
        const today = dayjs().startOf("day");
        const diffDays = today.diff(attendanceDate, "day");

        if (diffDays > 0) {
          setIsEditLocked(true);
          Alert.alert(
            "Thông báo",
            "Điểm danh này đã quá hạn 1 ngày và không thể chỉnh sửa."
          );
        }
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu điểm danh.");
      })
      .finally(() => setIsLoading(false));
  }, [attendanceId]);

  const handleAttendanceChange = (
    studentId: string,
    field: "status" | "note" | "noteCheckout" | "timeCheckOut",
    value: string | Dayjs | null | Date
  ) => {
    setAttendanceState((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(studentId) || {
        status: "Vắng mặt" as TAttendanceStatus,
        note: "",
        noteCheckout: "",
        timeCheckIn: null,
        timeCheckOut: null,
        guardian: null,
      };

      if (field === "status") {
        current.status = value as TAttendanceStatus;
        if (current.status === "Đã đón trẻ" && !current.timeCheckOut) {
          current.timeCheckOut = dayjs().toISOString();
        }
      } else if (field === "note") {
        current.note = value as string;
      } else if (field === "noteCheckout") {
        current.noteCheckout = value as string;
      } else if (field === "timeCheckOut") {
        const timeValue = dayjs.isDayjs(value)
          ? value.toISOString()
          : dayjs(value).toISOString();
        current.timeCheckOut = timeValue;
      }

      newMap.set(studentId, current);
      return newMap;
    });
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && editingTimeStudentId) {
      handleAttendanceChange(
        editingTimeStudentId,
        "timeCheckOut",
        selectedTime
      );
      setEditingTimeStudentId(null);
    } else {
      setEditingTimeStudentId(null);
    }
  };

  const handleSubmit = async () => {
    if (!attendanceData || isEditLocked) return;

    setIsSaving(true);
    const studentsPayload: IAttendanceUpdatePayload["students"] = Array.from(
      attendanceState.entries()
    ).map(([studentId, data]) => ({
      student: studentId,
      status: data.status,
      note: data.note || undefined,
      noteCheckout: data.noteCheckout || undefined,
      timeCheckIn: data.timeCheckIn || null,
      timeCheckOut: data.timeCheckOut || null,
      guardian: data.guardian?._id || null,
    }));

    const payload: IAttendanceUpdatePayload = {
      class: attendanceData.class._id,
      schoolYear: attendanceData.schoolYear._id,
      date: attendanceData.date,
      generalNote: generalNote || undefined,
      takenBy: attendanceData.takenBy._id,
      students: studentsPayload,
    };

    try {
      await teacherApis.updateAttendance(attendanceId, payload);
      Alert.alert("Thành công", "Cập nhật điểm danh thành công!");
    } catch (error: any) {
      Alert.alert("Lỗi", error.toString() || "Cập nhật thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const summary = useMemo(() => {
    const stats = {
      present: 0,
      absent: 0,
      pickedUpChild: 0,
      total: attendanceData?.students.length || 0,
    };
    attendanceState.forEach((val) => {
      if (val.status === "Có mặt") stats.present++;
      else if (val.status === "Đã đón trẻ") stats.pickedUpChild++;
      else if (val.status === "Vắng mặt") stats.absent++;
    });
    return stats;
  }, [attendanceState, attendanceData]);

  if (isLoading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );

  if (!attendanceData)
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

  const renderStudentItem = (
    item: IAttendanceDetailResponse["students"][0]
  ) => {
    const studentId = item.student._id;
    const state = attendanceState.get(studentId) || {
      status: "Vắng mặt" as TAttendanceStatus,
      note: "",
      noteCheckout: "",
      timeCheckIn: null,
      timeCheckOut: null,
      guardian: null,
    };
    const isEditingTime = editingTimeStudentId === studentId;

    return (
      <View key={studentId} style={styles.studentItem}>
        <View style={styles.studentInfo}>
          <Image
            source={
              item.student.imageStudent
                ? { uri: item.student.imageStudent }
                : require("../../../assets/backgroundDolphin.png")
            }
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.studentName}>{item.student.fullName}</Text>
            <Text style={styles.studentCode}>{item.student.studentCode}</Text>
          </View>
        </View>

        <View style={styles.attendanceControl}>
          <View style={styles.radioGroup}>
            {Object.keys(STATUS_CONFIG).map((key) => {
              const statusKey = key as TAttendanceStatus;
              const config = STATUS_CONFIG[statusKey];
              const isSelected = state.status === statusKey;
              return (
                <TouchableOpacity
                  key={statusKey}
                  style={[
                    styles.radioButton,
                    isSelected && { backgroundColor: config.color },
                    { borderColor: config.color },
                  ]}
                  onPress={() =>
                    handleAttendanceChange(studentId, "status", statusKey)
                  }
                  disabled={isEditLocked || isSaving}
                >
                  <Icon
                    name={config.iconName}
                    size={16}
                    color={isSelected ? "#fff" : config.color}
                  />
                  <Text
                    style={[
                      styles.radioText,
                      { color: isSelected ? "#fff" : config.color },
                    ]}
                  >
                    {config.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.timeNoteContainer}>
            {(state.status === "Có mặt" || state.status === "Đã đón trẻ") &&
              state.timeCheckIn && (
                <View style={styles.checkInTime}>
                  <Icon
                    name="clock-time-four-outline"
                    size={16}
                    color="#52c41a"
                  />
                  <Text style={styles.checkInText}>
                    Giờ vào: {dayjs(state.timeCheckIn).format("HH:mm")}
                  </Text>
                </View>
              )}

            {state.status === "Đã đón trẻ" && (
              <>
                <View style={styles.checkOutTimeContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      if (!isEditLocked) {
                        setEditingTimeStudentId(studentId);
                        setShowTimePicker(true);
                      }
                    }}
                    disabled={isEditLocked}
                  >
                    <Text
                      style={[
                        styles.checkOutText,
                        isEditLocked && { color: "#888" },
                      ]}
                    >
                      <Icon
                        name="pencil"
                        size={14}
                        color={isEditLocked ? "#888" : "#fa8c16"}
                      />{" "}
                      Giờ ra:{" "}
                      {state.timeCheckOut
                        ? dayjs(state.timeCheckOut).format("HH:mm")
                        : "Chưa có"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.noteInput}
                  placeholder="Ghi chú khi đón"
                  value={state.noteCheckout}
                  onChangeText={(text) =>
                    handleAttendanceChange(studentId, "noteCheckout", text)
                  }
                  multiline
                  numberOfLines={2}
                  editable={!isEditLocked}
                />
              </>
            )}

            {state.status === "Vắng mặt" && (
              <TextInput
                style={styles.noteInput}
                placeholder="Ghi chú (Bị ốm, ...)"
                value={state.note}
                onChangeText={(text) =>
                  handleAttendanceChange(studentId, "note", text)
                }
                multiline
                numberOfLines={2}
                editable={!isEditLocked}
              />
            )}

            <View style={styles.guardianInfo}>
              <Text style={styles.guardianLabel}>Người đón:</Text>
              <Text style={styles.guardianText}>
                {state.guardian?.fullName || "-"} (
                {state.guardian?.relationship || "..."}) - (
                {state.guardian?.phoneNumber || "..."})
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <View style={styles.infoTag}>
            <Text style={styles.infoTagText}>
              Lớp: {attendanceData.class.className}
            </Text>
          </View>
          <View style={styles.infoTag}>
            <Text style={styles.infoTagText}>
              Ngày: {dayjs(attendanceData.date).format("DD/MM/YYYY")}
            </Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryTag}>
            <Text style={styles.summaryTagText}>Sĩ số: {summary.total}</Text>
          </View>
          <View
            style={[
              styles.summaryTag,
              { backgroundColor: "#e6f7ff", borderColor: "#52c41a" },
            ]}
          >
            <Text style={[styles.summaryTagText, { color: "#52c41a" }]}>
              Có mặt: {summary.present}
            </Text>
          </View>
          <View
            style={[
              styles.summaryTag,
              { backgroundColor: "#fff7e6", borderColor: "#fa8c16" },
            ]}
          >
            <Text style={[styles.summaryTagText, { color: "#fa8c16" }]}>
              Đón trẻ: {summary.pickedUpChild}
            </Text>
          </View>
          <View
            style={[
              styles.summaryTag,
              { backgroundColor: "#fff1f0", borderColor: "#f5222d" },
            ]}
          >
            <Text style={[styles.summaryTagText, { color: "#f5222d" }]}>
              Vắng mặt: {summary.absent}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {attendanceData.students.map(renderStudentItem)}

          <View style={styles.generalNoteContainer}>
            <Text style={styles.generalNoteTitle}>
              Ghi chú chung cho buổi học
            </Text>
            <TextInput
              style={styles.generalNoteInput}
              placeholder="Nhập ghi chú chung (ví dụ: Lớp ngoan, thời tiết...)"
              value={generalNote}
              onChangeText={setGeneralNote}
              multiline
              numberOfLines={3}
              editable={!isEditLocked}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isEditLocked && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isEditLocked || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="content-save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {isEditLocked ? "Đã khóa chỉnh sửa" : "Lưu cập nhật"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {showTimePicker && editingTimeStudentId && (
          <DateTimePicker
            value={dayjs(
              attendanceState.get(editingTimeStudentId)?.timeCheckOut ||
                new Date()
            ).toDate()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
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
    marginBottom: 10,
    flexWrap: "wrap",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 5,
    borderWidth: 1,
  },
  radioText: {
    marginLeft: 5,
    fontWeight: "bold",
    fontSize: 14,
  },
  timeNoteContainer: {
    marginTop: 5,
  },
  checkInTime: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  checkInText: {
    marginLeft: 5,
    color: "#52c41a",
    fontSize: 14,
  },
  checkOutTimeContainer: {
    marginBottom: 5,
  },
  checkOutText: {
    marginLeft: 5,
    color: "#fa8c16",
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
    minHeight: 50,
  },
  guardianInfo: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  guardianLabel: {
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 5,
  },
  guardianText: {
    fontSize: 14,
    color: "#555",
    flexShrink: 1,
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

export default EditAttendance;
