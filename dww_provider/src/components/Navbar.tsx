import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';


const Navbar: React.FC = () => {

  return (
    <nav className='navbar'>
      <div className="brand"><Link to='/'>Dry Weight Watchers</Link></div>
      <ul className='navbar-links'>
        <li className='navbar-link'><Link to='/'>Home</Link></li>
        <li className='navbar-link'><Link to='/profile'>Profile</Link></li>
        <li className='navbar-link'><Link to='/settings'>Settings</Link></li>
        <li className='navbar-link'><Link to='/login'>Login / Register</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar; 