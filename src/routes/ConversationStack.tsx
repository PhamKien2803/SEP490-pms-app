import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ListConversation from "../screens/teacher-dashboard/conversation/ListConversation";

export type ConversationStackParamList = {
    ConversationList: undefined;
    ChatRoom: { userId: string }; 
    ConversationSettings: undefined;
};

const Stack = createStackNavigator<ConversationStackParamList>();

const ConversationStack: React.FC = () => {
    return (
        <Stack.Navigator initialRouteName="ConversationList" screenOptions={{ headerShown: true }}>
            <Stack.Screen name="ConversationList" component={ListConversation} options={{ title: 'Tin nhắn' }} />
        </Stack.Navigator>
    );
};

export default ConversationStack;