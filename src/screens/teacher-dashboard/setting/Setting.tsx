import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/authSlice";

const COLORS = {
  primary: "#1890ff",
  text: "#000",
  textSecondary: "#8c8c8c",
  background: "#f0f2f5",
  white: "#fff",
  border: "#d9d9d9",
};

const Setting = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.listItem} onPress={handleLogout}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="sign-out-alt" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.logoutText}>Đăng xuất</Text>
        <FontAwesome5
          name="chevron-right"
          size={16}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  groupHeader: {
    fontSize: 14,
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 10,
    fontWeight: "bold",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  logoutText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "500",
    color: COLORS.primary,
  },
});
