import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/auth-forms.module.css';
import { useAuth } from '../components/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const serverUrl = import.meta.env.VITE_PUBLIC_DEV_SERVER_URL;

  
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Server URL:", serverUrl);

      const response = await fetch(`${serverUrl}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json()
        if (data.role !== 'provider') {
          alert('Access restricted to providers only');
          return;
        }
        localStorage.setItem('authToken', data.access);
        login();
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };





  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    handleLogin(email, password);
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className={styles.authFormContainer}>
      <h1>Provider Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="provider@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className={styles.errorText}>{error}</p>}

        <button type="submit">Login</button>
        <button type="button" id={styles.newAccountBtn} onClick={handleRegisterClick}>
          Register New Account
        </button>
      </form>
    </div>
  );
};

export default Login;


