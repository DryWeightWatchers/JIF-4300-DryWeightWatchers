
import React, { useState } from 'react';
import styles from '../styles/auth-forms.module.css'; 

const CreateAccount: React.FC = () => {

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace the below console.log with actual form submission logic
    console.log('Form submitted:', formData);
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
    </div>
  );
};

export default CreateAccount;
