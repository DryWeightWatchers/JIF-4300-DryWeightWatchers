import React, { useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Svg, { Text, Line, Path, Circle, G } from 'react-native-svg';

type CalendarProps = {
  date: Date
  data: Array<{
    day: Date;
    weight: number;
  }>;
  onDataPointSelect: (selectedData: {
    day: Date;
    weight: number;
  }) => void;
};

const Chart = ({ date }: CalendarProps) => { //add data as param later
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const MARGIN = 24;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const data = [
    { day: new Date(2024, 2, 1), weight: 68 },
    { day: new Date(2024, 2, 5), weight: 67 },
    { day: new Date(2024, 2, 10), weight: 66 },
    { day: new Date(2024, 2, 15), weight: 65 },
    { day: new Date(2024, 2, 20), weight: 64 },
    { day: new Date(2024, 2, 28), weight: 63 },
  ];

  //calc x coord for where a day should be.
  // `day / days in month` for an 'index scale', like 1/31. Then multiply by chart width - 2margin to get where it should be in the graph. Margins included to give space for axis label
  const xScale = (day: Date) => {
    return ((day.getDate()) / (new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())) * (dimensions.width - MARGIN * 2) + MARGIN;
  };

  //calc y coord for where height shoud be scaled to. Similar theory to xScale. +-20 height margin is arbitrary.
  const yScale = (weight: number) => {
    const minWeight = Math.min(...data.map(d => d.weight)) - 20;
    const maxWeight = Math.max(...data.map(d => d.weight)) + 20;
    return dimensions.height - MARGIN - ((weight - minWeight) / (maxWeight - minWeight)) * (dimensions.height - MARGIN * 2);
  };

  let path = '';
  data.forEach((point, index) => {
    if (index === 0) {
      path += `M ${xScale(point.day)} ${yScale(point.weight)} `;
    } else {
      path += `L ${xScale(point.day)} ${yScale(point.weight)} `;
    }
  });

  // draw axes, line (path), then interactable points (circles)
  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <Svg width={dimensions.width} height={dimensions.height} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} preserveAspectRatio="xMinYMin meet">

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

        <Path
          d={path}
          stroke="#7B5CB8"
          strokeWidth="2"
          fill="none"
        />

        {data.map((point, index) => {
          const x = xScale(point.day);
          const y = yScale(point.weight);
          return (
            <G key={index}>
              <Circle
                cx={x}
                cy={y}
                r="6"
                fill="#7B5CB8"
                onPress={() => console.log('Selected:', point)} 
              />
              <Text
                x={x}
                y={y - 15}
                textAnchor="middle"
                fill="#7B5CB8"
                fontSize="12"
              >
                {point.weight}lbs
              </Text>
            </G>
          );
        })}

      </Svg>
    </View>
  )
};

export default Chart;