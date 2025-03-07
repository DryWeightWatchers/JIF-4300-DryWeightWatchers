import { useState, useEffect, useRef } from 'react';

type CalendarProps = {
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

const Calendar = ({ weightRecord, onDataPointSelect }: CalendarProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedMonthRecord, setSelectedMonthRecord] = useState<WeightRecord[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const MARGIN = 16;
  const CELL_WIDTH = (dimensions.width - MARGIN * 2) / 7;
  const CELL_HEIGHT = (dimensions.height - MARGIN * 2) / 7;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
        <svg width={dimensions.width} height={dimensions.height}>
          <g>
            {DAYS.map((day, index) => (
              <text
                key={day}
                x={index * CELL_WIDTH + CELL_WIDTH / 2 + MARGIN}
                y={CELL_HEIGHT / 2}
                textAnchor="middle"
                alignmentBaseline="central"
                fill="#7B5CB8"
                fontSize={14}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {day}
              </text>
            ))}
          </g>
          {grid.map((cell, index) => (
            <g key={index}>
              <rect
                x={cell.x}
                y={cell.y}
                width={CELL_WIDTH}
                height={CELL_HEIGHT}
                fill="white"
                stroke="#F0F0F0"
                strokeWidth={1}
                onClick={() => { 
                  if (cell.timestamp) {
                    setSelectedDay(cell.timestamp); 
                    onDataPointSelect(cell.timestamp); 
                  }
                }}
              />
              {cell.timestamp?.getTime() === selectedDay.getTime() && (
                <circle
                  cx={cell.x + CELL_WIDTH / 2}
                  cy={cell.y + CELL_HEIGHT / 2}
                  r={12}
                  fill="#7B5CB8"
                />
              )}
              <text
                x={cell.x + CELL_WIDTH / 2}
                y={cell.y + CELL_HEIGHT / 2}
                textAnchor="middle"
                alignmentBaseline="central"
                fill={cell.timestamp?.getTime() === selectedDay.getTime() ? 'white' : '#333'}
                fontWeight={cell.timestamp?.getTime() === selectedDay.getTime() ? 'bold' : 'normal'}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {cell.timestamp?.getDate()}
              </text>
              {cell.hasWeightRecord && cell.timestamp?.getTime() != selectedDay.getTime() && (
                <text
                  x={cell.x + CELL_WIDTH / 2 - 6}
                  y={cell.y + (CELL_HEIGHT / 2) + 22}
                  fill="#7B5CB8"
                  fontSize={14}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                ✓
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
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

export default Calendar;