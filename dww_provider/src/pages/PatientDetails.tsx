import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { PatientNote, Patient } from '../utils/types';

import styles from "../styles/PatientDetails.module.css";

import PatientInfoSection from '../components/PatientInfoSection';
import PatientNotesSection from '../components/PatientNotesSection';
import ChartCalendarViz from '../components/ChartCalendarViz';
import JSZip from "jszip";
import { saveAs } from "file-saver";

const PatientDetails: React.FC = () => {

  const navigate = useNavigate();
  const { getCSRFToken } = useAuth();
  const [csrfToken, setCsrfToken] = useState<string>('');
  const { id } = useParams<{ id: string }>();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(false);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState<string>('');


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
        body: JSON.stringify({ id: id })
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


  const handleAddOrUpdateNote = async (noteId: string | null, noteText: string, day: Date) => {
    try {
      const response = await fetch(
        `${process.env.VITE_PUBLIC_DEV_SERVER_URL}/add-patient-note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          note_id: noteId,
          patient: id,
          timestamp: day,
          note: noteText,
        }),
      }
      );

      if (!response.ok) {
        console.error("Failed to add/update note");
        return;
      }

      setNewNoteText('');
      setEditingNoteId(null);
      setRefresh(!refresh);

    } catch (error) {
      console.error("Error in handleAddOrUpdateNote:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(
        `${process.env.VITE_PUBLIC_DEV_SERVER_URL}/delete-patient-note`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify({ note_id: noteId }),
        }
      );
      if (!response.ok) {
        console.error("Failed to delete note:", await response.text());
        return;
      }

      setRefresh(!refresh);
    } catch (error) {
      console.error("Error in handleDeleteNote:", error);
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

        if (!res.ok) { throw new Error(`HTTP error: ${res.status}`); }
        const data = await res.json();

        // Convert timestamps to Date objects
        data.notes = data.notes.map((note: PatientNote) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        }));
        data.weight_history = data.weight_history.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
        }));
        data.patient_info.last_updated = new Date(data.patient_info.last_updated);

        setPatient(data);
        console.log('patient data: ', data); 
      } catch (err: any) {
        setError(err.message);
      } finally { setLoading(false); }
    };

    getPatientData();
  }, [id, refresh]);

  const handleExportCSV = async () => {
    if (!patient) return;
  
    const zip = new JSZip();
  
    let patientInfoCSV = "First Name,Last Name,Email,Date of Birth,Sex,Height (cm),Medications,Other Information,Latest Weight,Weight Last Updated,Weight Alarm Threshold\n";
    const { date_of_birth, sex, height, medications, other_info, alarm_threshold } = patient.patient_info!;
    patientInfoCSV += `${patient.first_name},${patient.last_name},${patient.email},${date_of_birth},${sex},${height},${medications},${other_info},${patient.latest_weight},${new Date(patient!.latest_weight_timestamp!).toISOString()},${alarm_threshold}\n`;
  
    zip.file("patient_info.csv", patientInfoCSV);
  
    let notesCSV = "Timestamp,Note\n";
    patient.notes?.forEach((note: PatientNote) => {
      const timestamp = new Date(note.timestamp).toISOString();
      const sanitizedNote = note.note.replace(/"/g, '""');
      notesCSV += `${timestamp},"${sanitizedNote}"\n`;
    });
  
    zip.file("notes.csv", notesCSV);
  
    let weightCSV = "Timestamp,Weight\n";
    patient.weight_history?.forEach((record: any) => {
      weightCSV += `${new Date(record.timestamp).toISOString()},${record.weight}\n`;
    });
  
    zip.file("weight_history.csv", weightCSV);
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `patient_${id}_data.zip`);
  };




  if (loading) { return <div className={styles.loading}>Loading patient data…</div>; }
  if (error) { return <div className={styles.error}>Error: {error}</div>; }

  const weightHistory = patient!.weight_history || [];

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{patient!.first_name} {patient!.last_name}</h1>
      <PatientInfoSection
        patientInfo={patient!.patient_info}
        csrfToken={csrfToken}
        email={patient!.email}
        latestWeight={patient!.latest_weight!}
        weightLastUpdated={patient!.latest_weight_timestamp!}
      />
      <ChartCalendarViz
        weightHistory={weightHistory}
        onDataPointSelect={handleDataPointSelect}
      />
      {selectedDay && (
        <PatientNotesSection
          selectedDay={selectedDay}
          weightHistory={patient?.weight_history}
          notes={patient?.notes}
          newNoteText={newNoteText}
          setNewNoteText={setNewNoteText}
          editingNoteId={editingNoteId}
          setEditingNoteId={setEditingNoteId}
          onAddOrUpdateNote={handleAddOrUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      )}
      <div className={styles.button_container}>
        <button className={styles.remove_patient_btn} onClick={handleRemovePatientRelationship}>
          Patient No Longer Under My Care
        </button>
        <button className={styles.export_patient_btn} onClick={handleExportCSV}>
          Export Data
        </button>
      </div>

    </div>
  );
};

export default PatientDetails;