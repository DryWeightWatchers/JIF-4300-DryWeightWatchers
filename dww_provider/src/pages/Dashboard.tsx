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
          headers: {
            'Content-Type': 'application/json',
          },
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
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Latest Weight</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} onClick={() => navigate(`/patients/${patient.id}`)}>
                <td>{patient.id}</td>
                <td>{`${patient.first_name} ${patient.last_name}`}</td>
                <td>{patient.email}</td>
                <td>
                  {patient.latest_weight !== null
                    ? `${patient.latest_weight} kg`
                    : 'N/A'}
                </td>
                <td>
                  {patient.latest_weight_timestamp
                    ? new Date(patient.latest_weight_timestamp).toLocaleString()
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard; 