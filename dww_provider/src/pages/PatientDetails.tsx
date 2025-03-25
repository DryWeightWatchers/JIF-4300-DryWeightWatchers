import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { PatientNote, Patient } from '../utils/types'; 

import styles from "../styles/PatientDetails.module.css";

import PatientInfoSection from '../components/PatientInfoSection';
import PatientNotesSection from '../components/PatientNotesSection';
import ChartCalendarViz from '../components/ChartCalendarViz';



const PatientDetails: React.FC = () => {

  const navigate = useNavigate(); 
  const { getCSRFToken } = useAuth();
  const [csrfToken, setCsrfToken] = useState<string>(''); 
  const { id } = useParams<{ id: string }>();

  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [addNoteText, setAddNoteText] = useState<string>(''); 
  const [refresh, setRefresh] = useState<boolean>(false); 


  const handleRemovePatientRelationship = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this patient from your account?"
    );
    if (!confirmDelete) return;
    try {
      const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/delete-relationship/`, {
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

  const handleDataPointSelect = (day: Date) => {
    if (!patient) return;
    setSelectedDay(day)
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) { return; } 
    event.preventDefault();  // don't type a newline 
    try {
      const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/add-patient-note`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken, 
        }, 
        credentials: "include", 
        body: JSON.stringify({
          patient: id, 
          note_type: "generic", 
          timestamp: selectedDay, 
          note: addNoteText
        }),
      });

      if (response.ok) {
        console.log("New note added");
        setAddNoteText(""); 
        setRefresh(!refresh); 
      } else {
        console.error("Failed to add note");
      }
    } catch (error) {
      console.error("Error:", error);
    }

  };

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getCSRFToken();
      setCsrfToken(token);
    };
    fetchToken();
  }, [getCSRFToken]);

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

        // convert timestamps to Date objects
        if (data.notes) {
          data.notes = data.notes.map((note: PatientNote) => ({
            ...note,
            timestamp: new Date(note.timestamp),
          }));
        }
        if (data.weight_history) {
          data.weight_history = data.weight_history.map((record: any) => ({
            ...record,
            timestamp: new Date(record.timestamp),
          }));
        }
        if (data.patient_info?.last_updated) {
          data.patient_info.last_updated = new Date(data.patient_info.last_updated);
        }

        setPatient(data);
        console.log('patient data: ', data);           //         ----------------- temp 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getPatientData();
  }, [id, refresh]);


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

      <PatientInfoSection 
        patientInfo={patient!.patient_info} 
        csrfToken={csrfToken}
        email={patient!.email} 
      />

      <div className={styles.details_container}>
        <div className={styles.patient_info}>
          <p><span className={styles.label}>Email:</span> {patient!.email}</p>
          <p><span className={styles.label}>Latest Weight:</span> {patient!.latest_weight ? `${patient!.latest_weight} lbs` : "N/A"}</p>
          <p><span className={styles.label}>Last Weight Update:</span> {patient!.latest_weight_timestamp ? new Date(patient!.latest_weight_timestamp).toLocaleString() : "N/A"}</p>
        </div>

        <ChartCalendarViz 
          weightHistory={weightHistory} 
          onDataPointSelect={handleDataPointSelect} 
        />

        {selectedDay && (
          <PatientNotesSection
            selectedDay={selectedDay}
            weightHistory={patient?.weight_history}
            notes={patient?.notes}
            addNoteText={addNoteText}
            setAddNoteText={setAddNoteText}
            handleKeyDown={handleKeyDown}
          />
        )}

        <div className={styles.button_container}>
          <button className={styles.remove_patient_btn} onClick={handleRemovePatientRelationship}>Remove Patient</button>
        </div>

      </div>
    </div>
  );
};

export default PatientDetails;