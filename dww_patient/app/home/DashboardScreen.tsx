import React, { useCallback, useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, ScrollView, } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { HomeTabScreenProps } from '../types/navigation';
import Chart from '../../assets/components/Chart';
import Calendar from '../../assets/components/Calendar';
import { useAuth } from '../auth/AuthProvider';
import { authFetch } from '../../utils/authFetch'; 

type WeightRecord = {
  timestamp: Date,
  weight: number,
}

type PatientNote = {
  timestamp: Date,
  note: string,
}

const DashboardScreen = () => {
  const navigation = useNavigation<HomeTabScreenProps<'Dashboard'>['navigation']>();
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const [chart, setChart] = useState('chart');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [weightRecord, setWeightRecord] = useState<WeightRecord[]>([]);
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([]);

  const fetchWeightRecord = async () => {
    try {
      const response = await authFetch(
        `${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/get-weight-record/`, 
        accessToken, refreshAccessToken, logout, {
          method: 'GET', 
          headers: {
            'Content-Type': 'application/json', 
          }, 
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch your weight data.');
      }

      const data = await response.json();
      console.log('got record: ', data)
      const formattedRecord = data.map((item: any) => ({
        timestamp: new Date(item.timestamp),
        weight: item.weight,
      }));
      setWeightRecord(formattedRecord);

    } catch (error: any) {
      console.log('get weight record error:', error.response?.data || error.message)
      alert('Failed to get your weight data. Please try again.')
    }
  }

  const fetchPatientNotes = async () => {
    try {
      const response = await authFetch(
        `${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/get-patient-notes/`, 
        accessToken, refreshAccessToken, logout, {
          method: 'GET', 
          headers: {
            'Content-Type': 'application/json', 
          }, 
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch your notes.');
      }

      const data = await response.json();
      console.log('got notes: ', data)
      const formattedNotes = data.map((item: any) => ({
        timestamp: new Date(item.timestamp),
        note: item.note,
      }));
      setPatientNotes(formattedNotes);

    } catch (error: any) {
      console.log('get patient notes error:', error.response?.data || error.message)
      alert('Failed to get your patient notes. Please try again.')
    }
  }

  const handleDataPointSelect = (day: Date) => {
    setSelectedDay(day);
  };
/*
  const handleDataPointSelect = (selectedData: { day: Date }) => {
    setSelectedDay({
      day: selectedData.day,
      weight: weightRecord.find(record => record.timestamp.toDateString() === selectedData.day.toDateString())?.weight,
      notes: patientNotes
        .filter(note => note.timestamp.toDateString() === selectedData.day.toDateString())
        .map(note => note.note).join('\n') || 'No notes for this day',
    });
  };
*/
  useFocusEffect(
    useCallback(() => {
      fetchWeightRecord();
      fetchPatientNotes();
    }, [accessToken])
  );

  return (
    <View style={styles.mainContainer}>

      <View style={styles.chartSliderContainer}>
        <TouchableOpacity style={[styles.leftSlider, {backgroundColor: chart === 'chart' ? '#7B5CB8' : 'white'}]} onPress={() => setChart('chart')}>
          <Text style={{color: chart === 'chart' ? 'white': 'gray'}}>
            Chart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rightSlider, {backgroundColor: chart === 'calendar' ? '#7B5CB8' : 'white'}]} onPress={() => setChart('calendar')}>
          <Text style={{color: chart === 'calendar' ? 'white': 'gray'}}>
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        {chart === 'chart' ? <Chart weightRecord={weightRecord} onDataPointSelect={handleDataPointSelect}/> : <Calendar weightRecord={weightRecord} onDataPointSelect={handleDataPointSelect}/>}
      </View>

      <ScrollView style={styles.noteContainer}>
      {selectedDay ? (
        <View style={styles.noteContent}>

          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Date:</Text>
            <Text style={styles.noteValue}>
              {selectedDay.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {selectedDay && (
            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>Weight Recorded:</Text>
              {weightRecord
                .filter(record => 
                  record.timestamp.getFullYear() === selectedDay.getFullYear() &&
                  record.timestamp.getMonth() === selectedDay.getMonth() &&
                  record.timestamp.getDate() === selectedDay.getDate()
                )
                .map((record, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteValue}>
                      {record.weight} lbs
                    </Text>
                    <Text style={styles.noteTime}>
                      {record.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                ))}
              {!weightRecord.some(record => 
                record.timestamp.getFullYear() === selectedDay.getFullYear() &&
                record.timestamp.getMonth() === selectedDay.getMonth() &&
                record.timestamp.getDate() === selectedDay.getDate()
              ) && (
                <Text style={styles.noNotesText}>No weight records for this day</Text>
              )}
            </View>
          )}

          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Notes:</Text>
            {patientNotes
              .filter(note => 
                note.timestamp.toDateString() === selectedDay.toDateString()
              )
              .map((note, index) => (
                <View key={index} style={styles.noteItem}>
                  <Text style={styles.noteText}>{note.note}</Text>
                  <Text style={styles.noteTime}>
                    {note.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              ))}
            
            {!patientNotes.some(note => 
              note.timestamp.toDateString() === selectedDay.toDateString()
            ) && (
              <Text style={styles.noNotesText}>No notes for this day</Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Select a data point to view details
          </Text>
        </View>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  chartSliderContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  leftSlider: {
    padding: 12,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    maxWidth: 120,
    minWidth: 100,
    alignItems: 'center',
    borderColor: '#7B5CB8',
    borderWidth: 1,
    borderRightWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  /*middleSlider: {
    in case I decide I want more chart types later.
  },*/
  rightSlider: {
    padding: 12,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    maxWidth: 120,
    minWidth: 100,
    alignItems: 'center',
    borderColor: '#7B5CB8',
    borderWidth: 1,
    borderLeftWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartContainer: {
    flex: 2,
    padding: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  noteContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
    borderColor: '#7B5CB8',
  },
  noteContent: {
    padding: 16,
  },
  noteSection: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 16,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f3582',
    marginBottom: 8,
  },
  noteValue: {
    fontSize: 16,
    color: '#333',
  },
  noteItem: {
    backgroundColor: '#F5F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
  },
  noteTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noNotesText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
});

export default DashboardScreen;