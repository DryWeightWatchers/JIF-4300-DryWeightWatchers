import React, { useState, useEffect } from 'react';
import { View, LayoutChangeEvent, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Svg, { Text as SvgText, Rect, G, Circle } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons'; 

type CalendarProps = {
  weightRecord: Array<{ 
    timestamp: Date;
    weight: number;
  }>;
  onDataPointSelect: (selectedData: {
    day: Date;
  }) => void;
};

type WeightRecord = {
  timestamp: Date,
  weight: number,
}

const Calendar = ({ weightRecord, onDataPointSelect }: CalendarProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedMonthRecord, setSelectedMonthRecord] = useState<WeightRecord[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const MARGIN = 16;
  const CELL_WIDTH = (dimensions.width - MARGIN * 2) / 7;
  const CELL_HEIGHT = (dimensions.height - MARGIN * 2) / 7;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  useEffect(() => {
    const filteredData = weightRecord.filter((point) => {
      return (
        point.timestamp.getFullYear() === selectedMonth.getFullYear() &&
        point.timestamp.getMonth() === selectedMonth.getMonth()
      );
    });
    setSelectedMonthRecord(filteredData);
  }, [selectedMonth, weightRecord]);

  //main calendar construction
  const grid = [];
  let dayCounter = 1;

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const isEmpty = (row === 0 && col < firstDayOfMonth) || dayCounter > daysInMonth;
      const date = isEmpty ? '' : dayCounter;

      grid.push({
        x: col * CELL_WIDTH + MARGIN,
        y: row * CELL_HEIGHT + CELL_HEIGHT, 
        timestamp: date ? new Date(year, month, date) : null,
        hasWeightRecord: date ? selectedMonthRecord.some(record => record.timestamp.getDate() === date) : false,
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
                x={index * CELL_WIDTH + CELL_WIDTH / 2 + MARGIN}
                y={CELL_HEIGHT / 2}
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
                width={CELL_WIDTH}
                height={CELL_HEIGHT}
                fill="white"
                stroke="#F0F0F0"
                strokeWidth={1}
                onPress={() => { 
                  if (cell.timestamp) {
                    setSelectedDay(cell.timestamp); 
                    onDataPointSelect({ day: cell.timestamp }); 
                  }
                }}
              />
              {cell.timestamp?.getTime() === selectedDay.getTime() && (
                <Circle
                  cx={cell.x + CELL_WIDTH / 2}
                  cy={cell.y + CELL_HEIGHT / 2}
                  r={12}
                  fill="#7B5CB8"
                />
              )}
              <SvgText
                x={cell.x + CELL_WIDTH / 2}
                y={cell.y + CELL_HEIGHT / 2}
                textAnchor="middle"
                alignmentBaseline="central"
                fill={cell.timestamp?.getTime() === selectedDay.getTime() ? 'white' : '#333'}
                fontWeight={cell.timestamp?.getTime() === selectedDay.getTime() ? 'bold' : 'normal'}
              >
                {cell.timestamp?.getDate()}
              </SvgText>
              {cell.hasWeightRecord && cell.timestamp?.getTime() != selectedDay.getTime() && (
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name="checkmark-sharp"
                    size={12}
                    color="#4f3582"
                    style={{
                      position: 'absolute',
                      top: cell.y + CELL_HEIGHT - 16,
                      left: cell.x + (CELL_WIDTH / 2) - 6,
                    }}
                  />
                </View> 
              )}
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
  iconWrapper: {
    position: 'absolute',
  },
});

export default Calendar;