
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import { Student } from '../types/user';
import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/parent-dashboard/screen/ScheduleScreen';
import MenuScreen from '../screens/parent-dashboard/screen/MenuScreen';
import FeedbackScreen from '../screens/parent-dashboard/screen/FeedbackScreen';
import AttendanceScreen from '../screens/parent-dashboard/screen/AttendanceScreen';
import HealthProfileScreen from '../screens/parent-dashboard/screen/HealthProfileScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export type AuthStackParamList = {
  Login: undefined;
  Home: undefined;
  Schedule: { student: Student };
  Menu: { student: Student };
  Feedback: { student: Student };
  Attendance: { student: Student };
  HealthProfile: { student: Student };
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
    </Stack.Navigator>
  );
};

export default AuthStack;