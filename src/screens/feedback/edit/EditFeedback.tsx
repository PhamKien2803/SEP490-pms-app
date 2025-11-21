import React, { useState, useEffect, useMemo, JSX } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import dayjs, { Dayjs } from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

import {
  IFeedbackDetailResponse,
  IFeedbackUpdatePayload,
  IFeedbackBasePayload,
} from "../../../types/teacher";
import { teacherApis } from "../../../services/apiServices";
import {
  BEHAVIOR_OPTIONS,
  EATING_OPTIONS,
  EMOTION_OPTIONS,
  FOCUS_OPTIONS,
  HANDWASH_OPTIONS,
  INTERACTION_OPTIONS,
  PARTICIPATION_OPTIONS,
  SLEEP_QUALITY_OPTIONS,
  TOILET_OPTIONS,
} from "../../../constants";

const EditFeedback = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackDetail, setFeedbackDetail] = useState<any | null>(null);
  const [studentName, setStudentName] = useState<string>("Đang tải...");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const [feedbackState, setFeedbackState] = useState<IFeedbackBasePayload>(
    {} as IFeedbackBasePayload
  );
  const [reminders, setReminders] = useState<string[]>([]);

  const form = useMemo(
    () => ({
      setFieldsValue: (values: Partial<IFeedbackBasePayload>) => {
        if (values.reminders) {
          setReminders(values.reminders as string[]);
          delete values.reminders;
        }
        setFeedbackState((prev) => ({ ...prev, ...values }));
      },
      getFieldsValue: () => feedbackState,
      handleValueChange: (
        section: string,
        field: string,
        value: string | string[]
      ) => {
        setFeedbackState((prev) => {
          const newSection = prev[section as keyof IFeedbackBasePayload] || {};
          return {
            ...prev,
            [section]: { ...newSection, [field]: value },
          };
        });
      },
    }),
    [feedbackState]
  );

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const data: any = await teacherApis.getFeedbackById(id);
        setFeedbackDetail(data);

        form.setFieldsValue({
          eating: data.eating,
          sleeping: data.sleeping,
          hygiene: data.hygiene,
          learning: data.learning,
          social: data.social,
          health: data.health,
          dailyHighlight: data.dailyHighlight,
          teacherNote: data.teacherNote,
          reminders: data.reminders,
        });

        const studentFullName =
          data.studentId && typeof data.studentId === "object"
            ? data.studentId.fullName
            : "N/A";
        setStudentName(studentFullName);

        const feedbackDate = dayjs(data.date);
        const hoursDiff = dayjs().diff(feedbackDate, "hour");
        if (hoursDiff > 24) {
          setIsExpired(true);
          Alert.alert(
            "Cảnh báo",
            "Không thể chỉnh sửa phản hồi đã quá 24 giờ."
          );
        }
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error.toString() || "Không thể tải dữ liệu phản hồi."
        );
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigation]);

  const handleSubmit = async () => {
    if (!feedbackDetail) return;
    if (isExpired) {
      Alert.alert("Cảnh báo", "Không thể cập nhật phản hồi đã quá 24 giờ.");
      return;
    }

    const values = form.getFieldsValue();
    setSubmitting(true);

    const studentId =
      typeof feedbackDetail.studentId === "string"
        ? feedbackDetail.studentId
        : feedbackDetail.studentId._id;
    const classId =
      typeof feedbackDetail.classId === "string"
        ? feedbackDetail.classId
        : feedbackDetail.classId._id;

    const payload: IFeedbackUpdatePayload = {
      ...values,
      reminders,
      students: studentId,
      classId: classId,
      teacherId: feedbackDetail.teacherId,
      date: feedbackDetail.date,
    };

    try {
      await teacherApis.updateFeedback(feedbackDetail._id, payload);
      Alert.alert("Thành công", "Cập nhật phản hồi thành công!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Lỗi", error.toString() || "Lỗi khi cập nhật phản hồi.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderOptionSelect = (
    options: { label: string; value: string }[],
    section: string,
    field: string,
    value: string
  ) => (
    <View style={takeFeedbackStyles.selectWrapper}>
      <Text style={takeFeedbackStyles.selectLabel}>Chọn nhanh:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
        style={takeFeedbackStyles.optionScroll}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              takeFeedbackStyles.optionButton,
              value === option.value && takeFeedbackStyles.optionButtonActive,
            ]}
            onPress={() => form.handleValueChange(section, field, option.value)}
            disabled={isExpired || submitting}
          >
            <Text
              style={[
                takeFeedbackStyles.optionText,
                value === option.value && takeFeedbackStyles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFieldBlock = ({
    title,
    section,
    field,
    type = "select",
    options,
    placeholder,
    multiline = false,
    keyboardType = "default",
  }: {
    title: string;
    section: string;
    field: string;
    type?: "select" | "input" | "textarea";
    options?: { label: string; value: string }[];
    placeholder?: string;
    multiline?: boolean;
    keyboardType?: "default" | "numeric";
  }) => {
    const stateValue =
      section === "reminders"
        ? reminders.join(", ")
        : (feedbackState as any)[section]?.[field] ||
          (feedbackState as any)[field] ||
          "";

    return (
      <View style={takeFeedbackStyles.fieldBlock}>
        <Text style={takeFeedbackStyles.fieldTitle}>
          {title}: {type === "select" ? stateValue : ""}
        </Text>

        {type === "select" && options ? (
          renderOptionSelect(options, section, field, stateValue)
        ) : (
          <TextInput
            style={
              multiline ? takeFeedbackStyles.textArea : takeFeedbackStyles.input
            }
            value={stateValue}
            onChangeText={(text) => {
              if (section === "reminders") {
                setReminders(
                  text
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t)
                );
              } else if (
                section === "dailyHighlight" ||
                section === "teacherNote"
              ) {
                setFeedbackState((prev) => ({ ...prev, [section]: text }));
              } else {
                form.handleValueChange(section, field, text);
              }
            }}
            placeholder={placeholder || `Nhập ${title.toLowerCase()}...`}
            multiline={multiline}
            editable={!isExpired}
            keyboardType={keyboardType}
            textAlignVertical={multiline ? "top" : "center"}
          />
        )}
      </View>
    );
  };

  const renderFormSection = (
    title: string,
    iconName: string,
    content: JSX.Element
  ) => (
    <View style={takeFeedbackStyles.sectionCard}>
      <View style={takeFeedbackStyles.sectionHeader}>
        <Icon name={iconName} size={20} color="#1890ff" />
        <Text style={takeFeedbackStyles.sectionTitle}>{title}</Text>
      </View>
      <View style={takeFeedbackStyles.sectionContent}>{content}</View>
    </View>
  );

  const renderEditFormContent = useMemo(
    () => (
      <View>
        {renderFormSection(
          "Sinh hoạt",
          "calendar-check",
          <View>
            {renderFieldBlock({
              title: "Bữa sáng",
              section: "eating",
              field: "breakfast",
              options: EATING_OPTIONS,
            })}
            {renderFieldBlock({
              title: "Bữa trưa",
              section: "eating",
              field: "lunch",
              options: EATING_OPTIONS,
            })}
            {renderFieldBlock({
              title: "Bữa xế",
              section: "eating",
              field: "snack",
              options: EATING_OPTIONS,
            })}

            {renderFieldBlock({
              title: "Thời gian ngủ",
              section: "sleeping",
              field: "duration",
              type: "input",
              placeholder: "VD: 120 phút",
              keyboardType: "numeric",
            })}
            {renderFieldBlock({
              title: "Chất lượng ngủ",
              section: "sleeping",
              field: "quality",
              options: SLEEP_QUALITY_OPTIONS as any,
            })}

            {renderFieldBlock({
              title: "Đi vệ sinh",
              section: "hygiene",
              field: "toilet",
              options: TOILET_OPTIONS as any,
            })}
            {renderFieldBlock({
              title: "Rửa tay",
              section: "hygiene",
              field: "handwash",
              options: HANDWASH_OPTIONS as any,
            })}

            {renderFieldBlock({
              title: "Nhận xét ăn uống",
              section: "eating",
              field: "note",
              type: "textarea",
              multiline: true,
            })}
            {renderFieldBlock({
              title: "Nhận xét giấc ngủ",
              section: "sleeping",
              field: "note",
              type: "textarea",
              multiline: true,
            })}
            {renderFieldBlock({
              title: "Nhận xét vệ sinh",
              section: "hygiene",
              field: "note",
              type: "textarea",
              multiline: true,
            })}
          </View>
        )}

        {renderFormSection(
          "Học tập",
          "book-open-page-variant",
          <View>
            {renderFieldBlock({
              title: "Tập trung học",
              section: "learning",
              field: "focus",
              options: FOCUS_OPTIONS as any,
            })}
            {renderFieldBlock({
              title: "Tham gia bài học",
              section: "learning",
              field: "participation",
              options: PARTICIPATION_OPTIONS as any,
            })}
            {renderFieldBlock({
              title: "Nhận xét học tập",
              section: "learning",
              field: "note",
              type: "textarea",
              multiline: true,
            })}
          </View>
        )}

        {renderFormSection(
          "Xã hội",
          "account-group",
          <View>
            {renderFieldBlock({
              title: "Tương tác bạn bè",
              section: "social",
              field: "friendInteraction",
              options: INTERACTION_OPTIONS as any,
            })}
            {renderFieldBlock({
              title: "Cảm xúc",
              section: "social",
              field: "emotionalState",
              options: EMOTION_OPTIONS as any,
            })}
            {renderFieldBlock({
              title: "Hành vi",
              section: "social",
              field: "behavior",
              options: BEHAVIOR_OPTIONS as any,
            })}
            {renderFieldBlock({
              title: "Nhận xét xã hội",
              section: "social",
              field: "note",
              type: "textarea",
              multiline: true,
            })}
          </View>
        )}

        {renderFormSection(
          "Sức khỏe & Khác",
          "star",
          <View>
            {renderFieldBlock({
              title: "Tình trạng sức khỏe",
              section: "health",
              field: "note",
              type: "textarea",
              multiline: true,
            })}

            {renderFieldBlock({
              title: "Hoạt động nổi bật",
              section: "dailyHighlight",
              field: "dailyHighlight",
              type: "textarea",
              multiline: true,
            })}
            {renderFieldBlock({
              title: "Giáo viên nhận xét chung",
              section: "teacherNote",
              field: "teacherNote",
              type: "textarea",
              multiline: true,
            })}

            {renderFieldBlock({
              title: "Nhắc nhở phụ huynh",
              section: "reminders",
              field: "",
              type: "input",
              placeholder: "Phân cách bằng dấu phẩy",
            })}
          </View>
        )}
      </View>
    ),
    [feedbackState, isExpired]
  );

  if (loading) {
    return (
      <SafeAreaView style={StyleSheet.absoluteFill}>
        <View style={takeFeedbackStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text>Đang tải chi tiết phản hồi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!feedbackDetail)
    return (
      <View style={takeFeedbackStyles.emptyContainer}>
        <Text>Không tìm thấy dữ liệu.</Text>
      </View>
    );

  return (
    <SafeAreaView style={takeFeedbackStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={takeFeedbackStyles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={takeFeedbackStyles.scrollContent}>
          <View style={takeFeedbackStyles.headerCard}>
            <Text style={takeFeedbackStyles.studentNameText}>
              <Icon name="account-circle-outline" size={16} />
              {""} {studentName}
            </Text>
            <Text style={takeFeedbackStyles.dateText}>
              <Icon name="calendar-month" size={16} /> Ngày:{" "}
              {dayjs(feedbackDetail?.date).format("DD/MM/YYYY")}
            </Text>
          </View>

          <View style={takeFeedbackStyles.formColRight}>
            <View style={takeFeedbackStyles.formHeader}>
              <Text style={takeFeedbackStyles.formTitle}>
                Chi tiết phản hồi
              </Text>
            </View>

            <View style={takeFeedbackStyles.formContentContainer}>
              <ScrollView>{renderEditFormContent}</ScrollView>

              <View style={takeFeedbackStyles.actionFooter}>
                <TouchableOpacity
                  style={[
                    takeFeedbackStyles.saveButton,
                    isExpired && takeFeedbackStyles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={isExpired || submitting}
                >
                  <Icon name="content-save-outline" size={20} color="#fff" />
                  {submitting ? (
                    <ActivityIndicator color="#fff" style={{ marginLeft: 8 }} />
                  ) : (
                    <Text style={takeFeedbackStyles.saveButtonText}>
                      Lưu cập nhật
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const takeFeedbackStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 50 },
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
  studentNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1890ff",
    marginBottom: 5,
  },
  dateText: { fontSize: 14, color: "#555" },
  backButton: { alignSelf: "flex-start", marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 8, flex: 1 },
  infoText: { fontSize: 15, color: "#333", marginTop: 5 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  formColRight: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  formTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10, flex: 1 },
  formContentContainer: { padding: 16, flex: 1, position: "relative" },
  disabledOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  disabledText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
    padding: 10,
    backgroundColor: "#fff0f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff4d4f",
    textAlign: "center",
  },
  actionFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#52c41a",
    padding: 10,
    borderRadius: 8,
  },
  saveButtonText: { color: "#fff", marginLeft: 5, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#ccc" },

  sectionCard: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f7f7f7",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#1890ff",
  },
  sectionContent: { paddingVertical: 5 },
  fieldTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 5,
    marginTop: 5,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginTop: 10,
    marginBottom: 5,
  },
  selectWrapper: { marginBottom: 0 },
  selectLabel: { fontSize: 12, color: "#888", marginBottom: 5 },
  optionScroll: { paddingVertical: 5, marginHorizontal: -5 },
  optionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    marginBottom: 5,
  },
  optionButtonActive: { backgroundColor: "#1890ff", borderColor: "#1890ff" },
  optionText: { fontSize: 13, color: "#333" },
  optionTextActive: { color: "#fff", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    backgroundColor: "#fff",
    minHeight: 40,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
  },
  fieldBlock: {
    marginBottom: 15,
    width: "100%",
  },
});

export default EditFeedback;
