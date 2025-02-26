import { useState, useEffect, useRef } from 'react';

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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const MARGIN = 48;

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

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const { width, height } = chartContainerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
  
    updateDimensions();
  
    // Add event listener to update dimensions on window resize
    window.addEventListener('resize', updateDimensions);
  
    // Clean up event listener on component unmount
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
    <div style={{ flex: 1 }}>

      <div style={styles.monthHeader}>
        <button onClick={handlePrevMonth}>
            &#9664;
        </button>
        
        <text style={styles.monthText}>
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </text>
        
        <button onClick={handleNextMonth}>
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
                  onClick={() => { setSelectedDay(point.timestamp); onDataPointSelect({ day: point.timestamp }); }}
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