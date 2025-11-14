import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import { logout, getCurrentUser } from '../redux/authSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import type { User, Student } from '../types/user'; // User có students: Student[]

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Schedule: { student: Student };
  Menu: { student: Student };
  Evaluation: { student: Student };
  Attendance: { student: Student };
  HealthProfile: { student: Student };
};

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type StudentScreen = 'Schedule' | 'Menu' | 'Evaluation' | 'Attendance' | 'HealthProfile';

interface MenuItem {
  id: string;
  name: string;
  icon: keyof typeof FontAwesome5.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap | keyof typeof MaterialIcons.glyphMap | keyof typeof Ionicons.glyphMap;
  iconSet: 'FontAwesome5' | 'MaterialCommunityIcons' | 'MaterialIcons' | 'Ionicons';
  screen: StudentScreen | 'Login';
}

const menuItems: MenuItem[] = [
  { id: '1', name: 'Thời khóa biểu', icon: 'calendar-alt', iconSet: 'FontAwesome5', screen: 'Schedule' },
  { id: '2', name: 'Thực đơn tuần', icon: 'food-fork-drink', iconSet: 'MaterialCommunityIcons', screen: 'Menu' },
  { id: '3', name: 'Đánh giá của bé', icon: 'star', iconSet: 'FontAwesome5', screen: 'Evaluation' },
  { id: '4', name: 'Điểm danh của bé', icon: 'clipboard-list', iconSet: 'FontAwesome5', screen: 'Attendance' },
  { id: '5', name: 'Hồ sơ sức khỏe', icon: 'heartbeat', iconSet: 'FontAwesome5', screen: 'HealthProfile' },
  { id: '6', name: 'Đăng xuất', icon: 'exit-to-app', iconSet: 'MaterialIcons', screen: 'Login' },
];

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();

  const [user, setUser] = useState<User | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resultAction = await dispatch(getCurrentUser());

        if (getCurrentUser.fulfilled.match(resultAction)) {
          const currentUser: User = resultAction.payload;
          setUser(currentUser);
          if (currentUser.students && currentUser.students.length > 0) {
            setSelectedStudent(currentUser.students[0]); // mặc định học sinh đầu tiên
          }
        } else if (getCurrentUser.rejected.match(resultAction)) {
          console.error('Failed to fetch user:', resultAction.payload);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [dispatch]);

  // Logout
  const handleLogout = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          onPress: () => {
            dispatch(logout());
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]
    );
  };

  // Menu press
  const handleMenuItemPress = (item: MenuItem) => {
    if (item.id === '6') {
      handleLogout();
      return;
    }

    if (!selectedStudent) {
      Alert.alert('Chưa chọn học sinh', 'Vui lòng chọn học sinh để tiếp tục.');
      return;
    }

    // Navigate các screen có student
    if (['Schedule', 'Menu', 'Evaluation', 'Attendance', 'HealthProfile'].includes(item.screen)) {
      navigation.navigate(item.screen as StudentScreen, { student: selectedStudent });
    }
  };

  // Render icon
  const renderIcon = (iconName: string, iconSet: MenuItem['iconSet']) => {
    const iconColor = '#FF6347';
    switch (iconSet) {
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName as keyof typeof FontAwesome5.glyphMap} size={30} color={iconColor} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName as keyof typeof MaterialCommunityIcons.glyphMap} size={30} color={iconColor} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as keyof typeof MaterialIcons.glyphMap} size={30} color={iconColor} />;
      case 'Ionicons':
        return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={30} color={iconColor} />;
      default:
        return <FontAwesome5 name="question-circle" size={30} color={iconColor} />;
    }
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => handleMenuItemPress(item)}>
      <View style={styles.iconContainer}>{renderIcon(item.icon as string, item.iconSet)}</View>
      <Text style={styles.menuText}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render student selector using Picker
  const renderStudentSelector = () => {
    if (!user?.students || user.students.length === 0) return null;

    return (
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStudent?._id}
          onValueChange={(itemValue) => {
            const stu = user.students.find(s => s._id === itemValue);
            if (stu) setSelectedStudent(stu);
          }}
          style={styles.picker}
          dropdownIconColor="#0D47A1"
        >
          {user.students.map((stu) => (
            <Picker.Item key={stu._id} label={stu.fullName} value={stu._id} />
          ))}
        </Picker>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Xin chào!</Text>
        <Text style={styles.subtitle}>{user?.fullName || 'Phụ huynh'}</Text>
        <Text style={styles.welcomeText}>Chào mừng bạn trở lại!</Text>
      </View>

      {/* Student selector */}
      {renderStudentSelector()}

      {/* Menu */}
      <ScrollView contentContainerStyle={styles.menuGrid} showsVerticalScrollIndicator={false}>
        {menuItems.map(renderMenuItem)}
      </ScrollView>
 
      <Text style={styles.footerText}>Trường Mầm Non Ươm Mầm Tương Lai</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA', // nền xanh nhạt dịu mắt
    padding: 10,
  },
  picker: {
    // height: 50,
    color: '#08979c', // chữ xanh chủ đạo
  },
  header: {
    padding: 20,
    backgroundColor: '#08979c', // màu chủ đạo
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#066d72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff', // chữ trắng nổi bật
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ff9800', // cam rực rỡ cho tên phụ huynh
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#ffd54f', // vàng nhẹ, thân thiện
    fontStyle: 'italic',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  pickerContainer: {
    marginVertical: 10,
    borderRadius: 15,
    backgroundColor: '#B2EBF2', // hoặc màu bạn muốn
    padding: 10,
    shadowColor: '#08979c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    width: '46%',
    backgroundColor: '#B2EBF2', // xanh nhạt làm nền item
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#08979c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
    minHeight: 130,
  },
  iconContainer: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#ffcc80', // cam nhạt cho icon nổi bật
    shadowColor: '#ffb74d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    color: '#08979c', // chữ xanh chủ đạo
  },
  footerText: {
    textAlign: 'center',
    color: '#08979c',
    fontSize: 12,
    marginTop: 'auto',
    marginBottom: 10,
    fontStyle: 'italic',
  }
});

export default HomeScreen;
