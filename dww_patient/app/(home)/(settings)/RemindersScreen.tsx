import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Switch, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import ReminderItem from '../../../assets/components/ReminderItem'
import { useNavigation } from '@react-navigation/native';
import { SettingsStackScreenProps } from '../../types/navigation';
import axios from 'axios';
import { useAuth } from '../../(auth)/AuthContext';

//https://docs.expo.dev/versions/latest/sdk/notifications/
const RemindersScreen = () => {
  const navigation = useNavigation<SettingsStackScreenProps<'Reminders'>['navigation']>();
  const { authToken } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [time, setTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedReminderID, setSelectedReminderID] = useState(-1);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/get-reminders/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
        }
      });
      console.log('got reminders: ', response.data)
      const parsedReminders = response.data.map((reminder: any) => ({
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
  }, [authToken]);

  const handleAddReminder = async () => { //add new reminder
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/add-reminder/`, 
        { 'time': time.getHours() + ':' + time.getMinutes(), 'days': selectedDays }, 
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          }
        }
      );
      console.log('add reminder successful:', response.data);
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
      const response = await axios.put(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/save-reminder/`, 
        { 'time': time.getHours() + ':' + time.getMinutes(), 'days': selectedDays, 'id': selectedReminderID }, 
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          }
        }
      );
      console.log('save reminder successful:', response.data);
      resetStates();
      fetchReminders();
    } catch (error: any) {
      console.log('save reminder error:', error.response?.data || error.message)
      alert('Failed to save reminder. Please try again.')
    }
  }

  const handleDeleteReminder = async () => { //delete selected reminder
    try {
      const response = await axios.delete(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/delete-reminder/${selectedReminderID}/`, 
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          }
        }
      );
      console.log('delete reminder successful:', response.data);
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

  const handleToggleReminder = async (id: number) => { //this needs to be changed eventually. I may move toggle to the editor modal.
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      const updatedReminder = { ...reminder, enabled: !reminder.enabled };
      setReminders(reminders.map(r => r.id === id ? updatedReminder : r));
      try {
        const response = await axios.put(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/save-reminder/`, 
          { 'time': updatedReminder.time, 'days': updatedReminder.days, 'id': updatedReminder.id, 'enabled': updatedReminder.enabled }, 
          {
            headers: {
              'Authorization': `Token ${authToken}`,
            }
          }
        );
        console.log('toggle reminder successful:', response.data);
        fetchReminders();
      } catch (error: any) {
        console.log('toggle reminder error:', error.response?.data || error.message)
        alert('Failed to toggle reminder. Please try again.')
      }
    } else {
      console.log(`Reminder with id ${id} not found`);
    }
    //add actual notification system for phone
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
        isEnabled={reminder.enabled}
        onToggle={() => handleToggleReminder(reminder.id)}
        onPress={() => handleEditReminder(reminder.id)}
      />
      ))}
        {reminders.length === 0 && (
          <Text style={styles.emptyText}>No reminders set</Text>
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={36} color="#7B5CB8"/>
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal animationType='slide' transparent={true} visible={modalVisible} onRequestClose={() => resetStates()}>
        <Pressable style={styles.modalTop} onPress={() => setModalVisible(false)}/>
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
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 25,
    marginTop: 30,
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
  }
});

interface Reminder { //for typing... cant import this because of index...
  id: number;
  time: string;
  days: string[];
  enabled: boolean;
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