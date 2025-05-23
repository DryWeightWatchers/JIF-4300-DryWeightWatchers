import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/auth-forms.module.css';
import { useAuth } from '../components/AuthContext';
import { ToastContainer, toast } from 'react-toastify';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const { getCSRFToken } = useAuth();
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
  const [showPopup, setShowPopup] = useState(false); 

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCSRFToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/register-provider/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        toast("Oops! Somemthing happened while creating your account. Plese try again.");
      } else {
        setShowPopup(true);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast("Oops! Something happened while creating your account. Please try again.");
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    navigate('/');
  };

  return (
    <div className={styles.authFormContainer}>
      <ToastContainer/>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="first_name" className={styles.requiredInput}>First Name:</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="last_name" className={styles.requiredInput}>Last Name:</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email" className={styles.requiredInput}>Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="phone">Phone:</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="(123) 456-7890"
          value={formData.phone}
          onChange={handleChange}
        />

        <label htmlFor="password" className={styles.requiredInput}>Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="confirmPassword" className={styles.requiredInput}>Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button className={styles.authButton} type="submit">Create Account</button>
      </form>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2>Email Verification Sent!</h2>
            <p>
              An email has been sent to <strong>{formData.email}</strong>.  
              Please check your inbox and follow the instructions to verify your email address.
            </p>
            <button onClick={handleClosePopup}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
