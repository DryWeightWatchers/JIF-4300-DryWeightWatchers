import { useState, useEffect } from 'react'; 
import styles from "../styles/PatientNotesSection.module.css";
import { PatientNotesSectionProps } from '../utils/types'; 



const PatientNotesSection: React.FC<PatientNotesSectionProps> = ({
  selectedDay,
  weightHistory = [],
  notes = [],
  newNoteText,
  setNewNoteText,
  editingNoteId, 
  setEditingNoteId, 
  onAddOrUpdateNote, 
  onDeleteNote
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

  const handleEditClick = (noteId: string, noteText: string) => {
    setEditingNoteId(noteId);
    setNewNoteText(noteText);
  };

  const handleSaveEdit = () => {
    if (editingNoteId !== null && newNoteText.trim()) {
      onAddOrUpdateNote(editingNoteId, newNoteText.trim(), selectedDay);
      setEditingNoteId(null);
      setNewNoteText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddOrUpdateNote(editingNoteId, newNoteText.trim(), selectedDay);
      setEditingNoteId(null);
      setNewNoteText('');
    }
  };

  return (
    <div className={styles.notes_container}>
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
            <div 
              key={index}
              className={`${styles.noteItem} ${editingNoteId === note.id ? styles.editing : ''}`}
            >
              <span className={styles.noteText}>{note.note}</span>
              <span className={styles.editDeleteGroup}>
                <span 
                  className={styles.editDeleteText}
                  onClick={() => {
                    editingNoteId === note.id 
                    ? handleSaveEdit() 
                    : handleEditClick(note.id, note.note)
                  }}
                >
                  {editingNoteId === note.id ? "Save" : "Edit"}
                </span>
                <span 
                  className={styles.editDeleteText} 
                  onClick={() => onDeleteNote(note.id)}
                >
                  Delete
                </span> 
              </span>
            </div>
          ))
        ) : (
          <span>No notes for this day</span>
        )}
      </div>

      <textarea
        value={newNoteText}
        onChange={(e) => setNewNoteText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.addNoteText}
        placeholder="Type a note and press Enter..."
      />
    </div>
  );
};

export default PatientNotesSection;
