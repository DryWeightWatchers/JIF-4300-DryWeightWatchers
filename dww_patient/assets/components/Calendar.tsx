import React, { useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Svg, { Rect, Text, G } from 'react-native-svg';

const Calendar = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
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
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <Svg width={dimensions.width} height={dimensions.height} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} preserveAspectRatio="xMinYMin meet">
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