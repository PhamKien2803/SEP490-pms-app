import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Menu">;

// --- Định nghĩa Types ---
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

  // State quản lý ngày bắt đầu của tuần đang chọn (Thứ 2)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Helper Functions ---

  // Lấy ngày Thứ 2 của tuần chứa ngày `d`
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  // Format ngày để hiển thị (DD/MM/YYYY)
  const formatDateDisplay = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format ngày để hiển thị tiêu đề (Thứ X, DD/MM/YYYY)
  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dayName = days[date.getDay()];
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${dayName}, ${d}/${m}/${y}`;
  };

  // Format ngày gửi lên API (YYYY-MM-DD)
  const formatDateApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Cộng/Trừ ngày
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // --- Effects & Handlers ---

  // Khởi tạo: Set ngày hiện tại về Thứ 2 đầu tuần
  useEffect(() => {
    const today = new Date();
    setCurrentWeekStart(getMonday(today));
  }, []);

  // Fetch Menu khi `currentWeekStart` thay đổi
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setMenu(null);
      try {
        const dateString = formatDateApi(currentWeekStart);
        const res = await userApis.getMenuByAgeAndDate(studentId, dateString);
        if (res) {
          setMenu(res);
        }
      } catch (err) {
        // Xử lý lỗi nhẹ nhàng, không cần alert liên tục
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [currentWeekStart, studentId]);

  // Chuyển tuần
  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  // Tính toán ngày kết thúc tuần (Chủ Nhật) để hiển thị
  const currentWeekEnd = addDays(currentWeekStart, 6);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Title */}
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name="silverware-variant"
            size={30}
            color={COLORS.primaryDark}
          />
          <Text style={styles.title}>Thực đơn tuần</Text>
        </View>

        {/* --- BỘ ĐIỀU HƯỚNG TUẦN (MỚI) --- */}
        <View style={styles.weekNavigator}>
          <TouchableOpacity onPress={handlePrevWeek} style={styles.navButton}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.weekInfo}>
            <Text style={styles.weekLabel}>TUẦN</Text>
            <Text style={styles.weekDateRange}>
              {formatDateDisplay(currentWeekStart)} - {formatDateDisplay(currentWeekEnd)}
            </Text>
          </View>

          <TouchableOpacity onPress={handleNextWeek} style={styles.navButton}>
            <MaterialCommunityIcons name="chevron-right" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Nội dung thực đơn */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : menu && menu?.days?.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {menu.days.map((day) => (
              <View key={day.date} style={styles.dayContainer}>
                {/* Tiêu đề ngày */}
                <View style={styles.dayHeader}>
                  <MaterialCommunityIcons name="calendar-today" size={20} color={COLORS.white} />
                  <Text style={styles.dayTitle}>{formatDateFull(day.date)}</Text>
                </View>

                {/* Danh sách bữa ăn */}
                <View style={styles.mealsWrapper}>
                  {day.meals.map((meal) => (
                    <View key={meal.mealType} style={styles.mealContainer}>
                      <Text style={styles.mealTitle}>{meal.mealType}</Text>
                      {meal.foods.map(({ food }) => (
                        <View key={food._id} style={styles.foodItemContainer}>
                          <MaterialCommunityIcons
                            name="food-apple-outline"
                            size={20}
                            color={COLORS.accent}
                          />
                          <Text style={styles.foodText}>
                            {food.foodName}
                            <Text style={styles.caloriesText}> ({food.totalCalories} cal)</Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        ) : (
          <View style={styles.noMenuContainer}>
            <MaterialCommunityIcons
              name="calendar-remove-outline"
              size={60}
              color={COLORS.grey}
            />
            <Text style={styles.noMenuText}>Chưa có thực đơn cho tuần này</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// --- Bảng màu & Styles ---
const COLORS = {
  background: "#F0F8FF", // AliceBlue
  white: "#FFFFFF",
  primary: "#00B4D8", // Sky Blue
  primaryDark: "#0077B6", // Darker Blue
  accent: "#FFA726", // Orange
  textPrimary: "#333333",
  textSecondary: "#555555",
  textLight: "#888888",
  grey: "#BDBDBD",
  borderColor: "#E0F7FA",
  headerBg: "#00B4D8", // Màu nền cho header ngày
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
  
  // Style cho thanh điều hướng tuần
  weekNavigator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    padding: 5,
  },
  weekInfo: {
    alignItems: "center",
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 2,
  },
  weekDateRange: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },

  // Style cho thẻ ngày
  dayContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden", // Để bo góc cho header con
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.headerBg,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginLeft: 8,
  },
  mealsWrapper: {
    padding: 16,
  },
  mealContainer: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  foodItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  foodText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  caloriesText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
  
  // Empty State
  noMenuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    opacity: 0.7,
  },
  noMenuText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
});

export default MenuScreen;