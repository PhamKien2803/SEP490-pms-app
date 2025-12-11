import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import { Student } from '../types/user';
import HomeScreen from '../screens/HomeScreen';
// Đảm bảo đường dẫn import chính xác với cấu trúc thư mục của bạn
import ScheduleScreen from '../screens/parent-dashboard/screen/ScheduleScreen';
import MenuScreen from '../screens/parent-dashboard/screen/MenuScreen';
import FeedbackScreen from '../screens/parent-dashboard/screen/FeedbackScreen';
import AttendanceScreen from '../screens/parent-dashboard/screen/AttendanceScreen';
import HealthProfileScreen from '../screens/parent-dashboard/screen/HealthProfileScreen';
import GuardianListScreen from '../screens/parent-dashboard/screen/GuardianListScreen';
import PaymentWebViewScreen from '../screens/parent-dashboard/screen/PaymentWebViewScreen';
import Tuition from '../screens/parent-dashboard/screen/TuitionScreen';
import GuardianScreen from '../screens/parent-dashboard/screen/GuardianScreen';
import ParentProfileScreen from '../screens/parent-dashboard/screen/ParentProfileScreen';
import PostScreen from '../screens/parent-dashboard/screen/PostScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export type AuthStackParamList = {
  Login: undefined;
  Home: undefined;
  Schedule: { student: Student };
  Menu: { student: Student };
  Feedback: { student: Student };
  Attendance: { student: Student };
  HealthProfile: { student: Student };
  GuardianList: { student: Student };
  PaymentWebView: { url: string };
  Guardian: { student: Student };
  Tuition: { student: Student };
  ParentProfileScreen: { student: Student };
  PostScreen: { student: Student }; 
};

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ title: "Schedule" }} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="HealthProfile" component={HealthProfileScreen} />
      <Stack.Screen name="GuardianList" component={GuardianListScreen} />
      <Stack.Screen name="Guardian" component={GuardianScreen} />
      <Stack.Screen name="ParentProfile" component={ParentProfileScreen} />
      <Stack.Screen name="Tuition" component={Tuition} />
      <Stack.Screen name="Post" component={PostScreen} />
      <Stack.Screen 
        name="PaymentWebView" 
        component={PaymentWebViewScreen} 
        options={{ presentation: 'modal', headerShown: false }} // Có thể để dạng modal cho đẹp
      />
    </Stack.Navigator>
  );
};

export default AuthStack;