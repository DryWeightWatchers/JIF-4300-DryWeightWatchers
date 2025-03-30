
import React, { useState, useEffect } from 'react';
import styles from '../styles/PatientInfoSection.module.css';
import { PatientInfo, PatientInfoSectionProps } from '../utils/types'; 



const PatientInfoSection: React.FC<PatientInfoSectionProps> = ({ 
  patientInfo, csrfToken, email, latestWeight, weightLastUpdated 
}) => {
  const DEFAULT_ALARM_THRESHOLD = 2.0; 
  const [fields, setFields] = useState<PatientInfo>({
    ...patientInfo,
    alarm_threshold: patientInfo?.alarm_threshold ?? DEFAULT_ALARM_THRESHOLD,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFields({
      ...patientInfo,
      alarm_threshold: patientInfo?.alarm_threshold ?? DEFAULT_ALARM_THRESHOLD
    });
  }, [patientInfo]);

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

        setFields((prev) => ({
          ...prev,
          last_updated: new Date(),
        }));

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
        <div>
          <strong>Patient Information</strong> &nbsp;
          <span className={styles.lastUpdatedText}>
            (last updated {fields.last_updated ? new Date(fields.last_updated).toLocaleDateString() : 'N/A'})
          </span>
        </div>
        <span onClick={handleEditClick} className={styles.updateSaveText}>
          {isEditing ? 'Save' : 'Update'}
        </span>
      </div>
  
      <div className={styles.infoRow}>
        <strong>Email:</strong>
        <span>{email}</span>
      </div>
  
      <div className={styles.infoRow}>
        <strong>Date of Birth:</strong>
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
          <span>{fields.date_of_birth || 'None'}</span>
        )}
      </div>
  
      <div className={styles.infoRow}>
        <strong>Sex:</strong>
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
          <span>{fields.sex || 'None'}</span>
        )}
      </div>
  
      <div className={styles.infoRow}>
        <strong>Height:</strong>
        {isEditing ? (
          <input
            type="number"
            value={fields.height || ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, height: event.target.value }))
            }
          />
        ) : (
          <span>{fields.height ? `${fields.height} cm` : 'None'}</span>
        )}
      </div>
  
      <div className={styles.infoRow}>
        <strong>Medications:</strong>
        {isEditing ? (
          <textarea
            className={styles.medicationsTextarea}
            value={fields.medications || ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, medications: event.target.value }))
            }
          />
        ) : (
          <span className={styles.textBlock}>{fields.medications || 'None'}</span>
        )}
      </div>

      <div className={styles.infoRow}>
        <strong>Other Information:</strong>
        {isEditing ? (
          <textarea 
            className={styles.otherInfoTextarea}
            value={fields.other_info || ''}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, other_info: event.target.value }))
            }
          />
        ) : (
          <span className={styles.textBlock}>{fields.other_info || 'None'}</span>
        )}
      </div>

      <div className={styles.infoRow}>
        <strong>Weight Alarm Threshold:</strong>
        {isEditing ? (
          <input
            type="number"
            step="0.1"
            value={fields.alarm_threshold ?? 2.0}
            onChange={(event) => setFields((prev) => ({
              ...prev,
              alarm_threshold: parseFloat(event.target.value),
            }))}
          />
        ) : (
          <span>
            {fields.alarm_threshold !== undefined
              ? `${fields.alarm_threshold} lbs`
              : '2.0 lbs (default)'}
          </span>
        )}
      </div>
  
      <div className={styles.latestWeight}>
        <strong>Latest Weight:</strong>&nbsp;
        {latestWeight !== undefined ? (
          <span>
            {latestWeight} lbs &nbsp;&nbsp;
            {weightLastUpdated && 
              <span className={styles.lastUpdatedText}>
                (last measured {new Date(weightLastUpdated).toLocaleString()})
              </span>}
          </span>
        ) : (
          <span>Not available</span>
        )}
      </div>
    </div>
  );
};

export default PatientInfoSection;
