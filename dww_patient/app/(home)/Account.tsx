import React, { useState } from 'react';
import { Alert, Text, StyleSheet, View, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const AccountScreen = () => {
  const navigation = useNavigation();
  const [provider_id, setProviderID] = useState('');

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
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
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/add-relationship/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareable_id: provider_id,
        }),
      });

      const data = await response.json()
      if (response.ok) {
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.error || "Failed to add relationship")
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      console.error(error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Provider</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Provider ID"
            keyboardType="default"
            value={provider_id}
            onChangeText={setProviderID}
          />
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
    width: '90%',
    borderColor: '#0E315F',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
    marginTop: 20,
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