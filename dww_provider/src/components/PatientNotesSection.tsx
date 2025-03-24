// src/components/PatientNotesSection.tsx

import { useState } from "react";
import styles from "../styles/PatientDetails.module.css";

type WeightRecord = {
  weight: number;
  timestamp: string;
};

type PatientNote = {
  timestamp: Date;
  note: string;
};

type PatientNotesSectionProps = {
  selectedDay: Date;
  weightHistory?: WeightRecord[];
  notes?: PatientNote[];
  addNoteText: string;
  setAddNoteText: (text: string) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

const PatientNotesSection: React.FC<PatientNotesSectionProps> = ({
  selectedDay,
  weightHistory = [],
  notes = [],
  addNoteText,
  setAddNoteText,
  handleKeyDown,
}) => {
  const weightRecordsForDay = weightHistory.filter((record) => {
    const ts = new Date(record.timestamp);
    return (
      ts.getFullYear() === selectedDay.getFullYear() &&
      ts.getMonth() === selectedDay.getMonth() &&
      ts.getDate() === selectedDay.getDate()
    );
  });

  const notesForDay = notes.filter(
    (note) => note.timestamp.toDateString() === selectedDay.toDateString()
  );

  return (
    <div className={styles.patient_info}>
      <div className={styles.noteSection}>
        <span className={styles.label}>Selected Day: </span>
        {selectedDay.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      <div className={styles.noteSection}>
        <span className={styles.label}>Weight Recorded: </span>
        {weightRecordsForDay.length > 0 ? (
          weightRecordsForDay.map((record, index) => (
            <div key={index} className={styles.noteItem}>
              <span className={styles.noteValue}>{record.weight} lbs</span>
              <span className={styles.noteTime}>
                {new Date(record.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        ) : (
          <span>No weight records for this day</span>
        )}
      </div>

      <div className={styles.noteSection}>
        <span className={styles.label}>Notes: </span>
        {notesForDay.length > 0 ? (
          notesForDay.map((note, index) => (
            <div key={index} className={styles.noteItem}>
              <span className={styles.noteText}>{note.note}</span>
              <span className={styles.noteTime}>
                {note.timestamp.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        ) : (
          <span>No notes for this day</span>
        )}
      </div>

      <textarea
        value={addNoteText}
        onChange={(e) => setAddNoteText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.addNoteText}
        placeholder="Type a note and press Enter..."
      />
    </div>
  );
};

export default PatientNotesSection;
