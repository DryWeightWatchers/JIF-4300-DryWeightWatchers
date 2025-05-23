import React from 'react';
import { SectionList, StyleSheet, Text } from 'react-native';
import SettingsItem from '../../../assets/components/SettingsItem';
import { useNavigation } from '@react-navigation/native';
import { SettingsStackScreenProps } from '../../types/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsStackScreenProps<'Settings'>['navigation']>();

  const SETTINGS_SECTIONS = [
    {
      title: 'Account Settings', 
      data: [
        {
          title: 'Profile',
          icon: <Ionicons name='person-circle-outline'/>,
          screen: 'Profile',
        },
        {
          title: 'Account',
          icon: <Ionicons name='person'/>,
          screen: 'Account',
        },
        {
          title: 'Healthcare Provider',
          icon: <Ionicons name='list-outline'/>,
          screen: 'ProviderList',
        },
      ],
    },
    {
      title: 'Preferences',
      data: [
        {
          title: 'Reminders',
          icon: <Ionicons name='notifications'/>,
          screen: 'Reminders',
        },
      ],
    },
  ];

  return (
    <SectionList
      sections={SETTINGS_SECTIONS}
      keyExtractor={(item) => item.title}
      renderItem={({ item }) => (
        <SettingsItem
          title={item.title}
          icon={item.icon}
          onPress={() => navigation.navigate(item.screen as any)}
        />
      )}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SettingsScreen;