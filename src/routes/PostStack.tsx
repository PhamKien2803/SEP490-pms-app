import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ListPost from '../screens/teacher-dashboard/post/ListPost';

const Stack = createStackNavigator<any>();

const PostStack: React.FC = () => {
    return (
        <Stack.Navigator initialRouteName="PostList" screenOptions={{ headerShown: true }}>
            <Stack.Screen name="PostList" component={ListPost} options={{ title: 'Bài viết' }} />
        </Stack.Navigator>
    );
};

export default PostStack;