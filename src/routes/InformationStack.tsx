import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Information from "../screens/teacher-dashboard/information/Information";

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
        component={Information}
        options={{ title: "Thông tin cá nhân" }}
      />
    </Stack.Navigator>
  );
};

export default InformationStack;
