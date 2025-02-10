import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SettingsStackScreenProps } from '../../types/navigation';

//https://docs.expo.dev/versions/latest/sdk/notifications/
const RemindersScreen = () => {
  const navigation = useNavigation<SettingsStackScreenProps<'Reminders'>['navigation']>();
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleAddReminder = () => {
    setModalVisible(true);
  }

  const handleEditReminder = () => {

  }

  const handleSaveReminder = () => {
    setModalVisible(false);
  }

  const handleToggleDay = (day: string) => {
    setSelectedDays((prevDays) => 
      prevDays.includes(day) ? prevDays.filter(d => d !== day) : [...prevDays, day]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        {/*reminders here later*/}
        {reminders.length === 0 && (
          <Text style={styles.emptyText}>No reminders set</Text>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
          <Ionicons name="add-circle" size={36} color="#7B5CB8"/>
          <Text style={styles.addButtonText}>Add Reminder</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal animationType='slide' transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <TouchableOpacity 
        style={styles.modalTop} 
        activeOpacity={1}
        onPress={() => setModalVisible(false)}
      >
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
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            <Button title="Save" onPress={handleSaveReminder} />
          </View>
        </View>
        </TouchableOpacity>
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
  },
  addButtonText: {
    color: '#7B5CB8',
    fontSize: 12,
    marginTop: 4,
  },
  modalTop: {
    flex: 1,
    justifyContent: 'flex-end',
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

export default RemindersScreen;