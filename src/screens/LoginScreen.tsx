import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image, // Thêm import Image
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  getCurrentUser,
  login,
  setToken,
  setUserProfile,
} from "../redux/authSlice";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../routes/AuthStack";

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const COLORS = {
  primary: "#00b4d8",
  primaryDark: "#0077b6",
  white: "#FFFFFF",
  lightBlue: "#caf0f8",
  text: "#03045e",
  grey: "#adb5bd",
  error: "#d00000",
};

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const isLoading = useAppSelector((s) => s.auth.isLoginPending);
  const loginError = useAppSelector((s) => s.auth.loginError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }
    try {
      const response = await dispatch(login({ email, password })).unwrap();
      const profile = await dispatch(getCurrentUser()).unwrap();
      dispatch(setToken(response));
      dispatch(setUserProfile(profile));
    } catch (err: any) {
      Alert.alert(err);
    }
  };

  // --- Hàm điều hướng sang màn hình Quên mật khẩu ---
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <ImageBackground
      // source={require("../assets/backgroundDolphin.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              {/* Thay thế icon bằng Logo Dolphin */}
              <Image 
                source={require("../assets/logoDolphin.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Cá Heo Xanh</Text>
              <Text style={styles.subtitle}>Đăng nhập</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={24}
                  color={COLORS.grey}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={24}
                  color={COLORS.grey}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              {loginError?.message ? (
                <Text style={styles.error}>{loginError.message}</Text>
              ) : null}

              {/* --- LINK QUÊN MẬT KHẨU --- */}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                 <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                  style={{ marginTop: 10 }}
                />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Đăng nhập</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  // Style mới cho Logo
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginTop: 5, // Giảm margin top một chút vì logo đã có margin bottom
  },
  subtitle: {
    fontSize: 24,
    color: COLORS.text,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grey,
    marginBottom: 16,
    height: 55,
  },
  inputIcon: {
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: COLORS.text,
  },
  error: {
    color: COLORS.error,
    marginBottom: 12,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  // Style cho Quên mật khẩu
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.primaryDark,
    fontWeight: '600',
    fontSize: 14,
  }
});

export default LoginScreen;