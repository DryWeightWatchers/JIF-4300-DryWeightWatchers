import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, ScrollView, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { HomeTabScreenProps } from '../types/navigation';
import Chart from '../../assets/components/Chart';
import Calendar from '../../assets/components/Calendar';

const DashboardScreen = () => {
  const navigation = useNavigation<HomeTabScreenProps<'Dashboard'>['navigation']>();
  const [chart, setChart] = useState('chart');

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
        {chart === 'chart' ? <Chart date={new Date()}/> : <Calendar/>}
      </View>
      <ScrollView style={styles.noteContainer}>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  chartSliderContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
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
    backgroundColor: 'white',
  },
});

export default DashboardScreen;