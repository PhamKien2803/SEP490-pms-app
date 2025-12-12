import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScheduleScreen from "../screens/parent-dashboard/screen/ScheduleScreen";
import MenuScreen from "../screens/parent-dashboard/screen/MenuScreen";
import FeedbackScreen from "../screens/parent-dashboard/screen/FeedbackScreen";
import AttendanceScreen from "../screens/parent-dashboard/screen/AttendanceScreen";
import HealthProfileScreen from "../screens/parent-dashboard/screen/HealthProfileScreen";
import GuardianListScreen from "../screens/parent-dashboard/screen/GuardianListScreen";
import PaymentWebViewScreen from '../screens/parent-dashboard/screen/PaymentWebViewScreen';
import Tuition from "../screens/parent-dashboard/screen/TuitionScreen";
import HomeScreen from "../screens/HomeScreen";
import GuardianScreen from "../screens/parent-dashboard/screen/GuardianScreen";
import ParentProfileScreen from '../screens/parent-dashboard/screen/ParentProfileScreen';
import PostScreen from '../screens/parent-dashboard/screen/PostScreen';

export type InformationStackParamList = {
  Home: { student: any };
  Schedule: { student: any };
  Menu: { student: any };
  Feedback: { student: any };
  Attendance: { student: any };
  HealthProfile: { student: any };
  GuardianList: { student: any };
  PaymentWebView: { url: string };
  Guardian: { student: any };
  Tuition: { student: any };
  ParentProfile: { student: any };
  Post: { student: any };
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

export default InformationStack;
