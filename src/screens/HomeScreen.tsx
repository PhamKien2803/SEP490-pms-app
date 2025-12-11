import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import { logout, getCurrentUser } from '../redux/authSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import type { User, Student } from '../types/user';
import { AuthStackParamList } from '../routes/AuthStack';

// Định nghĩa lại NavProp để bao gồm các màn hình mới nếu chưa cập nhật trong file gốc
type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Home'>;

type StudentScreen = 'Schedule' | 'Menu' | 'Feedback' | 'Attendance' | 'HealthProfile' | 'GuardianList' | 'Tuition' | 'Post';

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  iconSet: 'FontAwesome5' | 'MaterialCommunityIcons' | 'MaterialIcons' | 'Ionicons';
  screen: StudentScreen | 'Login';
  color: string; 
}

const menuItems: MenuItem[] = [
  { id: '1', name: 'Thời khóa biểu', icon: 'calendar-alt', iconSet: 'FontAwesome5', screen: 'Schedule', color: '#42A5F5' },
  { id: '2', name: 'Thực đơn', icon: 'food-fork-drink', iconSet: 'MaterialCommunityIcons', screen: 'Menu', color: '#FFA726' },
  { id: '3', name: 'Đánh giá', icon: 'star', iconSet: 'FontAwesome5', screen: 'Feedback', color: '#FFCA28' },
  { id: '4', name: 'Điểm danh', icon: 'clipboard-check-outline', iconSet: 'MaterialCommunityIcons', screen: 'Attendance', color: '#66BB6A' },
  { id: '5', name: 'Sức khỏe', icon: 'heartbeat', iconSet: 'FontAwesome5', screen: 'HealthProfile', color: '#EF5350' },
  { id: '7', name: 'Người đưa đón', icon: 'people-circle', iconSet: 'Ionicons', screen: 'GuardianList', color: '#AB47BC' },
  { id: '8', name: 'Học phí', icon: 'cash-multiple', iconSet: 'MaterialCommunityIcons', screen: 'Tuition', color: '#26C6DA' },
  // { id: '6', name: 'Đăng xuất', icon: 'logout', iconSet: 'MaterialIcons', screen: 'Login', color: '#78909C' },
  { id: '9', name: 'Album ảnh', icon: 'album', iconSet: 'MaterialIcons', screen: 'Post', color: '#78909C' },
];

const COLORS = {
  primary: '#03A9F4',      
  primaryDark: '#0288D1',  
  background: '#F0F8FF',   
  white: '#FFFFFF',
  textDark: '#263238',
  textLight: '#546E7A',
  cardShadow: 'rgba(149, 157, 165, 0.2)',
};

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();

  const [user, setUser] = useState<User | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resultAction = await dispatch(getCurrentUser());
        if (getCurrentUser.fulfilled.match(resultAction)) {
          const currentUser: User = resultAction.payload;
          setUser(currentUser);
          if (currentUser.students && currentUser.students.length > 0) {
            setSelectedStudent(currentUser.students[0]);
          }
        }
      } catch (error) {
      }
    };

    fetchUser();
  }, [dispatch]);



  const handleMenuItemPress = (item: MenuItem) => {
    if (!selectedStudent) {
      Alert.alert('Chưa chọn học sinh', 'Vui lòng chọn học sinh để tiếp tục.');
      return;
    }

    if (item.screen !== 'Login') {
      navigation.navigate(item.screen, { student: selectedStudent });
    }
  };

  // Mở màn hình Thông tin phụ huynh (ParentProfile)
  const handleOpenProfile = () => {
      // @ts-ignore - ParentProfile route đã được đăng ký trong AuthStack
      navigation.navigate('ParentProfile');
  };

  const renderIcon = (item: MenuItem) => {
    const size = 28;
    const color = COLORS.white; 

    switch (item.iconSet) {
      case 'FontAwesome5':
        return <FontAwesome5 name={item.icon as any} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={item.icon as any} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={item.icon as any} size={size} color={color} />;
      case 'Ionicons':
        return <Ionicons name={item.icon as any} size={size} color={color} />;
      default:
        return <FontAwesome5 name="question" size={size} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetingText}>Xin chào phụ huynh,</Text>
            <Text style={styles.userNameText}>{user?.fullName || 'Người dùng'}</Text>
          </View>
          
          {/* Avatar Button -> Chuyển đến ParentProfileScreen */}
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={handleOpenProfile}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="account" size={30} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Decoration Circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- STUDENT SELECTOR CARD --- */}
        <View style={styles.studentCard}>
          <View style={styles.studentHeader}>
             <MaterialCommunityIcons name="face-man-profile" size={20} color={COLORS.primary} />
             <Text style={styles.studentLabel}>Thông tin của bé:</Text>
          </View>
          
          <View style={styles.pickerWrapper}>
            {user?.students && user.students.length > 0 ? (
              <Picker
                selectedValue={selectedStudent?._id}
                onValueChange={(itemValue) => {
                  const stu = user.students.find(s => s._id === itemValue);
                  if (stu) setSelectedStudent(stu);
                }}
                style={styles.picker}
                mode="dropdown"
              >
                {user.students.map((stu) => (
                  <Picker.Item key={stu._id} label={stu.fullName} value={stu._id} style={{fontSize: 14}} />
                ))}
              </Picker>
            ) : (
              <Text style={styles.noStudentText}>Chưa có thông tin học sinh</Text>
            )}
          </View>
        </View>

        {/* --- MENU GRID --- */}
        <Text style={styles.menuTitle}>Tiện ích</Text>
        <View style={styles.gridContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBackground, { backgroundColor: item.color }]}>
                {renderIcon(item)}
              </View>
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Slogan */}
        <View style={styles.footer}>
           <Text style={styles.footerText}>Trường Mầm Non Ươm Mầm Tương Lai</Text>
           <MaterialCommunityIcons name="flower-tulip-outline" size={16} color={COLORS.primary} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  userNameText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  circle1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  scrollContainer: {
    flex: 1,
    marginTop: -30, 
    zIndex: 2,
  },
  studentCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 25,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
    marginLeft: 8,
  },
  pickerWrapper: {
    backgroundColor: '#E1F5FE', 
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  noStudentText: {
    padding: 15,
    textAlign: 'center',
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginLeft: 20,
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  menuItem: {
    width: (width - 60) / 2, 
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    opacity: 0.7,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 5,
  },
  fabButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F06292', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#F06292",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
});

export default HomeScreen;