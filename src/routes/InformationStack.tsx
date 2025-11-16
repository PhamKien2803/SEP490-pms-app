import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Information from "../screens/teacher-dashboard/information/Information";
import TimeTable from "../screens/teacher-dashboard/time-table/TimeTable";
import InformationClass from "../screens/information-class/InformationClass";
import StudentDetailScreen from "../screens/information-class/student-detail/StudentDetailScreen";
import Feedback from "../screens/feedback/Feedback";
import CheckIn from "../screens/checkin/CheckIn";

export type InformationStackParamList = {
  InformationMain: undefined;
  InfoDetail: { id: string };
  ProfileEdit: undefined;
};

const Stack = createStackNavigator<InformationStackParamList>();

const InformationStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="InformationMain"
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          color: "#1890ff",
          fontWeight: "bold",
          fontSize: 22,
        },
      }}
    >
      <Stack.Screen
        name="InformationMain"
        component={Information}
        options={{ title: "Quản lý Học vụ" }}
      />
      <Stack.Screen
        name="InformationClass"
        component={InformationClass}
        options={{ title: "Thông tin Lớp học" }}
      />
      <Stack.Screen
        name="StudentDetail"
        component={StudentDetailScreen}
        options={{ title: "Chi tiết học sinh" }}
      />
      <Stack.Screen
        name="TimeTable"
        component={TimeTable}
        options={{ title: "Thời khoá biểu" }}
      />
      <Stack.Screen
        name="CheckIn"
        component={CheckIn}
        options={{ title: "Điểm danh" }}
      />
      <Stack.Screen
        name="Feedback"
        component={Feedback}
        options={{ title: "Đánh giá học sinh" }}
      />
    </Stack.Navigator>
  );
};

export default InformationStack;
