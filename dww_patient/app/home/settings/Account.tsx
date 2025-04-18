import React, { useState, useRef } from 'react';
import { Alert, Text, StyleSheet, View, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import { authFetch } from '../../../utils/authFetch'; 

const AccountScreen = () => {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await authFetch(
        `${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/logout/`, 
        accessToken, refreshAccessToken, logout, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        logout();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Logout failed');
        await logout();  // fallback: clear tokens anyway so user doesn't get stuck logged in 
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during logout');
    }
  };

  const handleDeleteAccount = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'You are not authenticated');
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive", 
          onPress: async () => {
            try {
              const response = await authFetch(
                `${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/delete-account/`, 
                accessToken, refreshAccessToken, logout, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (response.status == 200) {
                Alert.alert("Success", "Your account has been deleted.", [
                  { text: "OK", onPress: () => logout() }, 
                ]);
              }
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.error || "Failed to delete account");
            }
          },
        },
      ]); 
    };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.logoutText}>Delete Account</Text>
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
  deleteButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#FF4D4D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default AccountScreen;