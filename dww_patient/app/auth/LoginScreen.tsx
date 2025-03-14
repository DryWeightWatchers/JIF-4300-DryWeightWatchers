import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from './AuthProvider';
import { authFetch } from '../../utils/authFetch'; 
import type { RootStackScreenProps } from '../types/navigation';


const LoginScreen = () => {
  const navigation = useNavigation<RootStackScreenProps<'Login'>['navigation']>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('LoginScreen: handleLogin');
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
        }),
      });

      if (response.ok) {
        console.log("LoginScreen: handleLogin: response returned with 200 OK")
        const data = await response.json();
        await login(data.access_token, data.refresh_token);

      } else {
        const errorData = await response.json();
        Alert.alert(`Error ${response.status}: ${errorData.message}`);
      }
  } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
      console.log("Login error:", error)
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.appTitle}>Dry Weight Watchers</Text>
      <Text style={styles.title}>Welcome back!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A9A9A9"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupButton}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32, 
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 32,
    color: '#333333',
  },
  appTitle: {
    position: 'absolute',
    top: 50,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input: {
    width: '95%',
    height: 50,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333333',
  },
  button: {
    width: '95%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 32,
  },
  signupText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  signupButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LoginScreen;
