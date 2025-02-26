import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import { useAuth } from '../components/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, getCSRFToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const csrfToken = await getCSRFToken(); 
      const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/logout/`, {
        method: 'POST',
        credentials: 'include', 
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
      },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        logout();
        navigate('/login');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/">Dry Weight Watchers</Link>
      </div>
      <ul className={styles.navbarList}>
        <li><Link to="/">Home</Link></li>
        {isAuthenticated ? (<li><Link to="/dashboard">Dashboard</Link></li>) : null}
        {isAuthenticated ? (<li><Link to="/profile">Profile</Link></li>) : null}
        {!isAuthenticated ? (
          <li><Link to="/login">Login / Register</Link></li>
        ) : (
          <li className={styles.signout}>
            <Link to="#" onClick={handleLogout}>Sign Out</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;