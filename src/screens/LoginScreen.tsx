import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { login } from "../redux/authSlice";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  type NavProp = NativeStackNavigationProp<{ Login: undefined; Home: undefined }>;
  const navigation = useNavigation<NavProp>();
  const isLoading = useAppSelector((s) => s.auth.isLoginPending);
  const loginError = useAppSelector((s) => s.auth.loginError);

  const [email, setEmail] = useState("");
  console.log("[Bthieu] ~ LoginScreen ~ email:", email);
  const [password, setPassword] = useState("");
  console.log("[Bthieu] ~ LoginScreen ~ password:", password);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
    try {
      await dispatch(login({ email, password })).unwrap();
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      console.log("Đăng nhập thành công");
    } catch (err) {
      console.log("err", err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#f0f8ff" }]}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {loginError?.message ? (
        <Text style={styles.error}>{loginError.message}</Text>
      ) : null}

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Đăng nhập" onPress={handleLogin} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
});

export default LoginScreen;
