

import React from 'react'; 
import { Link } from 'react-router-dom'; 
import styles from '../styles/Navbar.module.css'; 


const Navbar: React.FC = () => {

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbarList}>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/profile'>Profile</Link></li>
        <li><Link to='/settings'>Settings</Link></li>
        <li className={styles.signout}><Link to='#'>Sign Out</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar; 