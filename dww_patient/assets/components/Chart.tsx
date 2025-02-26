import React, { useState, useEffect } from 'react';
import { View, LayoutChangeEvent, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Svg, { Text as SvgText, Line, Path, Circle, G } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons'; 

type ChartProps = {
  weightRecord: Array<{ //weight data to draw chart
    timestamp: Date;
    weight: number;
  }>;
  onDataPointSelect: (selectedData: { //function to interact with selected days in screen
    day: Date;
  }) => void;
};

type WeightRecord = {
  timestamp: Date,
  weight: number,
}

const Chart = ({ weightRecord, onDataPointSelect }: ChartProps) => { 
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedMonthRecord, setSelectedMonthRecord] = useState<WeightRecord[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const MARGIN = 48;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const handleNextMonth = () => {
    let nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1); // cant do this in one-liner because .setMonth returns milliseconds and not a Date object (WHYYY)
    setSelectedMonth(nextMonth); //we need to do setSelectedMonth to change state and re-render component, but we cant do one-liner because of the above.
  }

  const handlePrevMonth = () => {
    let nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() - 1); // x2
    setSelectedMonth(nextMonth); //cant do setState( new Date(date.setMonth + 1) ) because it recalculates it a second time in UTC and add/removes excess hours. This would cause issues if the timestamp is near midnight.
  }

  //calc x coord for where a day should be.
  // `day / days in month` for an 'index scale', like 1/31. Then multiply by chart width - 2margin to get where it should be in the graph. Margins included to give space for axis label
  const xScale = (day: Date) => {
    return ((day.getDate()) / (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate())) * (dimensions.width - MARGIN * 2) + MARGIN;
  };

  //calc y coord for where height shoud be scaled to. Similar theory to xScale.
  const yScale = (weight: number) => {
    return dimensions.height - MARGIN - ((weight - minWeight) / (maxWeight - minWeight)) * (dimensions.height - MARGIN * 2);
  };

  //generate 7 grid lines, range / 6 represents the spaces inbetween (grid lines - 1)
  const generateYAxisGrid = () => {
    const range = maxWeight - minWeight;
    return Array.from({ length: 7 }, (_, i) => minWeight + i * (range / 6));
  };
  
  const generateXAxisGrid = (month: Date) => {
    return Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);
  };

  //selectedMonthRecord = filtered weight record for selectedMonth.
  useEffect(() => {
    const filteredData = weightRecord.filter((point) => {
      return (
        point.timestamp.getFullYear() === selectedMonth.getFullYear() &&
        point.timestamp.getMonth() === selectedMonth.getMonth()
      );
    });
    setSelectedMonthRecord(filteredData);
  }, [selectedMonth, weightRecord]);

  //some calculations used for yScale and yGrid
  //basically it pads the y-dimension by a constant value of +-5lbs alongside the range of the patient's weight record, scaling the y-axis in case the patient sees a dramatic weight change
  //theoretically this makes it so the graph doesn't look exceedingly goofy if the range of the patient's weight change is like >=10 lbs in one month. the line always takes the inner 1/3 of graph space
  const range = Math.max(...selectedMonthRecord.map(d => d.weight)) - Math.min(...selectedMonthRecord.map(d => d.weight));
  const padding = range + 5;
  const minWeight = Math.min(...selectedMonthRecord.map(d => d.weight)) - padding;
  const maxWeight = Math.max(...selectedMonthRecord.map(d => d.weight)) + padding;

  //draw path, 'M' to move to first point location, then 'L' to move while drawing the line onwards.
  //TODO: special behavior for missing days while drawing?
  let path = '';
  selectedMonthRecord.forEach((point, index) => {
    if (index === 0) {
      path += `M ${xScale(point.timestamp)} ${yScale(point.weight)} `;
    } else {
      path += `L ${xScale(point.timestamp)} ${yScale(point.weight)} `;
    }
  });

  // draw axes (line x2), gridlines, line (path), then interactable points (circles)
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

          <Line
            x1={MARGIN}
            y1={dimensions.height - MARGIN}
            x2={dimensions.width - MARGIN}
            y2={dimensions.height - MARGIN}
            stroke="black"
            strokeWidth="1"
          />
          <Line
            x1={MARGIN}
            y1={MARGIN}
            x2={MARGIN}
            y2={dimensions.height - MARGIN}
            stroke="black"
            strokeWidth="1"
          />

          {generateYAxisGrid().map((gridValue) => {
            const y = yScale(gridValue);
            if (isNaN(gridValue)) return null;
            return (
              <G key={`y-${gridValue}`}>
                <Line
                  x1={MARGIN}
                  y1={y}
                  x2={dimensions.width - MARGIN}
                  y2={y}
                  stroke="#E0E0E0"
                  strokeWidth="0.5"
                  opacity={0.5}
                />
                <SvgText
                  x={MARGIN - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#666"
                  fontSize="10"
                >
                  {Math.round(gridValue)}
                </SvgText>
              </G>
            );
          })}

          {generateXAxisGrid(selectedMonth).map((day) => {
            if (day % 5 === 0) {
              const tempDate = new Date(selectedMonth);
              tempDate.setDate(day);
              const x = xScale(tempDate);
              return (
                <G key={`x-${day}`}>
                  <Line
                    x1={x}
                    y1={MARGIN}
                    x2={x}
                    y2={dimensions.height - MARGIN}
                    stroke="#E0E0E0"
                    strokeWidth="0.5"
                    opacity={0.5}
                  />
                  <SvgText
                    x={x}
                    y={dimensions.height - MARGIN + 15}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="10"
                  >
                    {`${selectedMonth.getMonth() + 1}/${day}`}
                  </SvgText>
                </G>
              );
            }
            return null; 
          })}


          <Path
            d={path}
            stroke="#7B5CB8"
            strokeWidth="2"
            fill="none"
          />

          {selectedMonthRecord.map((point, index) => {
            const x = xScale(point.timestamp);
            const y = yScale(point.weight);
            const isSelected = selectedDay && selectedDay.getTime() === point.timestamp.getTime();
            return (
              <G key={index}>
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "8" : "6"}
                  fill={isSelected ? "#4f3582" : "#7B5CB8"}
                  onPress={() => { setSelectedDay(point.timestamp); onDataPointSelect({ day: point.timestamp }); }}
                />
              </G>
            );
          })}


        </Svg>
      </View>
    </View>
  )
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

export default Chart;