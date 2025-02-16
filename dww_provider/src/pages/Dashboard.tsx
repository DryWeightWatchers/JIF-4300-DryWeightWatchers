import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  latest_weight: number | null;
  latest_weight_timestamp: string | null;
};

const Dashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
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

  if (loading) {
    return <div>Loading patient data…</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Patient Dashboard</h1>
      <div className={styles.cardContainer}>
        {patients.map((patient) => {
          let weightClass = styles.neutralWeight;
          if (patient.latest_weight !== null) {
            if (patient.latest_weight < 50) {
              weightClass = styles.lowWeight;
            } else if (patient.latest_weight > 150) {
              weightClass = styles.atRiskWeight;
            } else {
              weightClass = styles.greatWeight;
            }
          }

          return (
            <div
              key={patient.id}
              className={`${styles.patientCard} ${weightClass}`}
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <div className={styles.patientInfo}>
                <h3>{`${patient.first_name} ${patient.last_name}`}</h3>
                <p>Contact: {patient.email}</p>
              </div>
              <div className={styles.weightInfo}>
                <span className={styles.weightLabel}>LATEST WEIGHT</span>
                <span className={styles.weightValue}>
                  {patient.latest_weight !== null ? `${patient.latest_weight} lbs` : 'N/A'}
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
