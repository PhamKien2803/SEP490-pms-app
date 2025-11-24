import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Setting from '../screens/teacher-dashboard/setting/Setting';

const Stack = createStackNavigator<any>();

const SettingStack: React.FC = () => {
    return (
        <Stack.Navigator initialRouteName="Setting" screenOptions={{ headerShown: true }}>
            <Stack.Screen name="Setting" component={Setting} options={{ title: 'Cài đặt' }} />
        </Stack.Navigator>
    );
};

export default SettingStack;