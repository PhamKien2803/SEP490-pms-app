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
  TextInput,
  Platform,
  Pressable,
} from "react-native";
import dayjs, { Dayjs } from "dayjs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { IFeedbackListItem, IClassInfo } from "../../types/teacher";
import { schoolYearApis, teacherApis } from "../../services/apiServices";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import CustomSelect, {
  SelectOption,
} from "../../components/select/CustomSelect";
import LoadingOverlay from "../../components/loading/Loading";

const constants = { APP_PREFIX: "/app" };
const usePagePermission = () => ({ canUpdate: true, canCreate: true });
const usePageTitle = (title: string) => {};

const FeedBack = () => {
  usePageTitle("Phản hồi học sinh - Cá Heo Xanh");
  const navigation = useNavigation<any>();
  const user = useCurrentUser();
  const teacherId = user?.staff;

  const [date, setDate] = useState<Dayjs>(dayjs());
  const [feedbacks, setFeedbacks] = useState<IFeedbackListItem[]>([]);
  const [allFeedbacks, setAllFeedbacks] = useState<IFeedbackListItem[]>([]); // Lưu trữ tất cả feedback để lọc
  const [loading, setLoading] = useState(false);
  const [isLoadingTeacherData, setIsLoadingTeacherData] = useState(false);
  const { canUpdate, canCreate } = usePagePermission();
  const [schoolYears, setSchoolYears] = useState<
    { _id: string; schoolYear: string }[]
  >([]);
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<
    string | null
  >(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentClass: IClassInfo | undefined = useMemo(
    () =>
      teacherData?.classes?.find((c: IClassInfo) => c._id === selectedClassId),
    [teacherData, selectedClassId]
  );

  // 1. Tải năm học và lớp ban đầu
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
            setSelectedClassId(data.classes[0]._id);
          }
        }
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error.toString() || "Không thể tải thông tin lớp hoặc năm học."
        );
      } finally {
        setIsLoadingTeacherData(false);
      }
    };
    init();
  }, [teacherId]);

  // 2. Tải Feedbacks khi Class hoặc Date thay đổi
  const fetchFeedbacks = useCallback(async () => {
    if (!selectedClassId) {
      setFeedbacks([]);
      setAllFeedbacks([]);
      return;
    }
    try {
      setLoading(true);
      const data: IFeedbackListItem[] =
        await teacherApis.getFeedbackByClassAndDate(
          selectedClassId,
          dayjs(date).format("YYYY-MM-DD")
        );

      // Thêm key để FlatList hoạt động tốt
      const keyedData = data.map((f) => ({ ...f, key: f._id }));

      setAllFeedbacks(keyedData);
      setFeedbacks(keyedData);
    } catch (error: any) {
      Alert.alert("Lỗi", error.toString() || "Không thể tải dữ liệu phản hồi.");
      setFeedbacks([]);
      setAllFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, date]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // 3. Logic tìm kiếm (Client-side filtering)
  useEffect(() => {
    if (!searchQuery) {
      setFeedbacks(allFeedbacks);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = allFeedbacks.filter(
        (f) =>
          f.studentId?.fullName.toLowerCase().includes(lowerCaseQuery) ||
          f.dailyHighlight?.toLowerCase().includes(lowerCaseQuery)
      );
      setFeedbacks(filtered);
    }
  }, [searchQuery, allFeedbacks]);

  // 4. Các Options cho CustomSelect
  const classOptions: SelectOption[] = useMemo(
    () =>
      teacherData?.classes?.map((c: IClassInfo) => ({
        label: c.className,
        value: c._id,
      })) || [],
    [teacherData]
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setDate(dayjs(selectedDate));
    }
  };

  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
  };

  const renderFeedbackItem = ({ item }: { item: IFeedbackListItem }) => {
    const student = item.studentId;
    const studentAge = dayjs().diff(dayjs(student?.dob), "year");
    const formattedDob = dayjs(student?.dob).format("DD/MM/YYYY");
    const hasFeedback = !!item.dailyHighlight || !!item.teacherNote;

    return (
      <View style={styles.listItem}>
        <View style={styles.listItemHeader}>
          <Icon name="account-details-outline" size={20} color="#1890ff" />
          <Text style={styles.studentNameText} numberOfLines={1}>
            {student?.fullName || "N/A"}
          </Text>
          <View
            style={[
              styles.tag,
              { backgroundColor: hasFeedback ? "#e6f7ff" : "#f5f5f5" },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: hasFeedback ? "#1890ff" : "#8c8c8c" },
              ]}
            >
              {hasFeedback ? "Đã có phản hồi" : "Chưa có dữ liệu"}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Ngày sinh:</Text>
          <Text style={styles.value}>
            {studentAge} tuổi ({formattedDob})
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Lớp:</Text>
          <Text style={styles.value}>{item.classId?.className || "N/A"}</Text>
        </View>
        {item.dailyHighlight && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Điểm nổi bật:</Text>
            <Text
              style={[styles.value, styles.highlightText]}
              numberOfLines={2}
            >
              {item.dailyHighlight}
            </Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#1890ff" }]}
            onPress={() =>
              navigation.navigate("FeedbackDetails", { id: item._id })
            }
          >
            <Icon name="eye-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Xem</Text>
          </TouchableOpacity>
          {canUpdate && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#faad14" }]}
              onPress={() =>
                navigation.navigate("EditFeedback", { id: item._id })
              }
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
        <LoadingOverlay visible={loading} />

        <View style={styles.titleCard}>
          <Icon name="comment-text-multiple-outline" size={24} color="#333" />
          <Text style={styles.title}>Phản hồi học sinh</Text>
          {currentClass && (
            <View style={styles.classTag}>
              <Text style={styles.classTagText}>{currentClass.className}</Text>
            </View>
          )}
        </View>

        {canCreate && (
          <TouchableOpacity
            style={styles.takeAttendanceButton}
            onPress={() => navigation.navigate("TakeFeedback")}
            disabled={!currentClass || loading}
          >
            <Icon name="form-select" size={20} color="#fff" />
            <Text style={styles.takeAttendanceButtonText}>
              Đánh giá hôm nay
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.controlsContainer}>
          <CustomSelect
            data={classOptions}
            selectedValue={selectedClassId || undefined}
            onValueChange={setSelectedClassId}
            placeholder="Chọn lớp"
            disabled={isLoadingTeacherData || loading}
            style={styles.selectControl}
          />

          {Platform.OS === "android" ? (
            <View>
              <Pressable
                onPress={handleOpenDatePicker} // Kích hoạt showDatePicker = true
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

        <View style={styles.searchContainer}>
          <Icon
            name="magnify"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.listWrapper}>
          {feedbacks.length === 0 && !loading && !searchQuery ? (
            <View style={styles.emptyContainer}>
              <Icon name="comment-alert-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                {!currentClass || !selectedClassId
                  ? "Vui lòng chọn lớp để xem phản hồi."
                  : "Không có phản hồi nào trong ngày này."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={feedbacks}
              renderItem={renderFeedbackItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                !loading && searchQuery ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="comment-alert-outline" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>
                      Không tìm thấy kết quả phù hợp.
                    </Text>
                  </View>
                ) : null
              }
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
    marginBottom: 10,
    // zIndex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
    paddingHorizontal: 10,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
  },
  selectControl: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    height: 50,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    marginLeft: 5,
    fontSize: 15,
  },
  listWrapper: {
    flex: 1,
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
  studentNameText: {
    fontSize: 16,
    fontWeight: "bold",
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
  highlightText: {
    color: "#08979c",
    fontStyle: "italic",
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

export default FeedBack;
