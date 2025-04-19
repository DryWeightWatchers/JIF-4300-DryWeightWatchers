import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/auth-forms.module.css';
import { useAuth } from '../components/AuthContext';
import { ToastContainer, toast } from 'react-toastify';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, getCSRFToken } = useAuth();
  const serverUrl = import.meta.env.VITE_PUBLIC_DEV_SERVER_URL;
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCSRFToken();
      setCsrfToken(token); 
    };
    fetchCsrfToken();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${serverUrl}/login/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
      },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json()
        if (data.role !== 'provider') {
          toast("Please use the mobile app if you are not a healthcare provider.");
          return;
        }
        localStorage.setItem('authToken', data.access);
        login();
        navigate('/home');
      } else {
        toast("Oops! Something happened while logging in. Please try again.");
      }
    } catch (error) {
      toast("Oops! Something happened while logging in. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className={styles.authFormContainer}>
      <ToastContainer/>
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

        <button className={styles.authButton} type="submit" >Login</button>
        <button className={styles.authButton} type="button" id={styles.newAccountBtn} onClick={handleRegisterClick}>
          Register New Account
        </button>
      </form>
    </div>
  );
};

export default Login;


