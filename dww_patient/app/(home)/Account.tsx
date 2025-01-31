import React, { useState, useRef } from 'react';
import { Alert, Text, StyleSheet, View, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../(auth)/AuthContext';

const AccountScreen = () => {
  const navigation = useNavigation();
  const [provider_id, setProviderID] = useState('');
  const inputRefs = useRef([]);
  const [code, setCode] = useState(new Array(8).fill(''));
  const { authToken, logout } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Token ${authToken}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        logout();
        navigation.navigate('Login');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Something went wrong during logout');
    }
  };

  const handleAddRelationship = async () => {
    if (code.includes('')) {
      Alert.alert('Error', 'Please enter a valid Provider ID in the format XXXX-XXXX');
      return;
    }
    const providerID = `${code.slice(0, 4).join('')}-${code.slice(4, 8).join('')}`;
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/add-relationship/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Token ${authToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            shareable_id: providerID,
          }),
        }
      );

      const data = await response.json();
      console.log();
      if (response.ok) {
        if (data.message.includes("already exists")) {
          Alert.alert('Notice', 'This relationship already exists.');
        } else {
          Alert.alert('Success', data.message);
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to add relationship');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error(error);
    }
  };

  const handleInputChange = (text, index) => {
    const newCode = [...code];
    if (/^[a-zA-Z0-9]$/.test(text)) {
      newCode[index] = text.toUpperCase();
      setCode(newCode);

      if (index < 7) {
        inputRefs.current[index + 1].focus();
      }
    } else if (text === '') {
      newCode[index] = '';
      setCode(newCode);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1].focus();
    }
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Provider</Text>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputGroup}>
            {code.map((char, index) => (
              <React.Fragment key={index}>
                <TextInput
                  ref={(el) => (inputRefs.current[index] = el)}
                  style={styles.input}
                  value={char}
                  onChangeText={(text) => handleInputChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  maxLength={1}
                  keyboardType="default"
                  autoCapitalize="characters"
                  returnKeyType="next"
                />
                {index === 3 && <Text style={styles.hyphen}>-</Text>}
              </React.Fragment>
            ))}
          </View>
          <TouchableOpacity style={styles.reportButton} onPress={handleAddRelationship}>
            <Text style={styles.reportButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your medical provider will be able to track your dry weight progess.
          </Text>
        </View>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#F5F9FF',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E315F',
    marginBottom: 5,
  },
  inputContainer: {
    alignItems: 'center',
  },
  input: {
    height: 60,
    width: "9%",
    borderColor: '#0E315F',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginHorizontal: 5,
    marginBottom: 15,
  },
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hyphen: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 5,
    color: '#0E315F',
  },
  reportButton: {
    backgroundColor: '#0E315F',
    padding: 12,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#FF4D4D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountScreen;