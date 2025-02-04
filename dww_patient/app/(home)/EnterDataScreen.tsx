import React, { useState } from 'react';
import { Text, StyleSheet, View, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../(auth)/AuthContext';

const EnterDataScreen = () => {
  const navigation = useNavigation();
  const [weight, setWeight] = useState('');
  const { authToken } = useAuth();

  const handleReportData = async () => {
    if (!weight) {
      alert('Please enter a valid weight.');
      return;
    }
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/record_weight/`, 
        { 'weight': parseFloat(weight) }, 
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          }
        }
      );
      console.log('weight input successful:', response.data);
      alert(`Weight reported: ${weight}kg`);
      setWeight(''); 
    } catch (error: any) {
      console.log('weight input error:', error.response?.data || error.message)
      alert('Failed to report weight. Please try again.')
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
          <TouchableOpacity style={styles.reportButton} onPress={handleReportData}>
            <Text style={styles.reportButtonText}>Submit</Text>
          </TouchableOpacity>
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
    color: '#0E315F',
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
});

export default EnterDataScreen;
