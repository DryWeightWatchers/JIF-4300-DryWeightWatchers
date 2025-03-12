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

type Notification = {
  id: number;
  message: string;
  timestamp: string;
};

const Home = () => {
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/notifications`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
        } else {
          console.error('Failed to load notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <div>
          <h2>Welcome back {userData?.firstname} {userData?.lastname}!</h2>
          <p>{userData?.email}</p>
        </div>
        <span className={styles.editIcon} onClick={() => navigate(`/profile`)}>✎</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.patients}>
          <h3>⚠️ Patients Above Threshold</h3>
          <div className={styles.scrollablePatients}>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <div key={patient.id} className={styles.patientCard} onClick={() => navigate(`/patients/${patient.id}`)}>
                  <div className={styles.patientInfo}>
                    <p><strong>{patient.first_name} {patient.last_name}</strong></p>
                    <p>Contact: {patient.email}</p>
                  </div>
                  <div className={styles.patientWeight}>
                    {patient.latest_weight ? (
                      <p className={styles.alert}>Weight: {patient.latest_weight}</p>
                    ) : (
                      <p className={styles.noData}>No data</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No patients above threshold.</p>
            )}
          </div>
          <button className={styles.viewDashboard} onClick={() => navigate(`/dashboard`)}>View Patient Dashboard</button>
        </div>

        <div className={styles.notifications}>
          <h3>🔔 Unread Notifications</h3>
          <div className={styles.scrollableNotifications}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className={styles.notificationItem}>
                  <p>{notification.message}</p>
                  <span className={styles.notificationTime}>{new Date(notification.timestamp).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p>No new notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
