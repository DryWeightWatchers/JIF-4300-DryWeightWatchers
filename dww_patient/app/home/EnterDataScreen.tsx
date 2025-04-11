import React, { useState } from 'react';
import {
  Text, StyleSheet, View, TextInput, Keyboard,
  TouchableWithoutFeedback, TouchableOpacity
} from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { authFetch } from '../../utils/authFetch';
import { ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';

const { apiBaseUrl } = Constants.expoConfig!.extra as { apiBaseUrl: string };


const EnterDataScreen = () => {
  const [weight, setWeight] = useState('');
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleReportData = async () => {
    if (!weight) {
      alert('Please enter a valid weight.');
      return;
    }

    setLoading(true);

    try {
      const response = await authFetch(
        `${apiBaseUrl}/record_weight/`,
        accessToken,
        refreshAccessToken,
        logout,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight: parseFloat(weight) }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('weight input successful:', data);
        alert(`Weight reported: ${weight} lbs`);
        setWeight('');
      } else {
        const errorData = await response.json();
        console.error('Weight input error:', errorData);
        alert('Failed to report weight. Please try again.');
      }
    } catch (error: any) {
      console.log('weight input error:', error.response?.data || error.message);
      alert('Failed to report weight. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Dry Weight Tracker</Text>
          <Text style={styles.subtitle}>Track your weight to monitor your health effectively.</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Weight (Ibs)"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#7B5CB8" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.reportButton} onPress={handleReportData}>
              <Text style={styles.reportButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Consistently track your weight for better health management.
          </Text>
        </View>
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
    color: '#4f3582',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#5A5A5A',
    textAlign: 'center',
    lineHeight: 22,
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
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
  },
});

export default EnterDataScreen;
