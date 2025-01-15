import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    return new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'provider@example.com' && password === 'secret123') {
          resolve('fake-jwt-token');
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = await login(email, password);
      console.log('Login successful, token:', token);
      localStorage.setItem('authToken', token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
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

        {error && <p className="error-text">{error}</p>}

        <button type="submit">Login</button>
        <button type="button" id="new-account-btn" onClick={handleRegisterClick}>Register New Account</button>
      </form>
    </div>
  );
};

export default Login;
