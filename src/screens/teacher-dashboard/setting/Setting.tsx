import React from "react";
import { View, Text } from "react-native";
import { Button } from "react-native-elements";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/authSlice";

const Setting = () => {
  const dispatch = useDispatch();
  return (
    <View>
      <Button onPress={() => dispatch(logout())}>
        <Text>Logout</Text>
      </Button>
    </View>
  );
};

export default Setting;
