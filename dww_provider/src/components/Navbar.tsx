

import React from 'react'; 
import { Link } from 'react-router-dom'; 
import styles from '../styles/Navbar.module.css'; 


const Navbar: React.FC = () => {

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbarLinks}>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/profile'>Profile</Link></li>
        <li><Link to='/settings'>Settings</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar; 