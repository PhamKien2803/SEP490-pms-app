import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";

interface AvatarProps {
  size: number;
  src?: string;
  name?: string;
  color: string;
  style?: ViewStyle;
}

const dynamicImageStyle = (size: number): ImageStyle => ({
  width: size,
  height: size,
  borderRadius: size / 2,
});

const Avatar: React.FC<AvatarProps> = ({ size, src, name, color, style }) => {
  const letter = name?.[0]?.toUpperCase() || "U";
  const fontSize = size * 0.45;

  return (
    <View
      style={[
        styles.baseAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    >
      {src ? (
        <Image source={{ uri: src }} style={dynamicImageStyle(size)} />
      ) : (
        <Text style={[styles.text, { fontSize }]}>{letter}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  baseAvatar: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  } as ViewStyle,

  text: {
    color: "#fff",
    fontWeight: "bold",
  } as TextStyle,
});

export default Avatar;
