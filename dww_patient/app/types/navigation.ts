import { NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

//https://reactnavigation.org/docs/typescript?config=dynamic
//if a screen requires a parameter/prop, replace it with undefined. Currently nothing is needed, but that might change.
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  HomeTabs: NavigatorScreenParams<HomeTabParamList> | undefined; //or undefined because hometabparamlist is all undefined right now anyways
};
  
export type HomeTabParamList = {
  Home: undefined;
  EnterData: undefined;
  Dashboard: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Account: undefined;
  Reminders: undefined;
  ProviderList: undefined;
  Profile: undefined;
  ChangePassword: undefined;
  AddProvider: undefined;
};
  
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
  
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;
  
export type HomeTabScreenProps<T extends keyof HomeTabParamList> = 
  BottomTabScreenProps<HomeTabParamList, T>;
  
export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> = 
  NativeStackScreenProps<SettingsStackParamList, T>;