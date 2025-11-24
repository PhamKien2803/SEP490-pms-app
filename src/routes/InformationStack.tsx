import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Information from "../screens/teacher-dashboard/information/Information";
import TimeTable from "../screens/teacher-dashboard/time-table/TimeTable";
import InformationClass from "../screens/information-class/InformationClass";
import StudentDetailScreen from "../screens/information-class/student-detail/StudentDetailScreen";
import Feedback from "../screens/feedback/Feedback";
import TakeAttendance from "../screens/AttendanceHistory/create/TakeAttendance";
import AttendanceDetails from "../screens/AttendanceHistory/detail/AttendanceDetail";
import EditAttendance from "../screens/AttendanceHistory/edit/AttendanceEdit";
import AttendanceHistory from "../screens/AttendanceHistory/AttendanceHistory";
import FeedbackDetails from "../screens/feedback/detail/FeedbackDetail";
import EditFeedback from "../screens/feedback/edit/EditFeedback";
import TakeFeedback from "../screens/feedback/create/TakeFeedback";
import TakeFeedbackForm from "../screens/feedback/create/TakeFeedbackForm";

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
        name="AttendanceHistory"
        component={AttendanceHistory}
        options={{ title: "Điểm danh học sinh" }}
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
        name="Feedback"
        component={Feedback}
        options={{ title: "Đánh giá học sinh" }}
      />
      <Stack.Screen
        name="TakeAttendance"
        component={TakeAttendance}
        options={{ title: "Điểm danh học sinh" }}
      />
      <Stack.Screen
        name="AttendanceDetails"
        component={AttendanceDetails}
        options={{ title: "Chi tiết điểm danh" }}
      />
      <Stack.Screen
        name="EditAttendance"
        component={EditAttendance}
        options={{ title: "Cập nhật điểm danh" }}
      />

      <Stack.Screen
        name="FeedbackDetails"
        component={FeedbackDetails}
        options={{ title: "Chi tiết đánh giá" }}
      />
      <Stack.Screen
        name="EditFeedback"
        component={EditFeedback}
        options={{ title: "Cập nhật đánh giá" }}
      />
      <Stack.Screen
        name="TakeFeedback"
        component={TakeFeedback}
        options={{ title: "Danh sách học sinh" }}
      />
      <Stack.Screen
        name="TakeFeedbackForm"
        component={TakeFeedbackForm}
        options={{ title: "Tạo đánh giá" }}
      />
    </Stack.Navigator>
  );
};

export default InformationStack;
