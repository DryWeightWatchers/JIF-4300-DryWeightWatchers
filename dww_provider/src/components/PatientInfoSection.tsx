
import React, { useState } from 'react';
import styles from '../styles/PatientInfoSection.module.css';


interface PatientInfo {
  date_of_birth?: string;
  sex?: string;
  height?: string;
  medications?: string;
  other_info?: string;
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
      try {
        const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/add-patient-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 
            'X-CSRFToken': csrfToken
          }, 
          credentials: 'include', 
          body: JSON.stringify(fields)
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
      <div>
        <span>Basic Information: </span>
        <span onClick={handleEditClick}>
          {isEditing ? 'Save' : 'Update'}
        </span>
      </div>
      {Object.entries(fields).map(([key, value]) => (
        <div key={key}>
          <strong>{key}: </strong>
          {isEditing ? (
            <input
              type="text"
              value={value || ''}
              onChange={(event) =>
                setFields((prev) => ({ ...prev, [key]: event.target.value }))
              }
            />
          ) : (
            <span> {value || 'N/A'}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default PatientInfoSection;
