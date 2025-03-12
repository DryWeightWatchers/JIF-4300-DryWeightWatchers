
import React, { useState } from 'react';
import styles from '../styles/PatientInfoSection.module.css';


interface PatientInfo {
  patient?: number; 
  date_of_birth?: string;
  sex?: string;
  height?: string;
  medications?: string;
  other_info?: string;
  last_updated?: string; 
}

interface PatientInfoSectionProps {
  patientInfo?: PatientInfo;
  csrfToken: string;
}


const PatientInfoSection: React.FC<PatientInfoSectionProps> = ({ patientInfo, csrfToken }) => {
  const [fields, setFields] = useState<PatientInfo>(patientInfo ?? {});
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = async () => {
    if (isEditing) {
      let request_fields = fields; 
      delete request_fields.last_updated; 
      try {
        const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/add-patient-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 
            'X-CSRFToken': csrfToken
          }, 
          credentials: 'include', 
          body: JSON.stringify(request_fields)
        });
        if (!response.ok) {
          console.error('Error updating patient field data');
        }
      } catch (err) {
        console.error('Error sending patient field data: ', err);
      }
    }
    setIsEditing(!isEditing);
  };

  return (
    <div>
      <div className={styles.basicInfoHeader}>
        <span>
          <strong>Basic Information</strong>&nbsp; 
          (last updated {fields.last_updated ? new Date(fields.last_updated).toLocaleString() : 'N/A'}):
        </span>
        <span onClick={handleEditClick} className={styles.updateSaveText}>
          {isEditing ? 'Save' : 'Update'}
        </span>
      </div>
  
      <div>
        <strong>Date of Birth: </strong>
        {isEditing ? (
          <input
            type="text"
            value={fields.date_of_birth || ''}
            placeholder="YYYY-MM-DD"
            onChange={(event) => {
              const value = event.target.value;
              if (/^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/.test(value)) {
                setFields((prev) => ({ ...prev, date_of_birth: value }));
              }
            }}
          />
        ) : (
          <span> {fields.date_of_birth || 'N/A'}</span>
        )}
      </div>
  
      <div>
        <strong>Sex: </strong>
        {isEditing ? (
          <select
            value={fields.sex || ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, sex: event.target.value }))
            }
          >
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Intersex / Other</option>
          </select>
        ) : (
          <span> {fields.sex || 'N/A'}</span>
        )}
      </div>
  
      <div>
        <strong>Height: </strong>
        {isEditing ? (
          <input
            type="number"
            value={fields.height || ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, height: event.target.value }))
            }
          /> 
        ) : (
          <span> {fields.height || 'N/A'} cm</span>
        )}
      </div>
  
      <div>
        <strong>Medications: </strong>
        {isEditing ? (
          <input
            type="text"
            value={fields.medications || ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, medications: event.target.value }))
            }
          />
        ) : (
          <span> {fields.medications || 'N/A'}</span>
        )}
      </div>
  
      <div>
        <strong>Other Information: </strong>
        {isEditing ? (
          <input
            type="text"
            value={fields.other_info || ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, other_info: event.target.value }))
            }
          />
        ) : (
          <span> {fields.other_info || 'N/A'}</span>
        )}
      </div>
    </div>
  );
};

export default PatientInfoSection;
