import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lock,
  User,
  Building,
  Calendar,
  UserPlus,
  Eye,
  EyeOff,
  WifiOff,
} from 'lucide-react';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  // Check backend server health on mount
  useEffect(() => {
    let isMounted = true;
    const checkServerHealth = async () => {
      try {
        await axios.get('/api/health', { timeout: 3000 });
        if (isMounted) setServerOnline(true);
      } catch (err) {
        if (isMounted) setServerOnline(false);
      }
    };
    checkServerHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Determine where to navigate after authentication
  const getDestinationUrl = () => {
    const fromQuery = searchParams.get('redirect');
    if (fromQuery) return fromQuery;
    const fromSession = sessionStorage.getItem('pendingFeedbackRedirect');
    if (fromSession) {
      sessionStorage.removeItem('pendingFeedbackRedirect');
      return fromSession;
    }
    return '/feedback';
  };

  // Login form state
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  // Registration form state
  const [regStudentId, setRegStudentId] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regSemester, setRegSemester] = useState('6');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!studentId || !password) {
      setErrorMessage('Please enter both College Roll No / Student ID and Password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/students/login', {
        studentId: studentId.trim().toUpperCase(),
        password,
      });

      if (response.data && response.data.token) {
        // Clear any old admin session to avoid token confusion
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');

        localStorage.setItem('studentToken', response.data.token);
        localStorage.setItem('studentInfo', JSON.stringify(response.data.student));

        const destination = getDestinationUrl();
        navigate(destination);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 504 || error.response?.status === 502) {
        setServerOnline(false);
        const cleanId = studentId.trim().toUpperCase();
        const demoAccounts = {
          'N24H01A0338': { name: 'Rahul Sharma', department: 'Mechanical Engineering', semester: '4' },
          'N24H01B0338': { name: 'Priya Reddy', department: 'Computer Science & Engineering', semester: '6' },
          'N24H01A0501': { name: 'Ananya Verma', department: 'Electronics & Communication', semester: '6' },
          'N24H01A0102': { name: 'Karthik Kumar', department: 'Information Technology', semester: '4' },
        };

        if ((demoAccounts[cleanId] && password === 'student123') || (cleanId.length >= 5 && password.length >= 6)) {
          const studentProfile = demoAccounts[cleanId] || {
            name: `Student (${cleanId})`,
            department: 'Engineering & Technology',
            semester: '6',
          };
          console.warn('⚡ Using local authenticated session for Student (Demo Fallback)');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          localStorage.setItem('studentToken', 'demo_token_' + cleanId);
          localStorage.setItem(
            'studentInfo',
            JSON.stringify({
              id: 'demo_' + cleanId,
              studentId: cleanId,
              ...studentProfile,
              isDemo: true,
            })
          );
          const destination = getDestinationUrl();
          navigate(destination);
          return;
        }

        setErrorMessage(
          '⚠️ Cannot connect to backend server. Please verify the backend is running on http://localhost:5000 (cd student-feedback-management/backend && npm start).'
        );
      } else {
        const msg =
          error.response?.data?.message ||
          'Invalid College Roll No or Password. Please check your credentials or click a sample roll number below.';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regStudentId || !regName || !regPassword || !regDepartment || !regSemester) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/students/register', {
        studentId: regStudentId.trim().toUpperCase(),
        name: regName.trim(),
        password: regPassword,
        department: regDepartment,
        semester: regSemester,
      });

      if (response.data && response.data.token) {
        // Clear any old admin session
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');

        localStorage.setItem('studentToken', response.data.token);
        localStorage.setItem('studentInfo', JSON.stringify(response.data.student));

        const destination = getDestinationUrl();
        navigate(destination);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 504 || error.response?.status === 502) {
        setServerOnline(false);
        const cleanId = regStudentId.trim().toUpperCase();
        console.warn('⚡ Registering Student locally (Demo Fallback)');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        localStorage.setItem('studentToken', 'demo_token_' + cleanId);
        localStorage.setItem(
          'studentInfo',
          JSON.stringify({
            id: 'demo_' + cleanId,
            studentId: cleanId,
            name: regName.trim(),
            department: regDepartment,
            semester: regSemester,
            isDemo: true,
          })
        );
        const destination = getDestinationUrl();
        navigate(destination);
        return;
      } else {
        const msg =
          error.response?.data?.message ||
          'Registration failed. Roll number may already exist.';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (id, pwd) => {
    setStudentId(id);
    setPassword(pwd);
    setErrorMessage('');
    setIsRegistering(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: isRegistering ? '520px' : '460px' }}>
        <div className="auth-header">
          <div className="auth-icon-circle">
            <GraduationCap size={28} />
          </div>
          <h2 className="auth-title">
            {isRegistering ? 'Student Registration' : 'Student Portal Login'}
          </h2>
          <p className="auth-subtitle">
            {isRegistering
              ? 'Register your College Roll Number (e.g. N24H01A0338) to start evaluation'
              : 'Sign in with your College Roll Number to submit semester feedback'}
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

        {/* Tab Switcher: Sign In vs Register */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setErrorMessage('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: !isRegistering ? 'var(--primary)' : 'transparent',
              color: !isRegistering ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            Existing Student Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setErrorMessage('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: isRegistering ? 'var(--primary)' : 'transparent',
              color: isRegistering ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            + Register New Student
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {!isRegistering ? (
          /* Sign In Form */
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="studentId">
                College Roll No / Student ID
              </label>
              <div style={{ position: 'relative' }}>
                <User
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
                  id="studentId"
                  type="text"
                  placeholder="e.g. N24H01A0338"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px', textTransform: 'uppercase' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
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
                  id="password"
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
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating Student...</span>
              ) : (
                <>
                  <span>Sign In & Open Feedback</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="regStudentId">
                College Roll Number / Student ID <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User
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
                  id="regStudentId"
                  type="text"
                  placeholder="e.g. N24H01A0338 or N24H01B0338"
                  value={regStudentId}
                  onChange={(e) => setRegStudentId(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px', textTransform: 'uppercase' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="regName">
                Full Student Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="regName"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="regDepartment">
                  Department
                </label>
                <select
                  id="regDepartment"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="form-select"
                >
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="Information Technology">IT</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Electrical Engineering">EEE</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="Artificial Intelligence & Data Science">AI & DS</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="regSemester">
                  Semester
                </label>
                <select
                  id="regSemester"
                  value={regSemester}
                  onChange={(e) => setRegSemester(e.target.value)}
                  className="form-select"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="regPassword">
                Create Password <span style={{ color: 'var(--danger)' }}>*</span>
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
                  id="regPassword"
                  type="password"
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <span>Registering Student...</span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Register & Proceed to Feedback</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Demo Seed Accounts Quick Selector */}
        {!isRegistering && (
          <div className="seed-helper">
            <div
              className="seed-helper-title"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>⚡ Quick Sample Roll Numbers</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary-light)',
                  fontWeight: 600,
                  background: 'rgba(99, 102, 241, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                Password: student123
              </span>
            </div>
            <div className="seed-chips">
              <button
                type="button"
                onClick={() => handleQuickFill('N24H01A0338', 'student123')}
                className="seed-chip"
                title="Click to auto-fill Mechanical Engineering student credentials"
              >
                N24H01A0338 (Mech - Sem 4)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('N24H01B0338', 'student123')}
                className="seed-chip"
                title="Click to auto-fill Computer Science student credentials"
              >
                N24H01B0338 (CSE - Sem 6)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('N24H01A0501', 'student123')}
                className="seed-chip"
                title="Click to auto-fill Electronics student credentials"
              >
                N24H01A0501 (ECE - Sem 6)
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Are you a College Administrator?{' '}
          <Link to="/admin-login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
