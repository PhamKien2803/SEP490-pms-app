import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../routes';

type TeacherHomeScreenProps = StackScreenProps<RootStackParamList, 'TeacherHomeStack'>; 

// --- Dữ liệu Menu Chức năng ---
const teacherMenuItems = [
    { id: '1', title: 'Trang chủ', icon: 'home-outline', screen: 'Dashboard' },
    { id: '2', title: 'Quản lý bài đăng', icon: 'newspaper-outline', screen: 'PostManagement' },
    { id: '3', title: 'Thông tin lớp học', icon: 'people-outline', screen: 'ClassInfo' },
    { id: '4', title: 'Điểm danh', icon: 'checkmark-done-circle-outline', screen: 'Attendance' },
    { id: '5', title: 'Đánh giá học sinh', icon: 'star-outline', screen: 'StudentEvaluation' },
    { id: '6', title: 'Thời khóa biểu', icon: 'calendar-outline', screen: 'Schedule' },
    { id: '7', title: 'Báo giảng', icon: 'book-outline', screen: 'LessonReport' },
];
const MenuItem = ({ item, navigation }) => (
    <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
            // Log ra tên màn hình và điều hướng (cần định nghĩa các màn hình này trong TeacherStack)
            console.log(`Navigating to: ${item.screen}`);
            // navigation.navigate(item.screen as never); // Dùng 'as never' tạm thời hoặc định nghĩa chính xác types
        }}
    >
        <Ionicons name={item.icon as any} size={28} color="#007AFF" style={styles.icon} />
        <Text style={styles.title}>{item.title}</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="#C4C4C4" />
    </TouchableOpacity>
);

// --- Component Màn hình chính ---
const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Quản Lý Giáo Viên</Text>
            
            <FlatList
                data={teacherMenuItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MenuItem item={item} navigation={navigation} />}
                contentContainerStyle={styles.listContainer}
            />
            
            <Text style={styles.note}>Các chức năng chi tiết sẽ được phát triển trong các màn hình riêng.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 50, // Điều chỉnh nếu không dùng headerShown: false
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        marginBottom: 20,
        color: '#333',
    },
    listContainer: {
        paddingHorizontal: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 15,
        marginVertical: 4,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    icon: {
        marginRight: 15,
        width: 30,
        textAlign: 'center',
    },
    title: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    note: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
        paddingBottom: 20,
    }
});

export default TeacherHomeScreen;