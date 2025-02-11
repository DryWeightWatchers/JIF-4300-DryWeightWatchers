import React, { useState } from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RemindersScreen = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');

  return (
    <Text>
      {message}
    </Text>
  );
};

export default RemindersScreen;