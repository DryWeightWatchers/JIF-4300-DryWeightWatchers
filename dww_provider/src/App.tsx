import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard'; 
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './components/MainLayout';
import styles from './styles/App.module.css'; 

export default function App() {
  return (
    <Router>
        <Routes>
          <Route path='/' element={<MainLayout><Home /></MainLayout>} />
          <Route path='/dashboard' element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path='/profile' element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        </Routes>
    </Router>
  );
}