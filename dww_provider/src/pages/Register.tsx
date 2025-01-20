
import React, { useState } from 'react';
import styles from '../styles/auth-forms.module.css'; 

const Register: React.FC = () => {

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [response, setResponse] = useState<string|null>(null); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    try {
      const res = await fetch('http://localhost:8000/register-provider', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify(formData)
      }); 

      if (!res.ok) { 
        const errorData = await res.json(); // Parse JSON error response
        throw new Error(errorData.error || `Error: ${res.statusText}`);
      } 

      const data = await res.json(); 
      setResponse(data.message || 'Success'); 

    } catch (error: unknown) {
      if (error instanceof Error) {
        setResponse(`Error: ${error.message}`); 
      }
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
          <label htmlFor="firstname" className={styles.requiredInput}>First Name:</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
          />

          <label htmlFor="lastname" className={styles.requiredInput}>Last Name:</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
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
            type="phone"
            id="phone"
            name="phone"
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

      {response && (
        <div>
          <p>Server Response:</p>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default Register;
