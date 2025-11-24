import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground, // Thêm ImageBackground
  TouchableOpacity, // Thêm TouchableOpacity để làm nút bấm đẹp hơn
  SafeAreaView, // Thêm SafeAreaView
  ScrollView, // Thêm ScrollView để tránh lỗi khi bàn phím hiện
  Platform,
  KeyboardAvoidingView,
} from "react-native";
// Thêm icon
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  getCurrentUser,
  login,
  setToken,
  setUserProfile,
} from "../redux/authSlice";

// Bảng màu chủ đạo (Xanh da trời)
const COLORS = {
  primary: "#00b4d8", // Xanh da trời chính cho nút bấm
  primaryDark: "#0077b6", // Xanh đậm cho tiêu đề
  white: "#FFFFFF",
  lightBlue: "#caf0f8", // Xanh nhạt cho nền form
  text: "#03045e", // Màu text (xanh navy đậm)
  grey: "#adb5bd", // Màu cho placeholder, border
  error: "#d00000", // Màu lỗi
};

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
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
    } catch (err) {
      // Lỗi đã được xử lý bởi slice (loginError), không cần console.log
    }
  };

  return (
    <ImageBackground
      source={require("../assets/backgroundDolphin.png")}
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
            keyboardShouldPersistTaps="handled" // Đóng bàn phím khi nhấn ra ngoài
          >
            {/* Logo hoặc Icon trường */}
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons
                name="school"
                size={80}
                color={COLORS.primaryDark}
              />
              <Text style={styles.title}>Cá Heo Xanh</Text>
              <Text style={styles.subtitle}>Đăng nhập</Text>
            </View>

            {/* Form đăng nhập */}
            <View style={styles.formContainer}>
              {/* Input Email */}
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

              {/* Input Mật khẩu */}
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

              {/* Hiển thị lỗi */}
              {loginError?.message ? (
                <Text style={styles.error}>{loginError.message}</Text>
              ) : null}

              {/* Nút bấm hoặc loading */}
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
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Lớp phủ mờ nhẹ
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
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 24,
    color: COLORS.text,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Nền form trắng mờ
    borderRadius: 20, // Bo góc mềm mại
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
    borderRadius: 12, // Bo góc ô input
    borderWidth: 1,
    borderColor: COLORS.grey,
    marginBottom: 16, // Tăng khoảng cách
    height: 55, // Tăng chiều cao
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
});

export default LoginScreen;