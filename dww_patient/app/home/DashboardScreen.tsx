import React, { useCallback, useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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

type ProfileData = {
  firstname: string,
  lastname: string,
  email: string,
  phone: string,
  password: string,
  is_verified: boolean,
  unit_preference: string,
}

type PatientNote = {
  id: number,
  timestamp: Date,
  note: string,
}

const DashboardScreen = () => {
  const navigation = useNavigation<HomeTabScreenProps<'Dashboard'>['navigation']>();
  const { accessToken, refreshAccessToken, logout, user } = useAuth();
  const [chart, setChart] = useState('chart');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [weightRecord, setWeightRecord] = useState<WeightRecord[]>([]);
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([]);
  const [userPreference, setUserPreference] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [userDataIsLoading, setUserDataIsLoading] = useState<boolean>(true);
  const [weightRecordsAreLoading, setWeightRecordsAreLoading] = useState<boolean>(true);
  const [notesAreLoading, setNotesAreLoading] = useState<boolean>(true);


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
      const formattedRecord = data.map((item: any) => ({
        timestamp: new Date(item.timestamp),
        weight: item.weight,
      }));
      setWeightRecord(formattedRecord);

    } catch (error: any) {
      alert('Failed to get your weight data. Please try again.')
    } finally {
      setWeightRecordsAreLoading(false); 
    }
  }

  const fetchUserData = async () => {
    try {
      const res = await authFetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/patient-profile/`, 
        accessToken, refreshAccessToken, logout, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        setError(`HTTP error: ${res.status}`);
        return;
      }
      const data = await res.json();
      setUserData(data);
      setUserPreference(data.unit_preference);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUserDataIsLoading(false);
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
      const formattedNotes = data.map((item: any) => ({
        id: item.id,
        timestamp: new Date(item.timestamp),
        note: item.note,
      }));
      setPatientNotes(formattedNotes);

    } catch (error: any) {
      alert('Failed to get your patient notes. Please try again.')
    } finally {
      setNotesAreLoading(false); 
    }
  }

  const handleDataPointSelect = (day: Date) => {
    setSelectedDay(day);
  };

  const convertWeight = (weight: Number, unit_preference) => {
    if (userPreference === 'metric') {
      return (weight / 2.20462).toFixed(2) + ' kg'; // Convert pounds to kilograms
    }
    return weight + ' lbs';
  };

  useFocusEffect(
    useCallback(() => {
      fetchWeightRecord();
      fetchUserData();
      fetchPatientNotes();
    }, [accessToken])
  );

  // Add useEffect to refresh weight records when unit preference changes
  useEffect(() => {
    if (user?.unit_preference) {
      fetchWeightRecord();
    }
  }, [user?.unit_preference]);


  if (userDataIsLoading || weightRecordsAreLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B5CB8" />
      </View>
    );
  }

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
                    {convertWeight(record.weight, userPreference)}
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
              <Text style={styles.noText}>No weight records for this day</Text>
            )}
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Notes:</Text>

            {notesAreLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7B5CB8" />
              </View>

            ) : (
              <>
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
                  <Text style={styles.noText}>No notes for this day</Text>
                )}
              </>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },
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
  noText: {
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