import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';


const SignupScreen = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'Provider' | 'Patient'>('Patient');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSignup = async () => {
    const data = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      password1: password,
      password2: confirmPassword,
      role: userType.toLowerCase()
    }

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/register/`, data);

      console.log('Signup successful:', response.data);
      navigation.navigate('Login');
    } catch (error: any) {
      if (error.response?.data?.errors) { 
        console.error('Signup form error:', error.response.data);
        alert(Object.values(error.response.data.errors).flat().join('\n'))
      } else if (error.response?.data?.error) {
        console.error('Unknown error during signup:', error.response.data.error);
        alert('Signup error: ' + error.response.data.error);
      } else {
        console.error('error is not defined in Django. This is really bad.');
        alert('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.nameContainer}>
        <TextInput
          style={styles.nameInput}
          placeholder="First Name"
          placeholderTextColor="#A9A9A9"
          value={firstName}
          onChangeText={setFirstName}
          autoCorrect={false}
        />
        <TextInput
          style={styles.nameInput}
          placeholder="Last Name"
          placeholderTextColor="#A9A9A9"
          value={lastName}
          onChangeText={setLastName}
          autoCorrect={false}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A9A9A9"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#A9A9A9"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        maxLength={15}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#A9A9A9"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Text style={styles.eyeIcon}>{passwordVisible ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          placeholderTextColor="#A9A9A9"
          secureTextEntry={!confirmPasswordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
          <Text style={styles.eyeIcon}>{confirmPasswordVisible ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userTypeContainer}>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === 'Provider' && styles.userTypeSelected,
          ]}
          onPress={() => setUserType('Provider')}
        >
          <Text style={userType === 'Provider' ? styles.userTypeTextSelected : styles.userTypeText}>
            Provider
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === 'Patient' && styles.userTypeSelected,
          ]}
          onPress={() => setUserType('Patient')}
        >
          <Text style={userType === 'Patient' ? styles.userTypeTextSelected : styles.userTypeText}>
            Patient
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButton}>Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
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
  input: {
    width: '95%',
    height: 50,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    width: '95%',
  },
  nameInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginLeft: 3,
    marginRight: 3,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    height: 50,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  eyeIcon: {
    fontSize: 18,
    color: '#A9A9A9',
  },
  userTypeContainer: {
    flexDirection: 'row',
    width: '95%',
    justifyContent: 'center',
    marginVertical: 16,
  },
  userTypeButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A9A9A9',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  userTypeSelected: {
    backgroundColor: '#007AFF',
  },
  userTypeText: {
    color: '#A9A9A9',
    fontSize: 16,
  },
  userTypeTextSelected: {
    color: '#FFFFFF',
    fontSize: 16,
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
  loginContainer: {
    flexDirection: 'row',
    marginTop: 32,
  },
  loginText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  loginButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default SignupScreen;