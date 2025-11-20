import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Student } from './user';

export type RootState = {
  auth: {
    token: string | null;
    user: any;
  };
};



export type AppTabParamList = {
  Information: undefined;
  ListPost: undefined;
  ListConversation: undefined;
  Setting: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Home: undefined;
  Schedule: undefined;
  Menu: { student: Student };
  Feedback: undefined;
  Attendance: undefined;
  HealthProfile: undefined;
  Guardian: undefined;
  GuardianList: undefined;
  PaymentWebView: { url: string };
};

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  AppStack: NavigatorScreenParams<AppTabParamList>;
};


export type LoginScreenProps = StackScreenProps<AuthStackParamList, 'Login'>;
