
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css'; 
import { DashboardPatient } from '../utils/types'; 
import { avgDailyWeightChange } from '../utils/helpers';


const Dashboard: React.FC = () => {
  const DEFAULT_ALARM_THRESHOLD = 2.0; 
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/dashboard`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) {
          setError(`HTTP error: ${res.status}`);
        }
        const data = await res.json();
        setPatients(data.patients);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    console.log('Patients: ', patients); 
  }, [patients]); 


  const getPatientCardData = (patient: DashboardPatient) => {
    const latestRecord =
    patient.latest_weight !== null && patient.latest_weight_timestamp !== null
      ? {
          weight: patient.latest_weight,
          timestamp: new Date(patient.latest_weight_timestamp),
        }
      : null;
    const prevRecord = patient.prev_weight !== null && patient.prev_weight_timestamp !== null
      ? {
          weight: patient.prev_weight,
          timestamp: new Date(patient.prev_weight_timestamp),
        }
      : null;

    const latestWeight = patient.latest_weight ?? null; 
    const dailyChange = avgDailyWeightChange(latestRecord, prevRecord); 
    const threshold = patient.alarm_threshold ?? DEFAULT_ALARM_THRESHOLD; 
    return { latestWeight, dailyChange, threshold }; 
  }


  if (loading) { return <div>Loading patient data…</div>; }
  if (error) { return <div>Error: {error}</div>; }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Patient Dashboard</h1>
      <div className={styles.cardContainer}>
        {patients.map((patient) => {

          const { latestWeight, dailyChange, threshold } = getPatientCardData(patient);
          let cardStyle; 
          if (dailyChange === null) { cardStyle = `${styles.noDailyChange}`; } 
          else { 
            cardStyle = (dailyChange > threshold) 
            ? `${styles.aboveThreshold}` 
            : `${styles.belowThreshold}`; 
          }
          let weightDisplay; 

          if (latestWeight === null) { 
            weightDisplay = 'No measurements yet.'
          } else if (dailyChange === null) { 
            weightDisplay = (
              <>
                {latestWeight} lbs &nbsp;
                <div className={styles.dailyChange}>(recent change unknown)</div>
              </>
            );
          } else {
            const sign = dailyChange > 0 ? '+' : ''; 
            weightDisplay = (
              <>
                {latestWeight}&nbsp;
                <span className={styles.dailyChange}>
                  ({sign}{dailyChange.toFixed(2)})
                </span>&nbsp;
                lbs
              </>
            );
          }

          return (
            <div
              key={patient.id}
              className={`${styles.patientCard} ${cardStyle}`}
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <div className={styles.patientInfo}>
                <h3>{`${patient.first_name} ${patient.last_name}`}</h3>
                <p>Contact: {patient.email}</p>
              </div>
              <div className={styles.weightInfo}>
                <span className={styles.weightLabel}>LATEST WEIGHT</span>
                <span className={styles.weightValue}>
                  {weightDisplay}
                </span>
              </div>
              <p className={styles.timestamp}>
                {patient.latest_weight_timestamp
                  ? new Date(patient.latest_weight_timestamp).toLocaleString()
                  : 'No data'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
