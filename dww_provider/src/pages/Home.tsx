import { useEffect, useState } from 'react';
import styles from "../styles/Home.module.css";
import { useNavigate } from 'react-router-dom';

type ProfileData = {
  firstname: string;
  lastname: string;
  shareable_id: string;
  email: string;
  phone: string;
};

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  latest_weight: number | null;
  latest_weight_timestamp: string | null;
};

const Home = () => {
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/profile/`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        } else {
          console.error('Failed to load user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch patients data
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/dashboard`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setPatients(data.patients);
        } else {
          console.error('Failed to load patients');
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className={styles.container}>
      {/* Welcome Section */}
      <div className={styles.welcome}>
        <div>
          <h2>Welcome back {userData?.firstname} {userData?.lastname}!</h2>
          <p>Email Address: {userData?.email}</p>
        </div>
        <span className={styles.editIcon} onClick={() => navigate(`/profile`)}>✎</span>
      </div>

      {/* Main Content */}
      <div className={styles.grid}>
        {/* Patients Above Threshold */}
        <div className={styles.patients}>
          <h3>⚠️ Patients Above Threshold</h3>
          {patients.length > 0 ? (
            patients.map((patient) => (
              <div key={patient.id} className={styles.patientCard} onClick={() => navigate(`/patients/${patient.id}`)}>
                <div className={styles.patientInfo}>
                  <p><strong>{patient.first_name} {patient.last_name}</strong></p>
                  <p>Contact: {patient.email}</p>
                </div>
                <div className={styles.patientWeight}>
                  {patient.latest_weight ? (
                    <p className={styles.alert}>Weight: {patient.latest_weight} lbs</p>
                  ) : (
                    <p className={styles.noData}>No data</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No patients above threshold.</p>
          )}
          <button className={styles.viewDashboard} onClick={() => navigate(`/dashboard`)}>View Patient Dashboard</button>
        </div>

        {/* Recent Notifications */}
        <div className={styles.notifications}>
          <h3>🔔 Recent Notifications</h3>
          <p>No new notifications</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
