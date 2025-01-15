import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import './styles/App.css'
import './styles/Login.css'

export default function App() {
  return (
    <Router>
      <header className="header">
        <Navbar />       
      </header>

      <main className="main">
        <Routes>
          <Route path='/' element={<MainLayout><Home /></MainLayout>} />
          <Route path='/profile' element={<MainLayout><Profile /></MainLayout>} />
          <Route path='/settings' element={<MainLayout><Settings /></MainLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </Router>
  );
}