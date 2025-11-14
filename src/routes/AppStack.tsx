import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../types/navigation";

import InformationStack from "./InformationStack";
import ConversationStack from "./ConversationStack";
import SettingStack from "./SettingStack";
import PostStack from "./PostStack";
import { useSelector } from "react-redux";
import HomeScreen from "../screens/HomeScreen";

const Tab = createBottomTabNavigator<any>();

const AppStack: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user?.isTeacher) {
    return (
      <Tab.Navigator
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#007AFF",
        }}
      >
        <Tab.Screen name="home" component={HomeScreen} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName="Information"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      <Tab.Screen
        name="Information"
        component={InformationStack}
        options={{
          title: "Thông tin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ListPost"
        component={PostStack}
        options={{
          title: "Bài viết",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ListConversation"
        component={ConversationStack}
        options={{
          title: "Trò chuyện",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingStack}
        options={{
          title: "Cài đặt",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppStack;
