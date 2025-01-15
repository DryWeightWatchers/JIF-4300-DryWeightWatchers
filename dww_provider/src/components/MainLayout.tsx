

import React from 'react'; 
import Navbar from './Navbar'; 
import styles from '../styles/MainLayout.module.css'; 

type MainLayoutProps = {
  children: React.ReactNode; 
}; 

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <Navbar /> 
      <main>{children}</main>
      <footer>
        <p className={styles.footerText}>Footer Text</p>
      </footer>
    </div>
  )
}

export default MainLayout; 