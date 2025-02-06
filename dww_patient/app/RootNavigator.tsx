import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from "react-native";

import LoginScreen from './auth/LoginScreen';
import SignupScreen from './auth/SignupScreen';
import HomeScreen from './home/HomeScreen';
import EnterDataScreen from './home/EnterDataScreen';
import DashboardScreen from './home/DashboardScreen';
import AccountScreen from './home/Account';
import { useAuth } from './auth/AuthProvider';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Enter Data" component={EnterDataScreen} />
    <Tab.Screen name="Data" component={DashboardScreen} />
    <Tab.Screen name="Account" component={AccountScreen} />
  </Tab.Navigator>
);


const RootNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth(); 

  useEffect(() => {
    console.log("RootNavigator: useEffect: isAuthenticated =", isAuthenticated);
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  } 
  
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default RootNavigator; 