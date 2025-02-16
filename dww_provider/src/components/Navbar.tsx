import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import { useAuth } from '../components/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.VITE_PUBLIC_DEV_SERVER_URL}/logout/`, {
        method: 'POST',
        credentials: 'include',
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

  // Determine the number of visible navbar items
  const navItems = [
    isAuthenticated && <li key="home"><Link to="/">Home</Link></li>,
    isAuthenticated && <li key="dashboard"><Link to="/dashboard">Dashboard</Link></li>,
    isAuthenticated && <li key="profile"><Link to="/profile">Profile</Link></li>,
    !isAuthenticated ? <li key="login"><Link to="/login">Login / Register</Link></li> : (
      <li key="signout" className={styles.signout}>
        <Link to="#" onClick={handleLogout}>Sign Out</Link>
      </li>
    )
  ].filter(Boolean); // Remove falsy values

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        {isAuthenticated ? (<Link to="/">
          <img src="/dww_banner.png" alt="Dry Weight Watchers Logo" className={styles.logo} />
        </Link>) : <img src="/dww_banner.png" alt="Dry Weight Watchers Logo" className={styles.logo} />}
      </div>
      <ul className={`${styles.navbarList} ${navItems.length === 1 ? styles.alignRight : ''}`}>
        {navItems}
      </ul>
    </nav>
  );
};

export default Navbar;
