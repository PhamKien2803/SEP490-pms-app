import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TeacherNews from "../screens/teacher-dashboard/post/TeacherNews";
import { PagePermissionProvider } from "../context/PermissionContext";

const Stack = createStackNavigator<any>();

const PostStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PostList"
      screenOptions={{ headerShown: true }}
    >
      <Stack.Screen
        name="PostList"
        component={TeacherNews}
        options={{ title: "Bài viết" }}
      />
    </Stack.Navigator>
  );
};

export default PostStack;
