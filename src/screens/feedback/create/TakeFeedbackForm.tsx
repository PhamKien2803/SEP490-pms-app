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
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import dayjs from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

import {
  IClassInfo,
  IFeedbackBasePayload,
  IFeedbackCreatePayload,
  IStudent,
  IFeedbackUpdatePayload,
} from "../../../types/teacher";
import { teacherApis } from "../../../services/apiServices";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
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
  GOOD_FEEDBACK_TEMPLATE,
} from "../../../constants";

const { width } = Dimensions.get("window");

const TakeFeedbackForm = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useCurrentUser();
  const teacherId = user?.staff;

  const {
    student,
    currentClass,
    date: dateIso,
    initialFeedback,
  } = route.params as {
    student: IStudent;
    currentClass: IClassInfo;
    date: string;
    isExisting: boolean;
    initialFeedback?: any;
  };

  const initialRemindersArray: string[] = Array.isArray(
    initialFeedback?.reminders
  )
    ? initialFeedback.reminders
    : Array.isArray(GOOD_FEEDBACK_TEMPLATE.reminders)
    ? GOOD_FEEDBACK_TEMPLATE.reminders
    : [];

  const initialRemindersInput = initialRemindersArray.join(", ");

  console.log("initialFeedback", initialFeedback);

  const [feedbackState, setFeedbackState] = useState<IFeedbackBasePayload>(
    initialFeedback
      ? {
          eating: initialFeedback.eating,
          sleeping: initialFeedback.sleeping,
          hygiene: initialFeedback.hygiene,
          learning: initialFeedback.learning,
          social: initialFeedback.social,
          health: initialFeedback.health,
          dailyHighlight: initialFeedback.dailyHighlight,
          teacherNote: initialFeedback.teacherNote,
          reminders: initialRemindersArray,
        }
      : {
          eating: { breakfast: "", lunch: "", snack: "", note: "" },
          sleeping: { duration: "", quality: "", note: "" },
          hygiene: { toilet: "", handwash: "", note: "" },
          learning: { focus: "", participation: "", note: "" },
          social: {
            friendInteraction: "",
            emotionalState: "",
            behavior: "",
            note: "",
          },
          health: { note: "" },
          dailyHighlight: "",
          teacherNote: "",
          reminders: [],
        }
  );
  const [reminders, setReminders] = useState<string[]>(initialRemindersArray);
  const [tempRemindersInput, setTempRemindersInput] = useState(
    initialRemindersInput
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPastDate = dayjs(dateIso).isBefore(dayjs().startOf("day"));
  const isExisting = !!initialFeedback;
  const isFormDisabled = isPastDate || isExisting;

  const form = useMemo(
    () => ({
      setFieldsValue: (values: Partial<IFeedbackBasePayload>) => {
        if (values.reminders) {
          const rems = Array.isArray(values.reminders) ? values.reminders : [];
          setReminders(rems as string[]);
          setTempRemindersInput(rems.join(", "));
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

  const onFinish = async () => {
    const values = form.getFieldsValue();

    const finalReminders = tempRemindersInput
      .split(",")
      .map((t: any) => t.trim())
      .filter((t: any) => t);

    const isEmpty =
      !Object.values(values).some((section) => {
        if (typeof section === "string" && section) return true;
        if (typeof section === "object" && section !== null) {
          return Object.values(section).some(
            (v) => v && (!Array.isArray(v) || v.length > 0)
          );
        }
        return false;
      }) && finalReminders.length === 0;

    if (isEmpty) {
      Alert.alert(
        "Cảnh báo",
        "Vui lòng nhập ít nhất một nội dung trước khi lưu."
      );
      return;
    }
    if (!currentClass || !teacherId || !student) return;

    if (isFormDisabled) {
      Alert.alert(
        "Cảnh báo",
        "Không thể lưu/chỉnh sửa phản hồi. Vui lòng quay lại màn hình danh sách."
      );
      return;
    }

    setIsSubmitting(true);

    const basePayload: IFeedbackBasePayload = {
      ...values,
      reminders: finalReminders,
    };

    try {
      if (isExisting) {
        const payload: IFeedbackUpdatePayload = {
          ...basePayload,
          students: (initialFeedback.studentId as any)._id,
          classId: (initialFeedback.classId as any)._id,
          teacherId: initialFeedback.teacherId,
          date: dateIso,
        };
        await teacherApis.updateFeedback(initialFeedback._id, payload);
      } else {
        const payload: IFeedbackCreatePayload = {
          ...basePayload,
          students: [student._id],
          classId: currentClass._id,
          teacherId,
          date: dateIso,
        };
        await teacherApis.createFeedback(payload);
      }

      Alert.alert(
        "Thành công",
        `Đã lưu phản hồi cho học sinh ${student.fullName}!`
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.toString() ||
          (isExisting
            ? "Cập nhật phản hồi thất bại."
            : "Tạo phản hồi thất bại.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    const template = GOOD_FEEDBACK_TEMPLATE as IFeedbackBasePayload;

    form.setFieldsValue(template);

    const rems = Array.isArray(template.reminders) ? template.reminders : [];
    setReminders(rems);
    setTempRemindersInput(rems.join(", "));

    Alert.alert(
      "Thành công",
      "Đã áp dụng mẫu phản hồi tốt! Vui lòng kiểm tra lại trước khi lưu."
    );
  };

  const renderOptionSelect = (
    options: { label: string; value: string }[],
    section: string,
    field: string,
    value: string
  ) => (
    <View style={styles.selectWrapper}>
      <Text style={styles.selectLabel}>Chọn nhanh:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
        style={styles.optionScroll}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonActive,
            ]}
            onPress={() => form.handleValueChange(section, field, option.value)}
            disabled={isFormDisabled}
          >
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.optionTextActive,
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
        ? tempRemindersInput
        : (feedbackState as any)[section]?.[field] ||
          (feedbackState as any)[field] ||
          "";

    const displayValue = type === "select" ? stateValue : "";

    return (
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldTitle}>
          {title}: {displayValue}
        </Text>

        {type === "select" && options ? (
          renderOptionSelect(options, section, field, stateValue)
        ) : (
          <TextInput
            style={multiline ? styles.textArea : styles.input}
            value={stateValue}
            onChangeText={(text) => {
              if (section === "reminders") {
                setTempRemindersInput(text);
              } else if (
                section === "dailyHighlight" ||
                section === "teacherNote"
              ) {
                setFeedbackState((prev) => ({ ...prev, [section]: text }));
              } else {
                form.handleValueChange(section, field, text);
              }
            }}
            onBlur={() => {
              if (section === "reminders") {
                setReminders(
                  tempRemindersInput
                    .split(",")
                    .map((t: any) => t.trim())
                    .filter((t: any) => t)
                );
              }
            }}
            placeholder={placeholder || `Nhập ${title.toLowerCase()}...`}
            multiline={multiline}
            editable={!isFormDisabled}
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
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Icon name={iconName} size={20} color="#1890ff" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{content}</View>
    </View>
  );

  const renderFormContent = useMemo(
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
              title: "Thời gian ngủ (phút)",
              section: "sleeping",
              field: "duration",
              type: "input",
              placeholder: "VD: 120",
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
              type: "textarea",
              multiline: true,
              placeholder: "VD: Mang thêm bỉm, Mang thêm sữa.",
            })}
          </View>
        )}
      </View>
    ),
    [feedbackState, isFormDisabled, tempRemindersInput]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerCard}>
            <Text style={styles.studentNameText}>
              <Icon name="account-circle-outline" size={16} />
              {""} {student.fullName} (Lớp: {currentClass.className})
            </Text>
            <Text style={styles.dateText}>
              <Icon name="calendar-month" size={16} /> Ngày:{" "}
              {dayjs(dateIso).format("DD/MM/YYYY")}
            </Text>
            {isPastDate && (
              <Text style={styles.pastDateWarning}>
                <Icon name="alert-circle-outline" size={16} /> KHÔNG THỂ CHỈNH
                SỬA NGÀY CŨ
              </Text>
            )}
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formContentContainer}>
              <View style={styles.formScrollView}>{renderFormContent}</View>

              <View style={styles.actionFooter}>
                {!isFormDisabled && (
                  <TouchableOpacity
                    style={styles.quickFillButton}
                    onPress={handleQuickFill}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    <Icon name="flash" size={18} color="#fff" />
                    <Text style={styles.quickFillText}>Gợi ý điền nhanh</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isFormDisabled && styles.disabledButton,
                  ]}
                  onPress={onFinish}
                  disabled={isFormDisabled || isSubmitting}
                  activeOpacity={0.8}
                >
                  <Icon name="content-save-outline" size={20} color="#fff" />
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" style={{ marginLeft: 8 }} />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {isExisting ? "Lưu cập nhật" : "Lưu phản hồi"}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 50 },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: { alignSelf: "flex-start", marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  headerMeta: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  studentNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1890ff",
    marginBottom: 5,
  },
  dateText: { fontSize: 14, color: "#555" },
  pastDateWarning: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ff4d4f",
    marginTop: 5,
  },

  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formContentContainer: { padding: 16, flex: 1, position: "relative" },
  formScrollView: { flex: 1 },

  disabledOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
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

  fieldBlock: {
    marginBottom: 15,
    width: "100%",
  },
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

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    minHeight: 40,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 15,
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
  optionText: { color: "#333" },
  optionTextActive: { color: "#fff", fontWeight: "bold" },

  actionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  quickFillButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faad14",
    padding: 10,
    borderRadius: 8,
  },
  quickFillText: { color: "#fff", marginLeft: 5, fontWeight: "bold" },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#52c41a",
    padding: 10,
    borderRadius: 8,
  },
  saveButtonText: { color: "#fff", marginLeft: 5, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#ccc" },
});

export default TakeFeedbackForm;
