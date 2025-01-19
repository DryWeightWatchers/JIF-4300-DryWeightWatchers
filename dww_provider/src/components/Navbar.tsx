

import React from 'react'; 
import { Link } from 'react-router-dom'; 
import styles from '../styles/Navbar.module.css'; 


const Navbar: React.FC = () => {

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}><Link to='/'>Dry Weight Watchers</Link></div>
      <ul className={styles.navbarList}>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/dashboard'>Dashboard</Link></li>
        <li><Link to='/profile'>Profile</Link></li>
        <li><Link to='/login'>Login / Register</Link></li>
        <li className={styles.signout}><Link to='#'>Sign Out</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar; 