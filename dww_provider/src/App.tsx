import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <Router>
      <header className="header">
        <div className="brand">Dry Weight Watchers</div>
        <Link to="/register" className="create-account-link">
          Create Account
        </Link>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </Router>
  );
}
