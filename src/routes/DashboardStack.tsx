import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScheduleScreen from "../screens/parent-dashboard/screen/ScheduleScreen";
import MenuScreen from "../screens/parent-dashboard/screen/MenuScreen";
import FeedbackScreen from "../screens/parent-dashboard/screen/FeedbackScreen";
import AttendanceScreen from "../screens/parent-dashboard/screen/AttendanceScreen";
import HealthProfileScreen from "../screens/parent-dashboard/screen/HealthProfileScreen";
import HomeScreen from "../screens/HomeScreen";

export type InformationStackParamList = {
  Home: { student: any };
  Schedule: { student: any };
  Menu: { student: any };
  Feedback: { student: any };
  Attendance: { student: any };
  HealthProfile: { student: any };
};

const Stack = createNativeStackNavigator<InformationStackParamList>();

const InformationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="HealthProfile" component={HealthProfileScreen} />
    </Stack.Navigator>
  );
};

export default InformationStack;
