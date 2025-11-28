import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TeacherNews from "../screens/teacher-dashboard/post/TeacherNews";
import CreatePost from "../screens/teacher-dashboard/post/create-post/CreatePost";
import EditPost from "../screens/teacher-dashboard/post/update-post/UpdatePost";

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
      <Stack.Screen
        name="CreatePost"
        component={CreatePost}
        options={{ title: "Tạo bài viết" }}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPost}
        options={{ title: "Chỉnh sửa bài viết" }}
      />
    </Stack.Navigator>
  );
};

export default PostStack;
