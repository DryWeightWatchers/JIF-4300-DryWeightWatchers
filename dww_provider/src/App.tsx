import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/App.css'
import './styles/Login.css'
import MainLayout from './components/MainLayout';
import Navbar from './components/Navbar';

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
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        </Routes>
      </main>
    </Router>
  );
}