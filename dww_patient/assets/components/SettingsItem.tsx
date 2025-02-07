import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

//https://docs.expo.dev/guides/icons/
//https://icons.expo.fyi/Index <- Look here and filter by Ionicons
type SettingsItemProps = {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export const SettingsItem = ({ title, icon, onPress }: SettingsItemProps) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View style={styles.itemContent}>
      {icon}
      <Text style={styles.itemTitle}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" color='gray'/>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
  },
});

export default SettingsItem;