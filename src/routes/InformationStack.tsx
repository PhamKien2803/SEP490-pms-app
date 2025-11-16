import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Information from "../screens/teacher-dashboard/information/Information";
import TeacherHomeScreen from "../screens/teacher-dashboard/TeacherDashboard";
import TimeTable from "../screens/teacher-dashboard/time-table/TimeTable";

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
      screenOptions={{ headerShown: true }}
    >
      <Stack.Screen
        name="InformationMain"
        component={TimeTable}
        options={{ title: "Thông tin cá nhân" }}
      />
    </Stack.Navigator>
  );
};

export default InformationStack;
