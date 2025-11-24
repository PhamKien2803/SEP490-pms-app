import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Routes: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  console.log("token", token);

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Routes;
