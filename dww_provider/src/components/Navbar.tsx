

import React from 'react'; 
import { Link } from 'react-router-dom'; 
import '../styles/Navbar.css'; 


const Navbar: React.FC = () => {

  return (
    <nav className='navbar'>
      <div className="brand">Dry Weight Watchers</div>
      <ul className='navbar-links'>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/profile'>Profile</Link></li>
        <li><Link to='/settings'>Settings</Link></li>
        <li><Link to='/login'>Login / Register</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar; 