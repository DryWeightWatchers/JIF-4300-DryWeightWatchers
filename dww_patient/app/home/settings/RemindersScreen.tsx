import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Modal, Button, Switch, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import ReminderItem from '../../../assets/components/ReminderItem'
import { useNavigation } from '@react-navigation/native';
import { SettingsStackScreenProps } from '../../types/navigation';
import { useAuth } from '../../auth/AuthProvider';
import { authFetch } from '../../../utils/authFetch'; 
import { scheduleNotification, cancelAllNotifications, requestNotificationPermissions } from '../../../utils/reminderNotifications';
import Constants from 'expo-constants';

const { apiBaseUrl } = Constants.expoConfig!.extra as { apiBaseUrl: string };

interface NotificationPreferences {
  push_notifications: boolean;
  email_notifications: boolean;
}

//https://docs.expo.dev/versions/latest/sdk/notifications/
const RemindersScreen = () => {
  const navigation = useNavigation<SettingsStackScreenProps<'Reminders'>['navigation']>();
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [time, setTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedReminderID, setSelectedReminderID] = useState(-1);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    push_notifications: false,
    email_notifications: false
  });
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);

  const fetchNotificationPreferences = async () => {
    try {
      const response = await authFetch(
        `${apiBaseUrl}/get-notification-preferences/`,
        accessToken,
        refreshAccessToken,
        logout,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const data = await response.json();
      setNotificationPreferences(data);
    } catch (error: any) {
      console.log('get notification preferences error:', error.response?.data || error.message);
      alert('Failed to get your notification preferences. Please try again.');
    }
  };

  const updateNotificationPreferences = async (preferences: NotificationPreferences) => {
    try {
      console.log('Updating notification preferences with:', preferences);
      const response = await authFetch(
        `${apiBaseUrl}/update-notification-preferences/`,
        accessToken,
        refreshAccessToken,
        logout,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to update notification preferences');
      }

      const data = await response.json();
      console.log('Successfully updated preferences:', data);
      setNotificationPreferences(data);
    } catch (error: any) {
      console.log('update notification preferences error:', error.response?.data || error.message);
      alert('Failed to update your notification preferences. Please try again.');
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await authFetch(
        `${apiBaseUrl}/get-reminders/`, 
        accessToken, refreshAccessToken, logout, {
          method: 'GET', 
          headers: {
            'Content-Type': 'application/json', 
          }, 
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }

      const data = await response.json();
      console.log('got reminders: ', data)
      const parsedReminders = data.map((reminder: any) => ({
        ...reminder,
        days: reminder.days.split(', '), 
        time: reminder.time.substring(0, 5) 
      }));
      setReminders(parsedReminders);
    } catch (error: any) {
      console.log('get reminders error:', error.response?.data || error.message)
      alert('Failed to get your reminders. Please try again.')
    }
  };
  
  useEffect(() => {
    fetchReminders();
  }, [accessToken]);

  useEffect(() => { //im scared of messing up database to local notification synchronization so im wiping all notifications and rescheduling whatever is retrieved
    const resyncNotifications = async () => {
      await requestNotificationPermissions();
      
      await cancelAllNotifications();
  
      // Only schedule notifications if push notifications are enabled
      if (notificationPreferences.push_notifications) {
        reminders.forEach(async (reminder) => {
          await scheduleNotification(reminder);
        });
      }
    };
    
    resyncNotifications();
  }, [reminders, notificationPreferences.push_notifications]);

  useEffect(() => {
    fetchNotificationPreferences();
  }, [accessToken]);

  const handleAddReminder = async () => { //add new reminder
    try {
      const response = await authFetch(
        `${apiBaseUrl}/add-reminder/`, 
        accessToken, refreshAccessToken, logout, {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json', 
          }, 
          body: JSON.stringify({ 
            time: time.getHours() + ':' + time.getMinutes(), 
            days: selectedDays 
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }
      const data = await response.json();
      console.log('add reminder successful:', data);

      resetStates();
      fetchReminders();
    } catch (error: any) {
      console.log('add reminder error:', error.response?.data || error.message)
      alert('Failed to add reminder. Please try again.')
    }
  }

  const handleEditReminder = (id: number) => { //target old reminder
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      setTime(reminderTimeToDate(reminder.time));
      setSelectedDays(reminder.days);
      setSelectedReminderID(id);
      setModalVisible(true);
    } else {
      console.log(`Reminder with id ${id} not found`);
    }
  }

  const handleSaveReminder = async () => { //update old reminder with new data
    try {
      const response = await authFetch(
        `${apiBaseUrl}/save-reminder/`,
        accessToken, refreshAccessToken, logout, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            time: time.getHours() + ':' + time.getMinutes(),
            days: selectedDays,
            id: selectedReminderID
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }
      const data = await response.json();
      console.log('save reminder successful:', data);

      resetStates();
      fetchReminders();
    } catch (error: any) {
      console.log('save reminder error:', error.response?.data || error.message)
      alert('Failed to save reminder. Please try again.')
    }
  }

  const handleDeleteReminder = async () => { //delete selected reminder
    try {
      const response = await authFetch(
        `${apiBaseUrl}/delete-reminder/${selectedReminderID}/`,
        accessToken, refreshAccessToken, logout, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }
      const data = await response.json();
      console.log('delete reminder successful:', data);

      resetStates();
      fetchReminders();
    } catch (error: any) {
      console.log('delete reminder error:', error.response?.data || error.message)
      alert('Failed to delete reminder. Please try again.')
    }
  }

  const handleToggleDay = (day: string) => {
    setSelectedDays(prevDays => 
      prevDays.includes(day)
        ? prevDays.filter(d => d !== day && d !== "")
        : [...prevDays.filter(d => d !== ""), day]
    );
  };

  const resetStates = () => {
    setModalVisible(false);
    setTime(new Date());
    setSelectedDays([]);
    setSelectedReminderID(-1);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        {reminders.map((reminder) => (
          <ReminderItem
            key={reminder.id}
            time={reminder.time}
            days={reminder.days}
            onPress={() => handleEditReminder(reminder.id)}
          />
        ))}
        {reminders.length === 0 && (
          <Text style={styles.emptyText}>No reminders set</Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={36} color="#7B5CB8"/>
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={() => setPreferencesModalVisible(true)}>
          <Ionicons name="notifications" size={36} color="#7B5CB8"/>
          <Text style={styles.addButtonText}>Notification Settings</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType='slide' transparent={true} visible={modalVisible} onRequestClose={() => resetStates()}>
        <Pressable style={styles.modalTop} onPress={() => resetStates()}/>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {selectedReminderID !== -1 ? 'Edit Reminder' : 'Add Reminder'}
          </Text>
          <DateTimePicker
            value={time}
            mode="time"
            onChange={(_, selectedTime) => selectedTime && setTime(selectedTime)}
            style={styles.timePicker}
          />
          <View style={styles.daysContainer}>
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <View key={day} style={styles.dayItem}>
                <Text>{day}</Text>
                <Switch
                  value={selectedDays.includes(day)}
                  onValueChange={() => handleToggleDay(day)}
                />
              </View>
            ))}
          </View>
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={() => resetStates()}/>
            {selectedReminderID !== -1 && (<Button title="Delete" color='red' onPress={handleDeleteReminder}/>)}
            <Button title={selectedReminderID == -1 ? 'Add' : 'Save'} onPress={selectedReminderID == -1 ? handleAddReminder : handleSaveReminder}/>
          </View>
        </View>
      </Modal>

      <Modal animationType='slide' transparent={true} visible={preferencesModalVisible} onRequestClose={() => setPreferencesModalVisible(false)}>
        <Pressable style={styles.modalTop} onPress={() => setPreferencesModalVisible(false)}/>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Notification Preferences</Text>
          <View style={styles.preferencesContainer}>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Push Notifications</Text>
              <Switch
                value={notificationPreferences.push_notifications}
                onValueChange={(value) => {
                  updateNotificationPreferences({
                    ...notificationPreferences,
                    push_notifications: value
                  });
                }}
              />
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Email Notifications</Text>
              <Switch
                value={notificationPreferences.email_notifications}
                onValueChange={(value) => {
                  updateNotificationPreferences({
                    ...notificationPreferences,
                    email_notifications: value
                  });
                }}
              />
            </View>
          </View>
          <View style={styles.buttonRow}>
            <Button title="Close" onPress={() => setPreferencesModalVisible(false)}/>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 30,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#7B5CB8',
    fontSize: 12,
    marginTop: 4,
  },
  modalTop: {
    flex: 1
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flex: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 40,
    alignSelf: 'center',
  },
  timePicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  daysContainer: {
    alignSelf: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 5,
    width: '50%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  preferencesContainer: {
    padding: 20,
  },
  preferencesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  preferenceLabel: {
    fontSize: 16,
  },
});

interface Reminder { //for typing... cant import this because of index...
  id: number;
  time: string;
  days: string[];
}

const reminderTimeToDate = (timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

export default RemindersScreen;