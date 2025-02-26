import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from "../styles/PatientDetails.module.css";
import Chart from '../components/Chart';

type WeightRecord = {
  weight: number;
  timestamp: string;
}

type PatientNote = {
  timestamp: Date,
  note: string,
}

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  latest_weight: number | null;
  latest_weight_timestamp: string | null;
  weight_history?: WeightRecord[];
  notes_history?: PatientNote[];
};

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<{
    day: Date;
    weight?: number;
    notes?: string;
  } | null>({ day: new Date() });
  const navigate = useNavigate(); 

  const getCSRFToken = async () => {
    const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/get-csrf-token/`, {
      credentials: 'include',
    });
    const data = await response.json();
    return data.csrfToken;
  };

  const handleRemovePatientRelationship = async () => {
    const csrfToken = await getCSRFToken();
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this patient from your account?"
    );
    if (!confirmDelete) return;
    try {
      const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/user/providers/delete/`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({id: id})
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error removing relationship: ${errorText}`);
      } 
      alert("The patient has been removed.");
      navigate('/dashboard'); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDataPointSelect = (selectedData: { day: Date }) => {
    if (!patient) return;
  
    const selectedWeightRecord = patient.weight_history?.find(record => 
      new Date(record.timestamp).toDateString() === selectedData.day.toDateString()
    );
    
    const selectedNotes = patient.notes_history?.filter(note =>
      new Date(note.timestamp).toDateString() === selectedData.day.toDateString()
    ).map(note => note.note).join('\n') || 'No notes for this day';
  
    setSelectedDay({
      day: selectedData.day,
      weight: selectedWeightRecord ? selectedWeightRecord.weight : undefined,
      notes: selectedNotes,
    });
  };
  

  useEffect(() => {
    const getPatientData = async () => {
      try {
        const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/get-patient-data/?id=${id}`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        setPatient(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getPatientData();
  }, [id]);


  if (loading) {
    return <div className={styles.loading}>Loading patient data…</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  const weightHistory = patient!.weight_history || [];

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{patient!.first_name} {patient!.last_name}</h1>

      <div className={styles.details_container}>
        <div className={styles.patient_info}>
          <p><span className={styles.label}>Email:</span> {patient!.email}</p>
          <p><span className={styles.label}>Latest Weight:</span> {patient!.latest_weight ? `${patient!.latest_weight} lbs` : "N/A"}</p>
          <p><span className={styles.label}>Last Weight Update:</span> {patient!.latest_weight_timestamp ? new Date(patient!.latest_weight_timestamp).toLocaleString() : "N/A"}</p>
        </div>

        <div className={styles.weight_history}>
          <h2 className={styles.weight_history_title}>Weight History</h2>
          {weightHistory.length > 0 ? (
            <div className={styles.chart_container}>
              <Chart 
                weightRecord={weightHistory.map(r => ({
                  timestamp: new Date(r.timestamp),
                  weight: r.weight
                }))}
                onDataPointSelect={handleDataPointSelect}
              />
            </div>
          ) : (
            <p>No weight history available.</p>
          )}
        </div>

        <div className={styles.patient_info}>
          <p><span className={styles.label}>Selected Day: </span> 
            {selectedDay!.day.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p><span className={styles.label}>Weight Recorded: </span> {selectedDay!.weight ? `${selectedDay!.weight} lbs` : "N/A"}</p>
          <p><span className={styles.label}>Notes: </span> {selectedDay!.notes ? selectedDay!.notes : "No notes for this day"}</p>
        </div>

        <div className={styles.button_container}>
          <button className={styles.remove_patient_btn} onClick={handleRemovePatientRelationship}>Remove Patient</button>
        </div>

      </div>
    </div>
  );
};

export default PatientDetails;