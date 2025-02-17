
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import FormErrorDisplay, { ErrorObject } from '../components/FormErrorDisplay'; 
import styles from '../styles/auth-forms.module.css'; 
import { useAuth } from '../components/AuthContext'; 

const Register: React.FC = () => {

  const serverUrl = import.meta.env.VITE_PUBLIC_DEV_SERVER_URL;
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [response, setResponse] = useState<ErrorObject|null>(null); 
  const navigate = useNavigate(); 
  const { getCSRFToken } = useAuth();
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);

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
    console.log('Form submitted:', formData);
    console.log('csrfToken: ', csrfToken); 

    try {
      const res = await fetch(`${serverUrl}/register-provider`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
          "X-CSRFToken": csrfToken || "",
        }, 
        credentials: 'include', 
        body: JSON.stringify(formData)
      }); 

      if (!res.ok) { 
        const errorData = await res.json(); // Parse JSON error response
        setResponse(errorData.error); 
      } else {
        setResponse(null); 
        navigate('/'); 
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setResponse({ message: error.message }); 
      }
    }
  };

  return (
    <div className={styles.authFormContainer}>
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

        <button type="submit">Create Account</button>
      </form>
      <FormErrorDisplay error={response} />
    </div>
  );
};

export default Register;
