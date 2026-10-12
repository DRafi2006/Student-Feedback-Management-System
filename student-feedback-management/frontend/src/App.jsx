import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentLogin from './pages/StudentLogin';
import Feedback from './pages/Feedback';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import QRGenerator from './pages/QRGenerator';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user visits root / with feedback parameters, automatically redirect to /feedback
    if (location.pathname === '/') {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('faculty') || searchParams.get('subject')) {
        navigate(`/feedback${location.search}`, { replace: true });
      }
    }
  }, [location, navigate]);

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/qr-generator" element={<QRGenerator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
