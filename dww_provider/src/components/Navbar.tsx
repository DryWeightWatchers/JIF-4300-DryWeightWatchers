import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaChartBar, FaSignOutAlt, FaBars, FaTimes, FaSignInAlt } from 'react-icons/fa';
import styles from '../styles/Navbar.module.css';
import { useAuth } from '../components/AuthContext';

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, setIsOpen }) => {
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
    <nav className={`${styles.navbar} ${isOpen ? styles.open : styles.collapsed}`}>
      <div className={styles.logoContainer}>
        <img src={"/logo_no_bg_white.svg"} alt="Logo" className={`${styles.logo} ${isOpen ? styles.logoExpanded : ''}`} />
      </div>
      <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <ul className={styles.navItems}>
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/" className={styles.navLink}>
                <FaHome className={styles.icon} />
                {isOpen && <span>Home</span>}
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className={styles.navLink}>
                <FaChartBar className={styles.icon} />
                {isOpen && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link to="/profile" className={styles.navLink}>
                <FaUser className={styles.icon} />
                {isOpen && <span>Profile</span>}
              </Link>
            </li>
            <li>
              <button className={styles.navLinkLogOut} onClick={handleLogout}>
                <FaSignOutAlt className={styles.icon} />
                {isOpen && <span>Sign Out</span>}
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" className={styles.navLink}>
              <FaSignInAlt className={styles.icon} />
              {isOpen && <span>Sign In / Register</span>}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
