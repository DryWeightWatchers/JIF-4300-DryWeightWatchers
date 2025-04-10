import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { PatientNote, Patient } from '../utils/types';
import styles from "../styles/PatientDetails.module.css";
import PatientInfoSection from '../components/PatientInfoSection';
import PatientNotesSection from '../components/PatientNotesSection';
import ChartCalendarViz from '../components/ChartCalendarViz';
import { ToastContainer, toast } from 'react-toastify';

const PatientDetails: React.FC = () => {

  const navigate = useNavigate();
  const { getCSRFToken } = useAuth();
  const [csrfToken, setCsrfToken] = useState<string>('');
  const { id } = useParams<{ id: string }>();

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
        toast("Oops! Something went wrong while removing that patient from your care. Please try again.");
      }
      toast("The patient has successfully been removed from your list of patients.");
      navigate('/dashboard');
    } catch (err: any) {
      toast("Oops! Something went wrong while removing that patient from your care. Please try again.");
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
        toast("Oops! Something happened while updating that note. Please try again.");
        return;
      }

      setNewNoteText('');
      setEditingNoteId(null);
      setRefresh(!refresh);

    } catch (error) {
      toast("Oops! Something happened while updating that note. Please try again.");
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
        toast("Oops! Something happened while deleting that note. Please try again.");
        return;
      }

      setRefresh(!refresh);
    } catch (error) {
      toast("Oops! Something happened while deleting that note. Please try again.");
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
          toast("Oops! Something went wrong while removing that patient from your care. Please try again."); 
        }
        const data = await res.json();

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
      } catch (err: any) {
        toast("Oops! Something happened while getting your patient's information. Please try again.");
      } finally { setLoading(false); }
    };

    getPatientData();
  }, [id, refresh]);

  const handleExportCSV = () => {
    if (!patient) return;

    let csvContent = "";
    csvContent += "Patient Info\n";
    csvContent += "First Name,Last Name,Email,Date of Birth,Sex,Height (cm),Medications,Other Information,Latest Weight,Weight Last Updated,Weight Alarm Threshold\n";
    const { date_of_birth, sex, height, medications, other_info, alarm_threshold } = patient.patient_info!;
    csvContent += `${patient.first_name},${patient.last_name},${patient.email},${date_of_birth},${sex},${height},${medications},${other_info},${patient.latest_weight},${new Date(patient!.latest_weight_timestamp!).toISOString()},${alarm_threshold}\n\n`;

    csvContent += "Patient Notes\n";
    csvContent += "Timestamp,Note\n";
    patient.notes?.forEach((note: PatientNote) => {
      const timestamp = new Date(note.timestamp).toISOString();
      const sanitizedNote = note.note.replace(/"/g, '""');
      csvContent += `${timestamp},"${sanitizedNote}"\n`;
    });
    csvContent += "\n";

    csvContent += "Weight History\n";
    csvContent += "Timestamp,Weight\n";
    patient.weight_history?.forEach((record: any) => {
      csvContent += `${new Date(record.timestamp).toISOString()},${record.weight}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `patient_${id}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) { return <div className={styles.loading}>Loading patient data…</div>; }

  const weightHistory = patient!.weight_history || [];

  return (
    <div className={styles.container}>
      <ToastContainer/>
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
          Remove Patient
        </button>
        <button className={styles.export_patient_btn} onClick={handleExportCSV}>
          Export Data
        </button>
      </div>

    </div>
  );
};

export default PatientDetails;