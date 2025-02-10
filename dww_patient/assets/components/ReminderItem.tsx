import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';

type ReminderItemProps = {
  time: string;
  days: string[];
  onPress: () => void;
};

const ReminderItem = ({ time, days, onPress }: ReminderItemProps) => {
  
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pressed: {
    backgroundColor: '#f8f8f8',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  details: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 16,
    color: '#666',
  },
  days: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});

export default ReminderItem;