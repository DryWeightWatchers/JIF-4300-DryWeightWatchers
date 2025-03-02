import React, { useState } from 'react';
import { View, LayoutChangeEvent, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Svg, { Text as SvgText, Rect, G } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons'; 

type CalendarProps = {
  onDataPointSelect: (selectedData: {
    day: Date;
  }) => void;
};

const Calendar = ({ onDataPointSelect }: CalendarProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const CELL_SIZE = dimensions.width / 7;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const handleNextMonth = () => {
    let nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setSelectedMonth(nextMonth); 
  }

  const handlePrevMonth = () => {
    let nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() - 1); 
    setSelectedMonth(nextMonth); 
  }

  const grid = [];
  let dayCounter = 1;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const isFirstRow = row === 0;
      const isEmpty = (row === 0 && col < firstDayOfMonth) || dayCounter > daysInMonth;
      const date = isEmpty ? '' : dayCounter;

      grid.push({
        x: col * CELL_SIZE,
        y: row * CELL_SIZE + (isFirstRow ? CELL_SIZE : 0), 
        date,
      });

      if (!isEmpty) dayCounter++;
    }
  }

  return (
    <View style={{ flex: 1 }}>

      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={24} color="#7B5CB8" />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        
        <TouchableOpacity onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#7B5CB8" />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer} onLayout={onLayout}>
        <Svg width={dimensions.width} height={dimensions.height}>
          <G>
            {DAYS.map((day, index) => (
              <SvgText
                key={day}
                x={index * CELL_SIZE + CELL_SIZE / 2}
                y={CELL_SIZE / 2}
                textAnchor="middle"
                alignmentBaseline="central"
                fill="#7B5CB8"
                fontSize={14}
              >
                {day}
              </SvgText>
            ))}
          </G>

          {grid.map((cell, index) => (
            <G key={index}>
              <Rect
                x={cell.x}
                y={cell.y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill="white"
                stroke="#F0F0F0"
                strokeWidth={1}
              />
              <SvgText
                x={cell.x + CELL_SIZE / 2}
                y={cell.y + CELL_SIZE / 2}
                textAnchor="middle"
                alignmentBaseline="central"
                fill={cell.date === today.getDate() ? '#7B5CB8' : '#333'}
                fontWeight={cell.date === today.getDate() ? 'bold' : 'normal'}
              >
                {cell.date}
              </SvgText>
            </G>
          ))}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    borderColor: '#7B5CB8',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f3582',
  },
  chartContainer: {
    borderColor: '#7B5CB8',
    borderWidth: 1,
    flex: 1,
  },
});

export default Calendar;