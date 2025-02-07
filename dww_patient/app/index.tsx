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
import RemindersScreen from './(home)/(settings)/RemindersScreen';
import { AuthProvider } from './(auth)/AuthContext';
import { HomeTabParamList, RootStackParamList, SettingsStackParamList } from './types/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const HomeTabs = createBottomTabNavigator<HomeTabParamList>();

// Tab Navigator for screens in (home), anything in this section should be require-login
function HomeTabNavigator() {
  return (
    <HomeTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'EnterData') {
            iconName = focused ? 'scale' : 'scale-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7B5CB8',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <HomeTabs.Screen name="Home" component={HomeScreen} />
      <HomeTabs.Screen name="EnterData" component={EnterDataScreen} />
      <HomeTabs.Screen name="Dashboard" component={DashboardScreen} />
      <HomeTabs.Screen name="Settings" component={SettingsScreensStack} />
    </HomeTabs.Navigator>
  );
}

function SettingsScreensStack() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Account" component={AccountScreen} />
      <SettingsStack.Screen name="Reminders" component={RemindersScreen} />
    </SettingsStack.Navigator>
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