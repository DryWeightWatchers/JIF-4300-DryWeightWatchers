import React from 'react';
// import Navbar from './Navbar';
import '../styles/App.css'

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div>
      {/* <header className="header">
        <Navbar />
      </header> */}
      <main className="main">{children}</main>
    </div>
  )
}

export default MainLayout; 
