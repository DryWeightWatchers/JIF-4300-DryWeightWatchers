import React, { useState } from 'react'; 
import Navbar from './Navbar'; 
import styles from '../styles/MainLayout.module.css'; 

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(true);

  return (
    <div className={styles.container}>
      <Navbar isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
      <div className={`${styles.content} ${isNavOpen ? styles.expanded : styles.collapsed}`}>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
