import React, { useState, useCallback } from 'react';
import { Button, StyleSheet, Text, FlatList, View, TouchableOpacity, SafeAreaView} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthProvider';
import { authFetch } from '@/utils/authFetch';
import { Ionicons } from '@expo/vector-icons';
import { SettingsStackScreenProps } from '@/app/types/navigation';
import Constants from 'expo-constants';

const { apiBaseUrl } = Constants.expoConfig!.extra as { apiBaseUrl: string };

const ProviderList = () => {
  const navigation = useNavigation<SettingsStackScreenProps<'ProviderList'>['navigation']>();
  const [providers, setProviders] = useState([]); 
  const {accessToken, refreshAccessToken, logout} = useAuth();

  useFocusEffect(
    useCallback(() => {
      handleGetProviders();
    }, [accessToken])
  );

  const handleGetProviders = async () => {
    try {
        if (!accessToken) {
            console.log("No access token available, trying to refresh...");
            await refreshAccessToken();
        }
        const response = await authFetch(`${apiBaseUrl}/user/providers/`, accessToken, refreshAccessToken, logout, {
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

  const handleDeleteProvider= async (shareable_id) => {
    try {
        if (!accessToken) {
            console.log("No access token available, trying to refresh...");
            await refreshAccessToken();
        }
        // const shareableId = `${code.slice(0, 4).join('')}-${code.slice(4, 8).join('')}`;
        const response = await authFetch(`${apiBaseUrl}/delete-relationship/`, 
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
    <SafeAreaView style={{ padding: 20, flex: 1 }}>
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

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProvider')}>
        <Ionicons name="add-circle" size={36} color="#7B5CB8"/>
        <Text style={styles.addButtonText}>Add Provider</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    addButton: {
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      padding: 10,
      borderRadius: 25,
      marginTop: 30,
    },
    addButtonText: {
      color: '#7B5CB8',
      fontSize: 12,
      marginTop: 4,
    },
  });

export default ProviderList;