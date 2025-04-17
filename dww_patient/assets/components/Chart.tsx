import React, { useCallback, useState, useEffect } from 'react';
import { View, LayoutChangeEvent, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Text as SvgText, Line, Path, Circle, G } from 'react-native-svg';
import { useAuth } from '../../app/auth/AuthProvider';
import { authFetch } from '@/utils/authFetch';
import Ionicons from '@expo/vector-icons/Ionicons'; 

type ProfileData = {
  firstname: string,
  lastname: string,
  email: string,
  phone: string,
  password: string,
  is_verified: boolean,
  unit_preference: string,
}

type ChartProps = {
  weightRecord: Array<{
    timestamp: Date;
    weight: number;
  }>;
  onDataPointSelect: (day: Date) => void;
  unit_preference: 'metric' | 'imperial';
};

type WeightRecord = {
  timestamp: Date,
  weight: number,
}

const Chart = ({ weightRecord, onDataPointSelect, unit_preference }: ChartProps) => { 
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedMonthRecord, setSelectedMonthRecord] = useState<WeightRecord[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userPreference, setUserPreference] = useState<string | null>(null);
  const MARGIN = 16 + 32;

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
      console.log("data is ", data)
      console.log(data["unit_preference"])
      setUserData(data);
      setUserPreference(data.unit_preference);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [accessToken])
  );

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

  //point placement
  const xScale = (day: Date) => {
    return ((day.getDate()) / (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate())) * (dimensions.width - MARGIN * 2) + MARGIN;
  };

  const yScale = (weight: number) => {
    return dimensions.height - MARGIN - ((weight - minWeight) / (maxWeight - minWeight)) * (dimensions.height - MARGIN * 2);
  };

  //gridline placement
  const generateYAxisGrid = () => {
    const range = maxWeight - minWeight;
    return Array.from({ length: 7 }, (_, i) => minWeight + i * (range / 6));
  };
  
  const generateXAxisGrid = (month: Date) => {
    return Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);
  };

  const convertToKilograms = (weightInPounds: number) => {
    return weightInPounds / 2.20462;
  };

  useEffect(() => {
    let monthlyData = weightRecord.filter((point) => {
      return (
        point.timestamp.getFullYear() === selectedMonth.getFullYear() &&
        point.timestamp.getMonth() === selectedMonth.getMonth()
      );
    });
    const aggregatedData = monthlyData.reduce((acc: { [key: string]: { timestamp: Date, weight: number, count: number } }, point) => {
      const dateKey = point.timestamp.toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = { ...point, weight: 0, count: 0 };
      }
      acc[dateKey].weight += Number(point.weight);
      acc[dateKey].count += 1;
      return acc;
    }, {});
  
    const result = Object.keys(aggregatedData).map((dateKey) => {
      const { timestamp, weight, count } = aggregatedData[dateKey];
      return {
        timestamp,
        weight: userPreference === 'metric' ? convertToKilograms(weight) / count : weight / count, 
        // weight: weight / count,
      };
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
    setSelectedMonthRecord(result);
  }, [selectedMonth, weightRecord]);

  const range = Math.max(...selectedMonthRecord.map(d => d.weight)) - Math.min(...selectedMonthRecord.map(d => d.weight));
  const padding = range + 5;
  const minWeight = Math.min(...selectedMonthRecord.map(d => d.weight)) - padding;
  const maxWeight = Math.max(...selectedMonthRecord.map(d => d.weight)) + padding;

  //TODO: special behavior for missing days while drawing?
  let path = '';
  selectedMonthRecord.forEach((point, index) => {
    if (index === 0) {
      path += `M ${xScale(point.timestamp)} ${yScale(point.weight)} `;
    } else {
      path += `L ${xScale(point.timestamp)} ${yScale(point.weight)} `;
    }
  });

  //draw axes (line x2), gridlines (generated lines and text), line (path), then interactable points (circles)
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
                  onPress={() => { setSelectedDay(point.timestamp); onDataPointSelect(point.timestamp); }}
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