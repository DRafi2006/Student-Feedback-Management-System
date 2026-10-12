import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, UserCheck } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username || !password) {
      setErrorMessage('Please enter both Username and Password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/admin/login', {
        username: username.trim(),
        password,
      });

      if (response.data && response.data.token) {
        // Clear any old student session to avoid navbar clutter
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentInfo');

        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));

        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Admin Login error:', error);
      const msg =
        error.response?.data?.message ||
        'Invalid admin credentials. Please verify username and password.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}>
        <div className="auth-header">
          <div
            className="auth-icon-circle"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              color: 'var(--secondary)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 className="auth-title">Admin Portal</h2>
          <p className="auth-subtitle">
            Secure access to college-wide feedback analytics & records
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="adminUsername">
              Admin Username
            </label>
            <div style={{ position: 'relative' }}>
              <UserCheck
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-faint)',
                }}
              />
              <input
                id="adminUsername"
                type="text"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="adminPassword">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-faint)',
                }}
              />
              <input
                id="adminPassword"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-outline-admin"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating Admin...</span>
            ) : (
              <>
                <span>Enter Admin Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Admin Helper */}
        <div className="seed-helper">
          <div className="seed-helper-title">⚡ Default Admin Credentials</div>
          <div className="seed-chips">
            <button
              type="button"
              onClick={handleQuickFill}
              className="seed-chip"
              style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.3)', color: '#DDD6FE' }}
            >
              admin / admin123 (Click to auto-fill)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Are you a student?{' '}
          <Link to="/student-login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Student Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
