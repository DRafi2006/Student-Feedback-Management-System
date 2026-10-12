import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ShieldCheck, LogOut, Home, MessageSquarePlus, LayoutDashboard, UserCheck, QrCode } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const studentToken = localStorage.getItem('studentToken');
  const adminToken = localStorage.getItem('adminToken');
  const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || 'null');
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || 'null');

  const handleStudentLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentInfo');
    navigate('/student-login');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin-login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <div className="nav-logo-icon">
            <GraduationCap size={22} />
          </div>
          <span>CDU Feedback Portal</span>
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Home size={17} />
            <span>Home</span>
          </Link>

          {/* QR Generator & Scanner Link */}
          <Link
            to="/qr-generator"
            className={`nav-link ${location.pathname === '/qr-generator' ? 'active' : ''}`}
          >
            <QrCode size={17} />
            <span>QR Hub & Scanner</span>
          </Link>

          {/* Student Links */}
          {studentToken ? (
            <Link
              to="/feedback"
              className={`nav-link ${location.pathname === '/feedback' ? 'active' : ''}`}
            >
              <MessageSquarePlus size={17} />
              <span>Feedback Form</span>
            </Link>
          ) : (
            <Link
              to="/student-login"
              className={`nav-link ${location.pathname === '/student-login' ? 'active' : ''}`}
            >
              <UserCheck size={17} />
              <span>Student Portal</span>
            </Link>
          )}

          {/* Admin Links */}
          {adminToken ? (
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={17} />
              <span>Admin Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/admin-login"
              className={`nav-link ${location.pathname === '/admin-login' ? 'active' : ''}`}
            >
              <ShieldCheck size={17} />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* User Session Badges & Logout */}
          {studentToken && studentInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div className="nav-user-badge">
                <span className="role-pill student">Student</span>
                <span style={{ fontWeight: 600 }}>{studentInfo.name || studentInfo.studentId}</span>
              </div>
              <button
                onClick={handleStudentLogout}
                className="btn-logout"
                title="Logout Student"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {adminToken && adminInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div className="nav-user-badge">
                <span className="role-pill admin">Admin</span>
                <span style={{ fontWeight: 600 }}>{adminInfo.username}</span>
              </div>
              <button
                onClick={handleAdminLogout}
                className="btn-logout"
                title="Logout Admin"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
