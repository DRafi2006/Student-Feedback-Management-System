import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, AlertCircle, CheckCircle2, ArrowRight, Lock, User, Building, Calendar, UserPlus } from 'lucide-react';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRegistering, setIsRegistering] = useState(false);

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
        studentId: studentId.trim(),
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
      const msg =
        error.response?.data?.message ||
        'Authentication failed. Please check your College Roll No and Password.';
      setErrorMessage(msg);
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
        studentId: regStudentId.trim(),
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
      const msg =
        error.response?.data?.message ||
        'Registration failed. Roll number may already exist.';
      setErrorMessage(msg);
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
      <div className="auth-card" style={{ maxWidth: isRegistering ? '520px' : '450px' }}>
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
            <div className="seed-helper-title">⚡ Quick Sample Roll Numbers (Click to auto-fill)</div>
            <div className="seed-chips">
              <button
                type="button"
                onClick={() => handleQuickFill('N24H01A0338', 'student123')}
                className="seed-chip"
              >
                N24H01A0338 (Mech - Sem 4)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('N24H01B0338', 'student123')}
                className="seed-chip"
              >
                N24H01B0338 (CSE - Sem 6)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('N24H01A0501', 'student123')}
                className="seed-chip"
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
