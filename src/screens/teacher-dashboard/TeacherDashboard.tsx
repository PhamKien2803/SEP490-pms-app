import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types/navigation';

interface MenuItemType {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap; 
    screen: keyof RootStackParamList | string;
}

interface MenuItemProps {
    item: MenuItemType;
    navigation: StackScreenProps<RootStackParamList, 'TeacherHomeStack'>['navigation']; 
}

type TeacherHomeScreenProps = StackScreenProps<RootStackParamList, 'TeacherHomeStack'>; 

const teacherMenuItems: MenuItemType[] = [
    { id: '1', title: 'Thông tin lớp học', icon: 'people-outline', screen: 'ClassInfo' },
    { id: '2', title: 'Điểm danh', icon: 'checkmark-done-circle-outline', screen: 'Attendance' },
    { id: '3', title: 'Đánh giá học sinh', icon: 'star-outline', screen: 'StudentEvaluation' },
    { id: '4', title: 'Thời khóa biểu', icon: 'calendar-outline', screen: 'Schedule' },
];

const MenuItem: React.FC<MenuItemProps> = ({ item, navigation }) => (
    <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
            if (typeof item.screen === 'string' && item.screen in (navigation.getState().routeNames)) {
                navigation.navigate(item.screen as keyof RootStackParamList); 
            } else {
                console.warn(`Màn hình "${item.screen}" không được tìm thấy trong Stack.`);
            }
        }}
    >
        <Ionicons name={item.icon} size={28} color="#007AFF" style={styles.icon} /> 
        <Text style={styles.title}>{item.title}</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="#C4C4C4" />
    </TouchableOpacity>
);

const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Quản Lý</Text>
            
            <FlatList
                data={teacherMenuItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MenuItem item={item} navigation={navigation} />} 
                contentContainerStyle={styles.listContainer}
            />
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 50, 
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