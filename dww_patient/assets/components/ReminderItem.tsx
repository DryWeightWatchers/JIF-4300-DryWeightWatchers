import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type ReminderItemProps = {
  time: string;
  days: string[];
  onPress: () => void;
};

const ReminderItem = ({ time, days, onPress }: ReminderItemProps) => {
  const formatDays = (days: string[]) => {
    return days.map(day => day.substring(0, 3)).join(', ');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.days} numberOfLines={1}>
            {days.length > 0 ? formatDays(days) : 'No days selected'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  days: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default ReminderItem;