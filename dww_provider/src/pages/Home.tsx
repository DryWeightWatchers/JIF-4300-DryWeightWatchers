import { useEffect, useState } from 'react';
import styles from "../styles/Home.module.css";
import { useNavigate } from 'react-router-dom';
import { avgDailyWeightChange } from '../utils/helpers';
import { ToastContainer, toast } from 'react-toastify';

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
  prev_weight: number | null; 
  prev_weight_timestamp: string | null; 
  alarm_threshold: number | null; 
};

type Notification = {
  id: number;
  message: string;
  created_at: string;
  is_read: boolean;
};

const Home = () => {
  const DEFAULT_ALARM_THRESHOLD = 2.0; 
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
          toast('Oops! Something happened while loading your data. Please try again.');
        }
      } catch (error) {
        toast('Oops! Something happened while loading your data. Please try again.');
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
          toast("Oops! Something happened while loading your patients' information. Please try again.");
        }
      } catch (error) {
        toast("Oops! Something happened while loading your patients' information. Please try again.");
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/get-provider-notifications/`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
        } else {
          toast("Oops! Something happened while loading your notifications. Please try again.");
        }
      } catch (error) {
        toast("Oops! Something happened while loading your notifications. Please try again.");
      }
    };

    fetchNotifications();
  }, []);

  const getCSRFToken = async () => {
    const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/get-csrf-token/`, {
      credentials: 'include',
    });
    const data = await response.json();
    return data.csrfToken;
  };

  const isOverThreshold = (patient: Patient) => {
    const latestRecord = patient.latest_weight !== null && patient.latest_weight_timestamp !== null
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

    const dailyChange = avgDailyWeightChange(latestRecord, prevRecord); 
    const threshold = patient.alarm_threshold ?? DEFAULT_ALARM_THRESHOLD; 
    return (dailyChange !== null) ? (dailyChange > threshold) : false; 
  }

  const markNotificationAsRead = async (id: number) => {
    const csrfToken = await getCSRFToken();
    try {
      const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/mark-notification-as-read/${id}/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          "X-CSRFToken": csrfToken,
        }
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
      } else {
        toast("Oops! Something happened when marking your notification as read. Please try again.");
      }
    } catch (error) {
      toast("Oops! Something happened when marking your notification as read. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer/>
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
              patients.filter(isOverThreshold).map((patient: Patient) => (
                <div key={patient.id} className={styles.patientCard} onClick={() => navigate(`/patients/${patient.id}`)}>
                  <div className={styles.patientInfo}>
                    <p><strong>{patient.first_name} {patient.last_name}</strong> ({patient.email})</p>
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
          <h3>🔔 Notifications</h3>
          <div className={styles.scrollableNotifications}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className={styles.notificationItem}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {!notification.is_read && (
                      <span style={{
                        height: 10,
                        width: 10,
                        backgroundColor: '#7B5CB8',
                        borderRadius: '50%',
                        display: 'inline-block',
                        marginRight: 8
                      }}></span>
                    )}
                    <p style={{ margin: 0 }}>{notification.message}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles.notificationTime}>
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    {!notification.is_read && (
                      <button
                        className={styles.markAsReadBtn}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
