import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/authSlice';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';


const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  type NavProp = NativeStackNavigationProp<{ Login: undefined; Home: undefined }>;
  const navigation = useNavigation<NavProp>();
  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng!</Text>
      <Button title="Đăng xuất" onPress={handleLogout} />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, marginBottom: 12 },
});

export default HomeScreen;
