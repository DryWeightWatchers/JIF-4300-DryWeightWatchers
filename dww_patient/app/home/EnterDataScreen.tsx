// screens/EnterDataScreen.tsx
import React, { useState, useRef } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { authFetch } from '../../utils/authFetch';
import { connectToScale, stopScanning } from '../../utils/bluetooth';

const EnterDataScreen = () => {
  const { accessToken, refreshAccessToken, logout, user, setUser } = useAuth();
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMetric, setIsMetric] = useState(user?.unit_preference === 'metric');
  const [scanning, setScanning] = useState(false);

  // ref to prevent multiple callbacks
  const gotWeightRef = useRef(false);

  const handleReadWeight = () => {
    // reset flag
    gotWeightRef.current = false;
    setScanning(true);

    connectToScale(
      (kg) => {
        if (gotWeightRef.current) return;
        gotWeightRef.current = true;

        // convert & set
        const val = isMetric ? kg : kg * 2.20462;
        setWeight(val.toFixed(2));

        // stop scanning
        stopScanning();
        setScanning(false);
      },
      60000
    )
    .catch(err => {
      console.error('BLE scan error:', err.message);
      Alert.alert('Error', 'Failed to read weight');
      setScanning(false);
    });
  };

  const handleReportData = async () => {
    if (!weight) {
      Alert.alert('Error', 'Please enter a weight');
      return;
    }
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    const weightInPounds = isMetric
      ? parseFloat((w * 2.20462).toFixed(2))
      : w;

    setLoading(true);
    try {
      const res = await authFetch(
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
      if (res.ok) {
        Alert.alert('Success', 'Weight recorded successfully');
        setWeight('');
      } else {
        Alert.alert('Error', 'Failed to record weight');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'Failed to record weight');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitToggle = async () => {
    const newPref = isMetric ? 'imperial' : 'metric';
    try {
      const res = await authFetch(
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
          body: JSON.stringify({ unit_preference: newPref }),
        }
      );
      if (!res.ok) throw new Error('Failed to update preference');
      setIsMetric(!isMetric);
      setUser(prev => prev && { ...prev, unit_preference: newPref });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message || 'Failed to update unit preference');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Dry Weight Tracker</Text>
          <Text style={styles.subtitle}>
            Track your weight to monitor your health effectively.
          </Text>
        </View>

        <View style={styles.readContainer}>
          {scanning ? (
            <View style={styles.scanningRow}>
              <ActivityIndicator size="small" color="#7B5CB8" />
              <Text style={styles.scanningText}>Reading weight…</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.readButton}
              onPress={handleReadWeight}
            >
              <Text style={styles.readButtonText}>Connect to Scale</Text>
            </TouchableOpacity>
          )}
        </View>

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
            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity
              style={styles.reportButton}
              onPress={handleReportData}
            >
              <Text style={styles.reportButtonText}>Record Weight</Text>
            </TouchableOpacity>
          )}
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

export default EnterDataScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', backgroundColor: '#F5F9FF', padding: 20 },
  header:    { alignItems: 'center', marginBottom: 20 },
  title:     { fontSize: 24, fontWeight: 'bold', color: '#4f3582', marginBottom: 5 },
  subtitle:  { fontSize: 16, color: '#5A5A5A', textAlign: 'center', lineHeight: 22 },
  readContainer:   { alignItems: 'center', marginVertical: 20 },
  scanningRow:     { flexDirection: 'row', alignItems: 'center' },
  scanningText:    { marginLeft: 8, fontStyle: 'italic', color: '#555' },
  readButton:      { backgroundColor: '#7B5CB8', padding: 12, borderRadius: 8 },
  readButtonText:  { color: '#fff', fontSize: 16, fontWeight: '600' },
  inputContainer:  { alignItems: 'center' },
  label:           { fontSize: 16, marginBottom: 10, color: '#333' },
  input:           { height: 60, width: '95%', borderColor: '#0E315F', borderWidth: 1, borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 20 },
  reportButton:    { backgroundColor: '#7B5CB8', padding: 12, borderRadius: 8, width: '90%', alignItems: 'center' },
  reportButtonText:{ color: '#fff', fontSize: 16, fontWeight: '600' },
  unitToggleContainer:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20, padding: 10, backgroundColor: 'white', borderRadius: 8, elevation: 2 },
  unitLabel:       { fontSize: 16, fontWeight: '500', color: '#333' },
  footer:          { alignItems: 'center', marginTop: 20 },
  footerText:      { fontSize: 14, color: '#7A7A7A', textAlign: 'center' },
});
