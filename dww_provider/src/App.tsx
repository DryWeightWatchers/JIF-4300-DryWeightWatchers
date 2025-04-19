import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDetails from './pages/PatientDetails';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './components/AuthContext';
import VerifyEmail from './pages/VerifyEmail';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<MainLayout><Login /></MainLayout>} />
          <Route path='/dashboard' element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path='/profile' element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
          <Route path="/patients/:id" element={<MainLayout><PatientDetails /></MainLayout>} />
          <Route path="/delete" element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/verify-email" element={<MainLayout><VerifyEmail /></MainLayout>} />
        </Routes>
      </Router>
    </AuthProvider>

  );
}

