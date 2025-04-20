import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, StyleSheet, View, TextInput, TouchableOpacity, 
  SafeAreaView, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, Platform, 
  Keyboard, ActivityIndicator } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import { SettingsStackScreenProps } from '../../types/navigation';
import { authFetch } from '@/utils/authFetch';


type ProfileData = {
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    password: string,
  }

const ProfileScreen = () => {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [editingPassword, setEditingPassword] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const navigation = useNavigation<SettingsStackScreenProps<'Profile'>['navigation']>();
    const { accessToken, refreshAccessToken, logout } = useAuth();

    const fetchProfileData = async () => {
        try {
            const res = await authFetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/patient-profile/`, accessToken, refreshAccessToken, logout, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            });
            if (!res.ok) {
            setError(`HTTP error: ${res.status}`);
            return;
            }
            const data = await res.json();
            setProfileData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
      }
    
      useEffect(() => {
        fetchProfileData();
      }, []);

      const handleUpdate = async (field: 'email' | 'phone') => {
        if (!tempValue) {
          setMessage(`Please enter a valid ${field}.`);
          return;
        }
    
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/change-${field}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({ [field]: tempValue }),
          });
          const responseData = await response.json();
    
          if (!response.ok) throw new Error(responseData.error || "Failed to update");
    
          setMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
          setProfileData((prev) => (prev ? { ...prev, [field]: tempValue } : null));
          setEditingField(null); 
        } catch (error) {
          setMessage(`Failed to update ${field}. Please try again.`);
        }
      };

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
          const response = await fetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/change-password/`, {
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
        } catch (error) {
          setMessage('Failed to update password. Please try again.');
        }
      };
    

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B5CB8" />
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 60}
      >
        <ScrollView style={{ marginTop: 20 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
              <View style={styles.row}>
              <Text style={styles.label}>{"Name"}:</Text>
              <Text style={styles.value}>{`${profileData?.firstname} ${profileData?.lastname}`}</Text>
              </View>
              <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              {editingField === "email" ? (
                  <TextInput
                      style={styles.input}
                      value={tempValue}
                      onChangeText={setTempValue}
                      autoCapitalize="none"
                      keyboardType="email-address"
                  />
          ) : (
            <Text style={styles.value}>{profileData?.email}</Text>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (editingField === 'email') {
                  handleUpdate("email")
              } else {
                  setEditingField("email");
                  setTempValue(profileData?.email ?? '');
              }
            }}
          >
            <Text style={styles.editText}>{editingField === "email" ? "Save" : "Edit"}</Text>
          </TouchableOpacity>
          {editingField === "email" && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingField(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              {editingField === "phone" ? (
                  <TextInput
                      style={styles.input}
                      value={tempValue}
                      onChangeText={setTempValue}
                      autoCapitalize="none"
                      keyboardType="phone-pad"
                  />
          ) : (
            <Text style={styles.value}>{profileData?.phone || "Not provided"}</Text>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (editingField === 'phone') {
                  handleUpdate("phone")
              } else {
                  setEditingField("phone");
                  setTempValue(profileData?.phone ?? '');
              }
            }}
          >
            <Text style={styles.editText}>{editingField === "phone" ? "Save" : "Edit"}</Text>
          </TouchableOpacity>
          {editingField === "phone" && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingField(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
          </View>
          <View style={styles.row}>
              <Text style={styles.label}>Password:</Text>
              <Text style={styles.value}>{"********"}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ChangePassword')}>
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
              </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
    );

};

const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5F9FF',
    },
    mainContainer: {
      flex: 1,
      backgroundColor: '#F5F9FF',
    },
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
        fontSize: 40,
      },
    card: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
      },
      name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
      },
      email: {
        fontSize: 16,
        color: "#666",
        marginBottom: 10,
      },
      info: {
        fontSize: 14,
        color: "#444",
        marginBottom: 5,
      },
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        backgroundColor: "#7B5CB8",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
      },
      editText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
      },
      cancelButton: { padding: 8, backgroundColor: "gray", borderRadius: 5, marginLeft: 10 },
      cancelText: { color: "white", fontWeight: "bold" },
      input: {
        flex: 1,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ccc",
      },
  });




export default ProfileScreen;