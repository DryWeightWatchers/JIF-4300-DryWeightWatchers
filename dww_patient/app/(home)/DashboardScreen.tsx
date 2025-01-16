import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://192.168.0.9:8000/api/sample')
      .then(response => {
        setMessage(response.data.message);
        console.log('Response:', response.data);
      })
      .catch(error => {
        console.error('axios error:', error);
      })
  }, []);

  return (
    <Text>
      {message}
    </Text>
  );
};

export default DashboardScreen;