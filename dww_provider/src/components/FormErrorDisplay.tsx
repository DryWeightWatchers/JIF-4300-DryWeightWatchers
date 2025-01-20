
import React from 'react';
import styles from '../styles/FormErrorDisplay.module.css';


export type ErrorDetails = {
    [field: string]: string[];
};
export type ErrorObject = {
    message: string;
    details?: ErrorDetails;
};
export type FormErrorDisplayProps = {
    error: ErrorObject | null;
};


const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ error }) => {
    if (!error || !error.message) {
        return null; // Don't render if there is no error
    }
    const { message, details } = error;

    return (
      <div className={styles.errorDisplay}>
          <p className={styles.errorMessage}>{message}</p>
          {details && (
              <ul className={styles.errorDetails}>
                  {Object.entries(details).map(([field, errors]) => (
                      <li key={field}>
                          <strong className={styles.errorField}>{field}:</strong>
                          <ul className={styles.errorFieldList}>
                              {errors.map((detail, index) => (
                                  <li key={index} className={styles.errorDetail}>
                                      {detail}
                                  </li>
                              ))}
                          </ul>
                      </li>
                  ))}
              </ul>
          )}
      </div>
  );
};

export default FormErrorDisplay;
