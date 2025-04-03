import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { HomeTabScreenProps, SettingsStackScreenProps } from '../types/navigation';
import { authFetch } from '@/utils/authFetch';
import { useAuth } from '../auth/AuthProvider';
import Chart from '../../assets/components/Chart';
import Calendar from '../../assets/components/Calendar';

type ProfileData = {
  firstname: string,
  lastname: string,
  email: string,
  phone: string,
  password: string,
}

type WeightRecord = {
  timestamp: Date,
  weight: number,
}

const HomeScreen = () => {
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const navigation = useNavigation<HomeTabScreenProps<'Home'>['navigation']>();
  const navigation_settings = useNavigation<SettingsStackScreenProps<'Settings'>['navigation']>();
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chart, setChart] = useState('chart');

  const fetchUserData = async () => {
    try {
      const res = await authFetch(`${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/patient-profile/`, accessToken, refreshAccessToken, logout, {
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch weight records
  const fetchWeightRecords = async () => {
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
      setWeightRecords(formattedRecord);

    } catch (error: any) {
      alert('Failed to get your weight data. Please try again.')
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchWeightRecords();
    }, [accessToken])
  );

  const isWeightRecordedToday = () => {
    const today = new Date().toDateString();
    return weightRecords.some(record =>
      new Date(record.timestamp).toDateString() === today
    );
  };


  const handleDataPointSelect = (day: Date) => {
    navigation.navigate('Dashboard');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.userName}>Hi {userData?.firstname} {userData?.lastname},</Text>
        <Text style={styles.subtitle}>
          {isWeightRecordedToday()
            ? `You're all set for today!`
            : `You haven't recorded your weight today!`}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('Settings', { screen: 'Reminders' })}
        >
          <Text style={styles.cardText}>Your Reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('Settings', { screen: 'ProviderList' })}
        >
          <Text style={styles.cardText}>Your Providers</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.sectionLink}>See Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          {chart === 'chart' ? <Chart weightRecord={weightRecords} onDataPointSelect={handleDataPointSelect} /> : <Calendar weightRecord={weightRecords} onDataPointSelect={handleDataPointSelect} />}
        </View>
      </View>

      <TouchableOpacity
        style={styles.recordWeightButton}
        onPress={() => navigation.navigate('EnterData')}
      >
        <Text style={styles.recordWeightText}>
          {isWeightRecordedToday()
            ? "You're All Set for Today"
            : "Enter Today's Weight"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  topSection: {
    backgroundColor: '#7B5CB8',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 100,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -40,
  },
  cardButton: {
    backgroundColor: '#FFFFFF',
    width: '45%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7B5CB8',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 24, 
  },
  sectionLink: {
    fontSize: 14,
    color: '#7B5CB8',
    marginBottom: 10,
    lineHeight: 24, 
  },
  weightRecordContainer: {
    flexDirection: 'row',
  },
  weightRecordCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginRight: 10,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#777',
  },
  recordWeightButton: {
    backgroundColor: '#7B5CB8',
    padding: 16,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  recordWeightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartContainer: {
    flex: 2,
    padding: 8,
    justifyContent: 'center',
    height: 300,
  },
});

export default HomeScreen;
