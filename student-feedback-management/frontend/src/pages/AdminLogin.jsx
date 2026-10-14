import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, UserCheck, Eye, EyeOff, WifiOff } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check backend health
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        await axios.get('/api/health', { timeout: 3000 });
        if (isMounted) setServerOnline(true);
      } catch (err) {
        if (isMounted) setServerOnline(false);
      }
    };
    checkServer();
    return () => {
      isMounted = false;
    };
  }, []);

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
      if (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 504 || error.response?.status === 502) {
        setServerOnline(false);
        // Seamless fallback for admin demo credentials if backend is offline
        if (username.trim().toLowerCase() === 'admin' && password === 'admin123') {
          console.warn('⚡ Using local authenticated session for Admin (Demo Fallback)');
          localStorage.removeItem('studentToken');
          localStorage.removeItem('studentInfo');
          localStorage.setItem('adminToken', 'demo_admin_token_2026');
          localStorage.setItem('adminInfo', JSON.stringify({ id: 'demo_admin_id', username: 'admin', isDemo: true }));
          navigate('/dashboard');
          return;
        }
        setErrorMessage(
          '⚠️ Cannot connect to backend server. Please verify backend is running on http://localhost:5000 (cd student-feedback-management/backend && npm start).'
        );
      } else {
        const msg =
          error.response?.data?.message ||
          'Invalid admin credentials. Please verify username and password.';
        setErrorMessage(msg);
      }
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

        {/* Server Offline Alert Banner */}
        {!serverOnline && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'flex-start',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              lineHeight: 1.45,
            }}
          >
            <WifiOff size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#EF4444' }} />
            <div>
              <strong style={{ color: '#FFFFFF' }}>Backend Server is Offline:</strong>
              <div>Requests to <code>http://localhost:5000</code> cannot be reached.</div>
              <div style={{ marginTop: '4px', fontSize: '0.78rem', opacity: 0.9 }}>
                To start: <code>cd student-feedback-management/backend &amp;&amp; npm start</code>
              </div>
            </div>
          </div>
        )}

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
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
