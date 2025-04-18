import React, { useState } from 'react';
import {
  Text, StyleSheet, View, TextInput, Keyboard,
  TouchableWithoutFeedback, TouchableOpacity, Alert, Switch
} from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { authFetch } from '../../utils/authFetch';
import { ActivityIndicator } from 'react-native';

const EnterDataScreen = () => {
  const { accessToken, refreshAccessToken, logout, user, setUser } = useAuth();
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMetric, setIsMetric] = useState(user?.unit_preference === 'metric');

  const handleReportData = async () => {
    if (!weight) {
      Alert.alert('Error', 'Please enter a weight');
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    const weightInPounds = isMetric 
        ? parseFloat(convertToPounds(weightValue).toFixed(2))
        : weightValue; 

    setLoading(true);

    try {
      const response = await authFetch(
        `${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/record_weight/`,
        accessToken,
        refreshAccessToken,
        logout,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight: weightInPounds }),
        }
      );

      console.log('weight:', weight);
      console.log('weight in pounds:', weightInPounds);

      if (response.ok) {
        const data = await response.json();
        console.log('weight input successful:', data);
        Alert.alert('Success', 'Weight recorded successfully');
        setWeight('');
      } else {
        const errorData = await response.json();
        console.error('Weight input error:', errorData);
        Alert.alert('Error', 'Failed to record weight');
      }
    } catch (error: any) {
      console.log('weight input error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to record weight');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitToggle = async () => {
    const newPreference = isMetric ? 'imperial' : 'metric';
    try {
      console.log('Attempting to update unit preference to:', newPreference);
      const response = await authFetch(
        `${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/update-unit-preference/`,
        accessToken,
        refreshAccessToken,
        logout,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ unit_preference: newPreference }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Unit preference update successful:', data);
        setIsMetric(!isMetric);
        setUser(prev => prev ? { ...prev, unit_preference: newPreference } : null);
      } else {
        const errorData = await response.json();
        console.error('Unit preference update failed:', errorData);
        throw new Error(errorData.error || 'Failed to update unit preference');
      }
    } catch (error: any) {
      console.error('Unit preference update error:', error);
      Alert.alert('Error', error.message || 'Failed to update unit preference');
    }
  };

  const convertToPounds = (weightInKg) => {
    return weightInKg * 2.20462;
  };

  const convertToKilograms = (weightInPounds) => {
    return weightInPounds / 2.20462;
  };

  const displayWeight = (weightInPounds) => {
    return user.unit_preference === 'metric' 
        ? `${convertToKilograms(weightInPounds).toFixed(1)} kg` 
        : `${weightInPounds.toFixed(1)} lbs`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Dry Weight Tracker</Text>
          <Text style={styles.subtitle}>Track your weight to monitor your health effectively.</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Enter your weight ({isMetric ? 'kg' : 'lbs'})
          </Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter weight in ${isMetric ? 'kilograms' : 'pounds'}`}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#7B5CB8" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.reportButton} onPress={handleReportData}>
              <Text style={styles.reportButtonText}>Record Weight</Text>
            </TouchableOpacity>
          )}
        </View>
        </View>
        <View style={styles.unitToggleContainer}>
          <Text style={styles.unitLabel}>
            {isMetric ? 'Metric (kg)' : 'Imperial (lbs)'}
          </Text>
          <Switch
            value={isMetric}
            onValueChange={handleUnitToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isMetric ? '#007AFF' : '#f4f3f4'}
          />
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
  unitToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unitLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  inputContainer: {
    alignItems: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 110,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 60,
    width: '95%',
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

