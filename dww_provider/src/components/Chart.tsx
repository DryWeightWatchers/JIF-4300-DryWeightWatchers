import { useState, useEffect, useRef } from 'react';

type ChartProps = {
  weightRecord: Array<{
    timestamp: Date;
    weight: number;
  }>;
  onDataPointSelect: (day: Date) => void;
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const MARGIN = 48;

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

  // Point placement
  const xScale = (day: Date) => {
    return ((day.getDate()) / (new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate())) * (dimensions.width - MARGIN * 2) + MARGIN;
  };

  const yScale = (weight: number) => {
    return dimensions.height - MARGIN - ((weight - minWeight) / (maxWeight - minWeight)) * (dimensions.height - MARGIN * 2);
  };

  // Gridline placement
  const generateYAxisGrid = () => {
    const range = maxWeight - minWeight;
    return Array.from({ length: 7 }, (_, i) => minWeight + i * (range / 6));
  };
  
  const generateXAxisGrid = (month: Date) => {
    return Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);
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
        weight: weight / count,
      };
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
    setSelectedMonthRecord(result);
  }, [selectedMonth, weightRecord]);

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const { width, height } = chartContainerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
  
    updateDimensions();
  
    window.addEventListener('resize', updateDimensions);
  
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const range = Math.max(...selectedMonthRecord.map(d => d.weight)) - Math.min(...selectedMonthRecord.map(d => d.weight));
  const padding = range + 5;
  const minWeight = Math.min(...selectedMonthRecord.map(d => d.weight)) - padding;
  const maxWeight = Math.max(...selectedMonthRecord.map(d => d.weight)) + padding;

  let path = '';
  selectedMonthRecord.forEach((point, index) => {
    if (index === 0) {
      path += `M ${xScale(point.timestamp)} ${yScale(point.weight)} `;
    } else {
      path += `L ${xScale(point.timestamp)} ${yScale(point.weight)} `;
    }
  });

  return (
    <div style={{ flex: 1 }}>

      <div style={styles.monthHeader}>
        <button onClick={handlePrevMonth} style={{ backgroundColor: '#7B5CB8' }}>
            &#9664;
        </button>
        
        <text style={{...styles.monthText, userSelect: 'none', pointerEvents: 'none'}}>
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </text>
        
        <button onClick={handleNextMonth} style={{ backgroundColor: '#7B5CB8' }}>
            &#9654;
        </button>
      </div>

      <div style={styles.chartContainer} ref={chartContainerRef}>
        <svg width="100%" height="100%">

          <line
            x1={MARGIN}
            y1={dimensions.height - MARGIN}
            x2={dimensions.width - MARGIN}
            y2={dimensions.height - MARGIN}
            stroke="black"
            strokeWidth="1"
          />
          <line
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
              <g key={`y-${gridValue}`}>
                <line
                  x1={MARGIN}
                  y1={y}
                  x2={dimensions.width - MARGIN}
                  y2={y}
                  stroke="#E0E0E0"
                  strokeWidth="0.5"
                  opacity={0.5}
                />
                <text
                  x={MARGIN - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#666"
                  fontSize="10"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {Math.round(gridValue)}
                </text>
              </g>
            );
          })}

          {generateXAxisGrid(selectedMonth).map((day) => {
            if (day % 5 === 0) {
              const tempDate = new Date(selectedMonth);
              tempDate.setDate(day);
              const x = xScale(tempDate);
              return (
                <g key={`x-${day}`}>
                  <line
                    x1={x}
                    y1={MARGIN}
                    x2={x}
                    y2={dimensions.height - MARGIN}
                    stroke="#E0E0E0"
                    strokeWidth="0.5"
                    opacity={0.5}
                  />
                  <text
                    x={x}
                    y={dimensions.height - MARGIN + 15}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="10"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {`${selectedMonth.getMonth() + 1}/${day}`}
                  </text>
                </g>
              );
            }
            return null; 
          })}


          <path
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
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "8" : "6"}
                  fill={isSelected ? "#4f3582" : "#7B5CB8"}
                  onClick={() => { setSelectedDay(point.timestamp); onDataPointSelect(point.timestamp); }}
                />
              </g>
            );
          })}


        </svg>
      </div>
    </div>
  )
};

const styles = {
  monthHeader: {
    display: 'flex',
    FlexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px',
  },
  monthText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#4f3582',
  },
  chartContainer: {
    borderColor: '#7B5CB8',
    borderWidth: '1px',
    flex: 1,
    height: '400px'
  },
};

export default Chart;