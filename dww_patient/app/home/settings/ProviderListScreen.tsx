import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, FlatList, View, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthProvider';
import { authFetch } from '@/utils/authFetch';



const ProviderListScreen = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [providers, setProviders] = useState([]); 
  const {accessToken, refreshAccessToken, logout} = useAuth();
  const [code, setCode] = useState(new Array(8).fill(''));

  useEffect(() => {
    handleGetProviders();
  }, []);

  const handleGetProviders= async () => {
    try {
        if (!accessToken) {
            console.log("No access token available, trying to refresh...");
            await refreshAccessToken();
        }
        const response = await authFetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/user/providers/`, accessToken, refreshAccessToken, logout, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status == 401) {
                console.warn("401 Unauthorized - Attempting to refresh token...");
                await refreshAccessToken();
                return handleGetProviders(); // Retry after refreshing token
            }
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        const data = await response.json()
        console.log("Fetched Providers: ", data)
        setProviders(data)
    } catch (error) {
        console.error('Error fetching providers:', error);
    }
  }

  const doNothing = () => {};

  const handleDeleteProvider= async (shareable_id) => {
    try {
        if (!accessToken) {
            console.log("No access token available, trying to refresh...");
            await refreshAccessToken();
        }
        // const shareableId = `${code.slice(0, 4).join('')}-${code.slice(4, 8).join('')}`;
        const response = await authFetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/delete-relationship/`, 
            accessToken, refreshAccessToken, logout, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({shareable_id: shareable_id})
        });
        if (!response.ok) {
            if (response.status == 401) {
                console.warn("401 Unauthorized - Attempting to refresh token...");
                await refreshAccessToken();
                return handleGetProviders(); // Retry after refreshing token
            }
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        const data = await response.json()
        console.log("Fetched Providers: ", data)
        setProviders(providers.filter(provider => provider.shareable_id !== shareable_id));
    } catch (error) {
        console.error('Error deleting provider:', error);
    }
  }


  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Registered Providers</Text>

      {providers.length === 0 ? (
        <Text>No providers found.</Text>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.shareable_id.toString()}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#f9f9f9' }}>
              <Text style={{ fontSize: 18  }}>{item.last_name}</Text>
              <Text style={{ color: 'gray' }}>{item.first_name}</Text>
              <Text style={{ color: 'gray' }}>{item.email}</Text>
              <Button
                    title="Remove Provider"
                    onPress={() => handleDeleteProvider(item.shareable_id)} 
                    color='red'
                />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default ProviderListScreen;