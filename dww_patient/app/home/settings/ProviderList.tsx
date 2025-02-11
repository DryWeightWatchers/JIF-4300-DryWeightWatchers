import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../(auth)/AuthContext';
import { useNavigation } from '@react-navigation/native';

const RemoveProviderScreen = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [providers, setProviders] = useState([]);
  const { authToken } = useAuth();

  const handleShowList = async () => {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/profile/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Token ${authToken}`,
          },
        });
  
        const data = await response.json();
        if (response.ok) {
            console.log("response ok")
            console.log(response)
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'List failed');
        }
      } catch (error) {
        console.error('List error:', error);
        Alert.alert('Error', 'Something went wrong during list creation');
      }
    };

  return (
    <TouchableOpacity style={styles.reportButton} onPress={handleShowList}>
                <Text style={styles.reportButtonText}>Show Providers</Text>
              </TouchableOpacity>
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
  reportButton: {
    backgroundColor: '#7B5CB8',
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
});

export default RemoveProviderScreen;