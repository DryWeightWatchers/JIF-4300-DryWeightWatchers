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
  const [reminderType, setReminderType] = useState('');
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
      alert(`new reminder added`);
      setModalVisible(false);
      setSelectedDays([]);
      setReminderType('');
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
      setReminderType('edit');
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
      alert(`reminder saved`);
      setModalVisible(false);
      setSelectedDays([]);
      setReminderType('');
      fetchReminders();
    } catch (error: any) {
      console.log('save reminder error:', error.response?.data || error.message)
      alert('Failed to save reminder. Please try again.')
    }
  }

  const handleToggleDay = (day: string) => {
    setSelectedDays((prevDays) => 
      prevDays.includes(day) ? prevDays.filter(d => d !== day) : [...prevDays, day]
    );
  };

  const handleToggleReminder = (id: number) => {

  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
      {reminders.map((reminder, index) => (
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

        <TouchableOpacity style={styles.addButton} onPress={() => {setModalVisible(true); setReminderType('add')}}>
          <Ionicons name="add-circle" size={36} color="#7B5CB8"/>
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal animationType='slide' transparent={true} visible={modalVisible} onRequestClose={() => {setModalVisible(false); setSelectedReminderID(-1)}}>
        <Pressable style={styles.modalTop} onPress={() => setModalVisible(false)}/>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Edit Reminder</Text>
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
            <Button title="Cancel" onPress={() => {setModalVisible(false); setTime(new Date()); setSelectedDays([])}}/>
            <Button title={reminderType === 'add' ? 'Add' : 'Save'} onPress={reminderType === 'add' ? handleAddReminder : handleSaveReminder}/>
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