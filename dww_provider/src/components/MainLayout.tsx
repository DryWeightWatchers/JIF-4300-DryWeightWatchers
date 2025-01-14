

import React from 'react'; 
import Navbar from './Navbar'; 
import '../styles/Navbar.css'; 

type MainLayoutProps = {
  children: React.ReactNode; 
}; 

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar /> 
      <main>{children}</main>
    </>
  )
}

export default MainLayout; 