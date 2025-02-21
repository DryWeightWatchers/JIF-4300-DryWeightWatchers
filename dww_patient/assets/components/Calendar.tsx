import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Rect, Text, G } from 'react-native-svg';

const Calendar = () => {
  const { width } = Dimensions.get('window');
  const CELL_SIZE = width / 7;
  const PADDING = 12;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

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
    <View style={{ flex: 1, padding: PADDING }}>
      <Svg width={width - 2 * PADDING} height={CELL_SIZE * 7} viewBox={`0 0 ${width} ${CELL_SIZE * 7}`} preserveAspectRatio="xMinYMin meet">
        <G>
          {DAYS.map((day, index) => (
            <Text
              key={day}
              x={index * CELL_SIZE + CELL_SIZE / 2}
              y={CELL_SIZE / 2}
              textAnchor="middle"
              alignmentBaseline="central"
              fill="#7B5CB8"
              fontSize={14}
            >
              {day}
            </Text>
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
            <Text
              x={cell.x + CELL_SIZE / 2}
              y={cell.y + CELL_SIZE / 2}
              textAnchor="middle"
              alignmentBaseline="central"
              fill={cell.date === today.getDate() ? '#7B5CB8' : '#333'}
              fontWeight={cell.date === today.getDate() ? 'bold' : 'normal'}
            >
              {cell.date}
            </Text>
          </G>
        ))}
      </Svg>
    </View>
  );
};

export default Calendar;