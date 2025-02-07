import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from './(auth)/LoginScreen';
import SignupScreen from './(auth)/SignupScreen';
import HomeScreen from './(home)/HomeScreen';
import EnterDataScreen from './(home)/EnterDataScreen';
import DashboardScreen from './(home)/DashboardScreen';
import AccountScreen from './(home)/(settings)/Account';
import SettingsScreen from './(home)/(settings)/SettingsScreen';
import RemindersScreen from './(home)/(settings)/ReminderScreen';
import { AuthProvider } from './(auth)/AuthContext';
import { HomeTabParamList, RootStackParamList, SettingStackParamList } from './types/navigation';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const SettingStack = createNativeStackNavigator<SettingStackParamList>();
const HomeTabs = createBottomTabNavigator<HomeTabParamList>();

// Tab Navigator for screens in (home), anything in this section should be require-login
function HomeTabNavigator() {
  return (
    <HomeTabs.Navigator>
      <HomeTabs.Screen name="Home" component={HomeScreen} />
      <HomeTabs.Screen name="EnterData" component={EnterDataScreen} />
      <HomeTabs.Screen name="Dashboard" component={DashboardScreen} />
      <HomeTabs.Screen name="Settings" component={SettingsStack} />
    </HomeTabs.Navigator>
  );
}

function SettingsStack() {
  return (
    <SettingStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingStack.Screen name="Settings" component={SettingsScreen} />
      <SettingStack.Screen name="Account" component={AccountScreen} />
      <SettingStack.Screen name="Reminders" component={RemindersScreen} />
    </SettingStack.Navigator>
  );
}

// Stack Navigator for authentication and main screens
export default function App() {
  return (
    <AuthProvider>
      <RootStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Signup" component={SignupScreen} />
        <RootStack.Screen
          name="HomeTabs"
          component={HomeTabNavigator}
        />
      </RootStack.Navigator>
    </AuthProvider>
  );
}