import React from "react";
import { View, ActivityIndicator, StyleSheet, Text, Modal } from "react-native";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const COLORS = {
  primary: "#1890ff",
  overlayBackground: "rgba(0, 0, 0, 0.5)",
  text: "#fff",
};

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = "Đang tải...",
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlayContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlayBackground,
  },
  loadingBox: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.text,
  },
});

export default LoadingOverlay;
