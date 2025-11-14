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
import { getCurrentUser, login, setToken, setUserProfile } from "../redux/authSlice";

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
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
     const response = await dispatch(login({ email, password })).unwrap();
     const profile = await dispatch(getCurrentUser()).unwrap();
     dispatch(setToken(response))
     dispatch(setUserProfile(profile))
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
