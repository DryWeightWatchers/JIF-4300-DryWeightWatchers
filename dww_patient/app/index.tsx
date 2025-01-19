import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from './(auth)/LoginScreen';
import SignupScreen from './(auth)/SignupScreen';
import HomeScreen from './(home)/HomeScreen';
import EnterDataScreen from './(home)/EnterDataScreen';
import DashboardScreen from './(home)/DashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for screens in (home), anything in this section should be require-login
function HomeTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Enter Data" component={EnterDataScreen} />
      <Tab.Screen name="Data" component={DashboardScreen} />
    </Tab.Navigator>
  );
}

// Stack Navigator for authentication and main screens
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen
          name="Home"
          component={HomeTabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}