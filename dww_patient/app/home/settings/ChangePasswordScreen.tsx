import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import { SettingsStackScreenProps } from '../../types/navigation';
import { authFetch } from '@/utils/authFetch';


const ChangePasswordScreen = () => {
    const [editingField, setEditingField] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [editingPassword, setEditingPassword] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation<SettingsStackScreenProps<'ChangePassword'>['navigation']>();
    const { accessToken, refreshAccessToken, logout } = useAuth();

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
          setMessage('All password fields are required.');
          return;
        }
    
        if (newPassword !== confirmPassword) {
          setMessage('New passwords do not match.');
          return;
        }
    
        try {
          const response = await authFetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/change-password/`, 
            accessToken, refreshAccessToken, logout, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
    
            },
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword }),
          });
    
          if (!response.ok) throw new Error(await response.text());
    
          setMessage('Password updated successfully!');
          setEditingPassword(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          Alert.alert('Successfully changed password');
        } catch (error) {
          setMessage('Failed to update password. Please try again.');
        }
      };

      return (
            <ScrollView contentContainerStyle={styles.container}>
                <TextInput
                    key="currentPassword"
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Current Password"
                    placeholderTextColor={"gray"}
                    secureTextEntry
                />
                <TextInput
                    key="newPassword"
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New Password"
                    placeholderTextColor={"gray"}
                    secureTextEntry
                />
                <TextInput
                    key="confirmPassword"
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm New Password"
                    placeholderTextColor={"gray"}
                    secureTextEntry
                />
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    if (editingField === 'password') {
                        handleChangePassword();
                    } else {
                        setEditingField("password");
                    }
                  }}
                >
                  <Text style={styles.editText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingField(null)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
    </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#F5F9FF',
    padding:20,
    alignItems: "stretch",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
    },
    value: {
        fontSize: 16,
        color: "#666",
        flex: 1.5,
    },
    editButton: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    editText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    cancelButton: { 
        padding: 10, 
        backgroundColor: "gray", 
        borderRadius: 5, 
    },
    cancelText: { 
        color: "white", 
        fontWeight: "bold" 
    },
    input: {
        height: 50, 
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
        backgroundColor: "white", 
    },
  });


export default ChangePasswordScreen;
