

import React from 'react';
import '../styles/Navbar.css'; 

type MainLayoutProps = {
  children: React.ReactNode; 
}; 

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <main>{children}</main>
    </>
  )
}

export default MainLayout; 