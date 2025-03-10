import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from "../styles/PatientDetails.module.css";
import Chart from '../components/Chart';
import Calendar from '../components/Calendar';
import PatientInfoSection from '../components/PatientInfoSection';

type WeightRecord = {
  weight: number;
  timestamp: string;
}

type PatientNote = {
  timestamp: Date,
  note: string,
}

interface PatientInfo {
  patient?: number; 
  date_of_birth?: string;
  sex?: string;
  height?: string;
  medications?: string;
  other_info?: string;
  last_updated?: string; 
}

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  latest_weight: number | null;
  latest_weight_timestamp: string | null;
  weight_history?: WeightRecord[];
  notes?: PatientNote[];
  patient_info?: PatientInfo; 
};

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [chart, setChart] = useState('chart');
  const [addNoteText, setAddNoteText] = useState<string>(''); 
  const [refresh, setRefresh] = useState<boolean>(false); 
  const [csrfToken, setCsrfToken] = useState<string>(''); 
  const navigate = useNavigate(); 

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
    const getCSRFToken = async () => {
      const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/get-csrf-token/`, {
        credentials: 'include',
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken); 
    };
    getCSRFToken(); 
  }, []);

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

        // convert timestamps in notes to Date objects
        if (data.notes) {
          data.notes = data.notes.map((note: PatientNote) => ({
            ...note,
            timestamp: new Date(note.timestamp),
          }));
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

      <PatientInfoSection patientInfo={patient!.patient_info} csrfToken={csrfToken}/>

      <div className={styles.details_container}>
        <div className={styles.patient_info}>
          <p><span className={styles.label}>Email:</span> {patient!.email}</p>
          <p><span className={styles.label}>Latest Weight:</span> {patient!.latest_weight ? `${patient!.latest_weight} lbs` : "N/A"}</p>
          <p><span className={styles.label}>Last Weight Update:</span> {patient!.latest_weight_timestamp ? new Date(patient!.latest_weight_timestamp).toLocaleString() : "N/A"}</p>
        </div>

        <div className={styles.weight_history}>
          <h2 className={styles.weight_history_title}>Weight History</h2>
          <div className={styles.chart_slider_container}>
            <button
              className={styles.chart_left_button}
              style={{
                backgroundColor: chart === 'chart' ? '#7B5CB8' : 'white',
                color: chart === 'chart' ? 'white' : 'gray'
              }}
              onClick={() => setChart('chart')}
            >
              Chart
            </button>
            <button
              className={styles.chart_right_button}
              style={{
                backgroundColor: chart === 'calendar' ? '#7B5CB8' : 'white',
                color: chart === 'calendar' ? 'white' : 'gray'
              }}
              onClick={() => setChart('calendar')}
            >
              Calendar
            </button>
          </div>
          {weightHistory.length > 0 ? (
            <div className={styles.chart_container}>
              {chart === 'chart' ? 
                <Chart
                  weightRecord={weightHistory.map(r => ({
                    timestamp: new Date(r.timestamp),
                    weight: r.weight
                  }))}
                  onDataPointSelect={handleDataPointSelect}
                /> : 
                <Calendar
                  weightRecord={weightHistory.map(r => ({
                    timestamp: new Date(r.timestamp),
                    weight: r.weight
                  }))}
                  onDataPointSelect={handleDataPointSelect}
                />
              }
            </div>
          ) : (
            <p>No weight history available.</p>
          )}
        </div>

        <div className={styles.patient_info}>
          <div className={styles.noteSection}>
            <span className={styles.label}>Selected Day: </span> 
            {selectedDay!.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          {selectedDay && (
            <>
              <div className={styles.noteSection}>
                <span className={styles.label}>Weight Recorded: </span>
                {patient?.weight_history?.filter(record => 
                    new Date(record.timestamp).getFullYear() === selectedDay.getFullYear() &&
                    new Date(record.timestamp).getMonth() === selectedDay.getMonth() &&
                    new Date(record.timestamp).getDate() === selectedDay.getDate()
                  ).map((record, index) => (
                    <div key={index} className={styles.noteItem}>
                      <span className={styles.noteValue}>
                        {record.weight} lbs
                      </span>
                      <span className={styles.noteTime}>
                        {new Date(record.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                {!patient?.weight_history?.some(record => 
                  new Date(record.timestamp).getFullYear() === selectedDay.getFullYear() &&
                  new Date(record.timestamp).getMonth() === selectedDay.getMonth() &&
                  new Date(record.timestamp).getDate() === selectedDay.getDate()
                ) && (
                  <span>No weight records for this day</span>
                )}
              </div>

              <div className={styles.noteSection}>
                <span className={styles.label}>Notes: </span>
                {patient?.notes?.filter(note => 
                    note.timestamp.toDateString() === selectedDay.toDateString()
                  )
                  .map((note, index) => (
                    <div key={index} className={styles.noteItem}>
                      <span className={styles.noteText}>{note.note}</span>
                      <span className={styles.noteTime}>
                        {note.timestamp.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                
                {!patient?.notes?.some(note => 
                  note.timestamp.toDateString() === selectedDay.toDateString()
                ) && (
                  <span> No notes for this day</span>
                )}
              </div>
              <textarea 
                  value={addNoteText} 
                  onChange={e => setAddNoteText(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  className={styles.addNoteText} 
                  placeholder="Type a note and press Enter..."
              />
            </>
          )}
        </div>

        <div className={styles.button_container}>
          <button className={styles.remove_patient_btn} onClick={handleRemovePatientRelationship}>Remove Patient</button>
        </div>

      </div>
    </div>
  );
};

export default PatientDetails;