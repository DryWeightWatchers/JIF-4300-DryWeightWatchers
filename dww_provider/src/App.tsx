

import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import MainLayout from './components/MainLayout'; 
import Home from './pages/Home'; 
import Profile from './pages/Profile'; 
import Settings from './pages/Settings'; 
import './styles/App.module.css'

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<MainLayout><Home /></MainLayout>} />
        <Route path='/profile' element={<MainLayout><Profile /></MainLayout>} />
        <Route path='/settings' element={<MainLayout><Settings /></MainLayout>} />
      </Routes>
    </Router>
  )
}

export default App
