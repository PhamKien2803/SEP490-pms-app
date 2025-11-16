import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
// Thêm import cho icon
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Menu">;

type Ingredient = {
  name: string;
  gram: number;
  unit: string;
  calories: number;
  protein: number;
  lipid: number;
  carb: number;
};

type Food = {
  _id: string;
  foodName: string;
  totalCalories: number;
  ingredients: Ingredient[];
};

type Meal = {
  mealType: string;
  foods: { food: Food }[];
};

type DayMenu = {
  date: string;
  meals: Meal[];
};

type Menu = {
  _id: string;
  weekStart: string;
  weekEnd: string;
  ageGroup: string;
  days: DayMenu[];
};

const MenuScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student } = route.params;
  const studentId = student._id;

  const dob = new Date(student.dob);
  const today = new Date();

  // Tính tuổi
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

  // Nhóm tuổi
  let ageCategory: string;
  if (age >= 1 && age <= 3) ageCategory = "1-3 tuổi";
  else ageCategory = "4-5 tuổi";

  const [weekOptions, setWeekOptions] = useState<{ start: string; end: string }[]>(
    []
  );
  const [selectedWeek, setSelectedWeek] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);

  // Hiển thị ngày từ Thứ 2 → Chủ nhật
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = [
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
      "Chủ nhật",
    ];
    let dayIndex = date.getDay() - 1;
    if (dayIndex < 0) dayIndex = 6;
    const dayName = days[dayIndex];
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  // Sinh tuần của một năm, tuần bắt đầu từ Thứ 2
  const generateWeeks = (year: number) => {
    const weeks: { start: string; end: string }[] = [];

    let startDate = new Date(year, 0, 1);
    const day = startDate.getDay();
    const diffToMonday = day === 0 ? 1 : 8 - day; // Handle Sunday as 0
    startDate.setDate(startDate.getDate() + diffToMonday);

    while (startDate.getFullYear() === year) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      if (endDate.getFullYear() > year) {
        endDate.setFullYear(year, 11, 31);
      }

      const format = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;

      weeks.push({
        start: format(startDate),
        end: format(endDate),
      });

      startDate.setDate(startDate.getDate() + 7);
    }

    return weeks;
  };

  useEffect(() => {
    const currentYear = today.getFullYear();
    const weeks = generateWeeks(currentYear);
    setWeekOptions(weeks);

    // Chọn tuần hiện tại
    const currentWeek = weeks.find(
      (w) => new Date(w.start) <= today && new Date(w.end) >= today
    );
    setSelectedWeek(currentWeek || weeks[0]);
  }, []);

  useEffect(() => {
    if (!selectedWeek) return;
    console.log("🚀 ~ fetchMenu ~ studentId:", studentId)

    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await userApis.getMenuByAgeAndDate(
          studentId,
          selectedWeek.start
        );
        if (res) setMenu(res);
        else setMenu(null);
      } catch (err) {
        Alert.alert("Lỗi", "Không thể tải thực đơn");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [selectedWeek, studentId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="silverware-variant" // Icon cho tiêu đề
            size={30}
            color={COLORS.primaryDark}
          />
          <Text style={styles.title}>Thực đơn tuần</Text>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedWeek?.start}
            onValueChange={(val) => {
              const week = weekOptions.find((w) => w.start === val);
              setSelectedWeek(week || null);
            }}
            style={styles.picker}
          >
            {weekOptions.map((w) => (
              <Picker.Item
                key={w.start}
                label={`${formatDate(w.start)} - ${formatDate(w.end)}`}
                value={w.start}
              />
            ))}
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : menu && menu?.days?.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {menu.days.map((day) => (
              <View key={day.date} style={styles.dayContainer}>
                <Text style={styles.dayTitle}>{formatDate(day.date)}</Text>
                {day.meals.map((meal) => (
                  <View key={meal.mealType} style={styles.mealContainer}>
                    <Text style={styles.mealTitle}>{meal.mealType}</Text>
                    {meal.foods.map(({ food }) => (
                      <View key={food._id} style={styles.foodItemContainer}>
                        <MaterialCommunityIcons
                          name="food-apple-outline" // Icon món ăn
                          size={22}
                          color={COLORS.accent}
                        />
                        <Text style={styles.foodText}>
                          {food.foodName} - {food.totalCalories} cal
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noMenuContainer}>
            <MaterialCommunityIcons
              name="calendar-remove-outline" // Icon không có menu
              size={60}
              color={COLORS.grey}
            />
            <Text style={styles.noMenuText}>Không có thực đơn cho tuần này</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Bảng màu chủ đề mầm non (xanh da trời)
const COLORS = {
  background: "#f0f8ff", // AliceBlue (màu nền xanh nhạt)
  white: "#FFFFFF",
  primary: "#00796B", // Màu Teal đậm cho tiêu đề ngày
  primaryDark: "#004D40", // Màu tiêu đề chính
  lightBlue: "#81D4FA", // Màu xanh da trời sáng (viền)
  textPrimary: "#333333", // Màu chữ chính
  textSecondary: "#555555", // Màu chữ phụ (món ăn)
  textLight: "#757575", // Màu chữ mờ
  accent: "#FFA726", // Màu cam/vàng cho icon (tạo điểm nhấn)
  borderColor: "#B2DFDB", // Màu viền nhạt
  shadow: "rgba(0, 0, 0, 0.1)",
  grey: "#BDBDBD",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primaryDark,
    textAlign: "center",
    marginLeft: 10,
  },
  pickerContainer: {
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: "hidden", // Đảm bảo bo góc hoạt động trên Android
  },
  picker: {
    // Không cần style nhiều ở đây, để mặc định
  },
  dayContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 15, // Tăng độ bo góc
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5, // Tăng độ nổi
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderColor,
    paddingBottom: 8,
  },
  mealContainer: {
    marginBottom: 10,
    paddingLeft: 12,
    borderLeftWidth: 4, // Tạo đường viền trang trí
    borderLeftColor: COLORS.lightBlue,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textTransform: "capitalize",
    marginBottom: 8,
  },
  foodItemContainer: {
    flexDirection: "row",
    alignItems: "center", // Căn icon và chữ
    marginBottom: 6,
  },
  foodText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 10, // Khoảng cách giữa icon và chữ
    flexShrink: 1, // Cho phép text tự xuống dòng
  },
  noMenuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    opacity: 0.8,
  },
  noMenuText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 18,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
});

export default MenuScreen;