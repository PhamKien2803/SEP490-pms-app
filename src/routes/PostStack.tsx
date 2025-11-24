import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TeacherNews from "../screens/teacher-dashboard/post/TeacherNews";
import { PagePermissionProvider } from "../context/PermissionContext";
import { fonts } from "react-native-elements/dist/config";

const Stack = createStackNavigator<any>();

const PostStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PostList"
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {
          color: "#1890ff",
          fontWeight: "bold",
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen
        name="PostList"
        component={TeacherNews}
        options={{ title: "Danh sách bài viết" }}
      />
    </Stack.Navigator>
  );
};

export default PostStack;
