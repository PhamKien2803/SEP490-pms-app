import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { teacherApis } from "../../../services/apiServices";
import dayjs from "dayjs";

const FeedbackDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id: feedbackId } = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!feedbackId) return;
    setLoading(true);
    teacherApis
      .getFeedbackById(feedbackId)
      .then(setData)
      .catch((err: any) => {
        Alert.alert(
          "Lỗi",
          err.toString() || "Không thể tải chi tiết phản hồi."
        );
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [feedbackId, navigation]);

  const renderSectionCard = (
    title: string,
    iconName: string,
    items: { label: string; value: string | string[] | undefined }[]
  ) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Icon name={iconName} size={20} color="#1890ff" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {items.map((item, idx) => (
        <View key={idx} style={styles.detailItem}>
          <Text style={styles.detailLabel}>{item.label}: </Text>
          {Array.isArray(item.value) ? (
            <View style={styles.tagContainer}>
              {item.value.map((tag, tIdx) => (
                <View key={tIdx} style={styles.tagReminder}>
                  <Text style={styles.tagReminderText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.detailValue}>{item.value || "—"}</Text>
          )}
        </View>
      ))}
    </View>
  );

  if (loading)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1890ff" />
        <Text style={styles.loadingText}>Đang tải chi tiết phản hồi...</Text>
      </SafeAreaView>
    );

  if (!data)
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy dữ liệu phản hồi.</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.tagRow}>
            <View style={styles.infoTag}>
              <Icon name="account" size={16} color="#fff" />
              <Text style={styles.infoTagText}>
                {data?.studentId?.fullName}
              </Text>
            </View>
            <View style={styles.infoTag}>
              <Icon name="bank" size={16} color="#fff" />
              <Text style={styles.infoTagText}>{data?.classId?.className}</Text>
            </View>
            <View style={styles.infoTag}>
              <Icon name="calendar" size={16} color="#fff" />
              <Text style={styles.infoTagText}>
                {dayjs(data.date).format("DD/MM/YYYY")}
              </Text>
            </View>
          </View>
        </View>

        {/* Sinh hoạt */}
        {renderSectionCard("Ăn uống", "food-apple", [
          { label: "Bữa sáng", value: data.eating.breakfast },
          { label: "Bữa trưa", value: data.eating.lunch },
          { label: "Bữa xế", value: data.eating.snack },
          { label: "Nhận xét", value: data.eating.note },
        ])}
        {renderSectionCard("Ngủ", "sleep", [
          { label: "Thời gian", value: data.sleeping.duration },
          { label: "Chất lượng", value: data.sleeping.quality },
          { label: "Nhận xét", value: data.sleeping.note },
        ])}
        {renderSectionCard("Vệ sinh", "toilet", [
          { label: "Đi vệ sinh", value: data.hygiene.toilet },
          { label: "Rửa tay", value: data.hygiene.handwash },
          { label: "Nhận xét", value: data.hygiene.note },
        ])}

        {/* Học tập */}
        {renderSectionCard("Học tập", "book-open-page-variant", [
          { label: "Tập trung học", value: data.learning.focus },
          { label: "Tham gia bài học", value: data.learning.participation },
          { label: "Nhận xét", value: data.learning.note },
        ])}

        {/* Xã hội */}
        {renderSectionCard("Xã hội", "account-group", [
          { label: "Tương tác bạn bè", value: data.social.friendInteraction },
          { label: "Cảm xúc", value: data.social.emotionalState },
          { label: "Hành vi", value: data.social.behavior },
          { label: "Nhận xét", value: data.social.note },
        ])}

        {/* Sức khỏe & Khác */}
        {renderSectionCard("Sức khỏe", "heart-pulse", [
          { label: "Tình trạng chung", value: data.health.note },
        ])}

        {renderSectionCard("Khác", "star", [
          { label: "Nổi bật trong ngày", value: data.dailyHighlight },
          { label: "Nhận xét giáo viên", value: data.teacherNote },
          { label: "Nhắc nhở phụ huynh", value: data.reminders },
        ])}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f2f5" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 10, color: "#555" },
  scrollContent: { padding: 16, paddingBottom: 30 },

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
  backButton: { alignSelf: "flex-start", marginBottom: 10 },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  infoTag: {
    flexDirection: "row",
    backgroundColor: "#1890ff",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    alignItems: "center",
  },
  infoTagText: { color: "#fff", fontSize: 14, marginLeft: 5 },

  // Section/Card Styles
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1890ff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#1890ff",
  },

  // Detail Items
  detailItem: { flexDirection: "row", flexWrap: "wrap", marginBottom: 5 },
  detailLabel: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#555",
    width: "35%",
  },
  detailValue: { fontSize: 14, color: "#333", flex: 1 },

  // Reminders
  tagContainer: { flexDirection: "row", flexWrap: "wrap", flex: 1 },
  tagReminder: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 5,
    marginBottom: 5,
  },
  tagReminderText: { fontSize: 13, color: "#333" },
});

export default FeedbackDetails;
