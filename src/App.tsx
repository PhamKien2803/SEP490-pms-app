import 'react-native-gesture-handler';
import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Routes from "./routes";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Routes />
      </GestureHandlerRootView>
    </Provider>
  );
}
