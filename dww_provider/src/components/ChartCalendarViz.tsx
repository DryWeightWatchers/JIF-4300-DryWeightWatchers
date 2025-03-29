
import { useState } from 'react';
import Chart from './Chart';
import Calendar from './Calendar';
import styles from '../styles/ChartCalendarViz.module.css';
import { ChartCalendarVizProps } from '../utils/types'; 



const ChartCalendarViz: React.FC<ChartCalendarVizProps> = ({ weightHistory, onDataPointSelect }) => {
  const [chartView, setChartView] = useState<'chart' | 'calendar'>('chart');

  const formattedRecords = weightHistory.map(r => ({
    timestamp: new Date(r.timestamp),
    weight: r.weight,
  }));

  return (
    <div className={styles.viz_container}>
      <h2 className={styles.weight_history_title}>Weight History</h2>
      <div className={styles.chart_button_container}>
        <button
          className={styles.chart_left_button}
          style={{
            backgroundColor: chartView === 'chart' ? '#7B5CB8' : 'white',
            color: chartView === 'chart' ? 'white' : 'gray'
          }}
          onClick={() => setChartView('chart')}
        >
          Chart
        </button>
        <button
          className={styles.chart_right_button}
          style={{
            backgroundColor: chartView === 'calendar' ? '#7B5CB8' : 'white',
            color: chartView === 'calendar' ? 'white' : 'gray'
          }}
          onClick={() => setChartView('calendar')}
        >
          Calendar
        </button>
      </div>
      {formattedRecords.length > 0 ? (
        <div className={styles.chart_container}>
          {chartView === 'chart' ? (
            <Chart weightRecord={formattedRecords} onDataPointSelect={onDataPointSelect} />
          ) : (
            <Calendar weightRecord={formattedRecords} onDataPointSelect={onDataPointSelect} />
          )}
        </div>
      ) : (
        <p>No weight history available.</p>
      )}
    </div>
  );
};

export default ChartCalendarViz;
