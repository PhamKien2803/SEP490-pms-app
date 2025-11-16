import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const infoItems = [
  {
    key: "class_info",
    label: "Thông tin lớp học",
    icon: "users",
    color: "#1890ff",
    screen: "InformationClass",
  },
  {
    key: "attendance",
    label: "Điểm danh",
    icon: "clipboard-check",
    color: "#52c41a",
    screen: "CheckIn",
  },
  {
    key: "evaluation",
    label: "Đánh giá học sinh",
    icon: "star",
    color: "#faad14",
    screen: "Feedback",
  },
  {
    key: "schedule",
    label: "Thời khoá biểu",
    icon: "calendar-alt",
    color: "#722ed1",
    screen: "TimeTable",
  },
];

const COLORS = {
  text: "#000",
  textSecondary: "#8c8c8c",
  background: "#f0f2f5",
  white: "#fff",
  border: "#d9d9d9",
};

interface InfoItemProps {
  label: string;
  icon: string;
  color: string;
  screen: string;
  onPress: (screen: string) => void;
}

const InfoCardItem: React.FC<InfoItemProps> = ({
  label,
  icon,
  color,
  screen,
  onPress,
}) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(screen)}>
    <View
      style={[
        styles.iconBox,
        { backgroundColor: color + "1a", borderColor: color },
      ]}
    >
      <FontAwesome5 name={icon} size={28} color={color} solid={true} />
    </View>
    <Text style={styles.cardLabel}>{label}</Text>
    <FontAwesome5 name="chevron-right" size={14} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

const Information = () => {
  const navigation = useNavigation();
  const handleNavigate = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {infoItems.map((item) => (
          <InfoCardItem
            key={item.key}
            label={item.label}
            icon={item.icon}
            color={item.color}
            screen={item.screen}
            onPress={handleNavigate}
          />
        ))}
      </View>
    </View>
  );
};

export default Information;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
  },
  cardLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },
});
