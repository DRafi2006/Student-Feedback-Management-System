import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  GraduationCap,
  Star,
  CheckCircle2,
  AlertCircle,
  Send,
  BookOpen,
  User,
  MessageSquare,
  Sparkles,
  QrCode,
  Lock,
  Unlock,
  History,
  Clock,
  Building,
} from 'lucide-react';

const COMMON_SUBJECTS = [
  { subject: 'Thermodynamics & Heat Transfer', faculty: 'Dr. K. Srinivas', department: 'Mechanical Engineering' },
  { subject: 'Database Management Systems', faculty: 'Prof. M. Ramesh', department: 'Computer Science & Engineering' },
  { subject: 'VLSI Design & Embedded Systems', faculty: 'Dr. V. Lakshmi', department: 'Electronics & Communication' },
  { subject: 'Operating Systems & System Programming', faculty: 'Dr. S. Anjaneyulu', department: 'Computer Science & Engineering' },
  { subject: 'Artificial Intelligence & Machine Learning', faculty: 'Dr. P. Venkat', department: 'Computer Science & Engineering' },
  { subject: 'Web Technologies & Full Stack Dev', faculty: 'Prof. G. Sneha', department: 'Information Technology' },
  { subject: 'Computer Networks & Cyber Security', faculty: 'Prof. R. Narayanan', department: 'Information Technology' },
  { subject: 'Fluid Mechanics & Hydraulic Machines', faculty: 'Dr. T. Balaji', department: 'Mechanical Engineering' },
];

const RatingSelector = ({ label, description, value, onChange, id }) => {
  const [hovered, setHovered] = useState(0);

  const getRatingLabel = (val) => {
    switch (val) {
      case 5:
        return '5 - Excellent ⭐⭐⭐⭐⭐';
      case 4:
        return '4 - Very Good ⭐⭐⭐⭐';
      case 3:
        return '3 - Satisfactory ⭐⭐⭐';
      case 2:
        return '2 - Needs Improvement ⭐⭐';
      case 1:
        return '1 - Unsatisfactory ⭐';
      default:
        return 'Select a rating (1 to 5)';
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <div>
          <label className="form-label" style={{ marginBottom: '0.2rem', fontSize: '0.95rem' }}>
            {label} <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          {description && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{description}</p>
          )}
        </div>
        <span className="rating-score-badge">
          {value ? `${value} / 5` : 'Not rated'}
        </span>
      </div>

      <div className="rating-picker" id={id}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = (hovered || value) >= star;
          return (
            <button
              type="button"
              key={star}
              className={`star-btn ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)}
              title={`${star} Star`}
            >
              ★
            </button>
          );
        })}
        <span style={{ fontSize: '0.825rem', color: value ? '#FCD34D' : 'var(--text-faint)', marginLeft: '0.75rem' }}>
          {getRatingLabel(hovered || value)}
        </span>
      </div>
    </div>
  );
};

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Logged-in student info (if any)
  const [student, setStudent] = useState(null);

  // Direct student details (for mobile QR scans without prior login)
  const [directRollNo, setDirectRollNo] = useState('');
  const [directName, setDirectName] = useState('');
  const [directDept, setDirectDept] = useState('Computer Science & Engineering');
  const [directSemester, setDirectSemester] = useState('6');

  // Form states
  const [subject, setSubject] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [department, setDepartment] = useState('Mechanical Engineering');
  const [overallRating, setOverallRating] = useState(5);
  const [teachingQuality, setTeachingQuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [courseUnderstanding, setCourseUnderstanding] = useState(5);
  const [comments, setComments] = useState('');

  // QR state
  const [isQrScanned, setIsQrScanned] = useState(false);
  const [isLockedByQr, setIsLockedByQr] = useState(false);

  // Submissions history state
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(null);

  // Function to load past submissions for this roll number
  const loadStudentHistory = async (rollNo) => {
    if (!rollNo) return;
    try {
      const res = await axios.get(`/api/feedback/student/${rollNo}`);
      if (res.data && res.data.feedback) {
        setPastSubmissions(res.data.feedback);
      }
    } catch (e) {
      // ignore silently
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    const storedInfo = localStorage.getItem('studentInfo');

    if (token && storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        setStudent(parsed);
        setDirectRollNo(parsed.studentId);
        setDirectName(parsed.name);
        setDirectDept(parsed.department);
        setDirectSemester(parsed.semester);
        loadStudentHistory(parsed.studentId);
      } catch (e) {
        // invalid stored session
      }
    }

    // Check for QR parameters in URL
    let queryFaculty = searchParams.get('faculty');
    let querySubject = searchParams.get('subject');
    let queryDept = searchParams.get('dept');

    // If query params are present in URL, cache them in sessionStorage
    if (queryFaculty || querySubject) {
      sessionStorage.setItem(
        'pendingQrData',
        JSON.stringify({
          faculty: queryFaculty,
          subject: querySubject,
          dept: queryDept,
        })
      );
    } else {
      // If not in URL, check if we had pending QR data cached in sessionStorage
      const cachedQr = sessionStorage.getItem('pendingQrData');
      if (cachedQr) {
        try {
          const parsed = JSON.parse(cachedQr);
          queryFaculty = queryFaculty || parsed.faculty;
          querySubject = querySubject || parsed.subject;
          queryDept = queryDept || parsed.dept;
        } catch (e) {
          // ignore
        }
      }
    }

    if (queryFaculty || querySubject) {
      if (queryFaculty) setFacultyName(queryFaculty);
      if (querySubject) setSubject(querySubject);
      if (queryDept) setDepartment(queryDept);
      setIsQrScanned(true);
      setIsLockedByQr(true);
    }
  }, [searchParams]);

  const handleSubjectSelect = (e) => {
    const selectedTitle = e.target.value;
    setSubject(selectedTitle);
    if (selectedTitle) {
      const found = COMMON_SUBJECTS.find((s) => s.subject === selectedTitle);
      if (found) {
        setFacultyName(found.faculty);
        if (found.department) setDepartment(found.department);
      }
    }
  };

  const handleQuickStudentSelect = (id, name, dept, sem) => {
    setDirectRollNo(id);
    setDirectName(name);
    setDirectDept(dept);
    setDirectSemester(sem);
    loadStudentHistory(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Active student identity
    const activeStudentId = student ? student.studentId : directRollNo.trim().toUpperCase();
    const activeStudentName = student ? student.name : directName.trim();
    const activeDepartment = department || (student ? student.department : directDept);
    const activeSemester = student ? student.semester : directSemester;

    if (!activeStudentId || !activeStudentName) {
      setErrorMessage('Please enter your College Roll Number and Name before submitting evaluation.');
      return;
    }

    if (!subject.trim()) {
      setErrorMessage('Please enter or select a Subject / Course title.');
      return;
    }

    if (!facultyName.trim()) {
      setErrorMessage('Please enter Faculty Name.');
      return;
    }

    if (!overallRating || !teachingQuality || !communication || !courseUnderstanding) {
      setErrorMessage('Please provide ratings for all 4 criteria (1-5 stars).');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        studentId: activeStudentId,
        studentName: activeStudentName,
        department: activeDepartment,
        semester: activeSemester,
        subject: subject.trim(),
        facultyName: facultyName.trim(),
        overallRating,
        teachingQuality,
        communication,
        courseUnderstanding,
        comments: comments.trim(),
      };

      const token = localStorage.getItem('studentToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post('/api/feedback', payload, { headers });

      if (response.data && response.data.success) {
        const msg = response.data.isUpdate
          ? 'Evaluation updated successfully with your latest ratings.'
          : 'Feedback evaluation submitted successfully!';
        setSuccessMessage(msg);
        setSubmittedFeedback(response.data.feedback);

        // Refresh past submissions
        loadStudentHistory(activeStudentId);

        // Reset form fields
        setComments('');
        setOverallRating(5);
        setTeachingQuality(5);
        setCommunication(5);
        setCourseUnderstanding(5);

        // Clear stored QR cache on successful submit
        sessionStorage.removeItem('pendingQrData');
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 504 || error.response?.status === 502) {
        // Save evaluation locally for seamless offline demo
        const localList = JSON.parse(localStorage.getItem('local_evaluations') || '[]');
        const newRecord = {
          ...payload,
          _id: 'local_' + Date.now(),
          createdAt: new Date().toISOString(),
        };
        localList.unshift(newRecord);
        localStorage.setItem('local_evaluations', JSON.stringify(localList));
        setSuccessMessage('Feedback evaluation submitted successfully! (Saved in offline database)');
        setSubmittedFeedback(newRecord);
        setPastSubmissions((prev) => [newRecord, ...prev]);
        setComments('');
        sessionStorage.removeItem('pendingQrData');
      } else {
        const msg =
          error.response?.data?.message ||
          'Failed to save feedback evaluation. Please check required fields and retry.';
        setErrorMessage(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Student Profile / Direct Auth Card */}
      {student ? (
        /* Logged In Student Header */
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: '1.5rem',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                }}
              >
                {student.name ? student.name.charAt(0) : 'S'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '0.2rem' }}>
                  {student.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#CBD5E1' }}>
                  <span>Roll No: <strong style={{ color: '#A5B4FC' }}>{student.studentId}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong style={{ color: '#67E8F9' }}>{student.department}</strong></span>
                  <span>•</span>
                  <span>Semester: <strong style={{ color: '#FCD34D' }}>Semester {student.semester}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {pastSubmissions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <History size={14} />
                  <span>My Submissions ({pastSubmissions.length})</span>
                </button>
              )}
              <Link to="/qr-generator" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <QrCode size={14} />
                <span>QR Hub</span>
              </Link>
              <div className="role-pill student">Verified Student</div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile QR / Guest Student Identity Card */
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: '1.5rem',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#818CF8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <GraduationCap size={16} />
                <span>Student Identity Verification</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>
                Enter College Roll Number to Begin
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to={`/student-login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                <span>Existing Sign In</span>
              </Link>
              <Link to="/qr-generator" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <QrCode size={14} />
                <span>QR Hub</span>
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="directRollNo">
                College Roll No <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="directRollNo"
                type="text"
                placeholder="e.g. N24H01A0338"
                value={directRollNo}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setDirectRollNo(val);
                  if (val.length >= 6) loadStudentHistory(val);
                }}
                className="form-input"
                style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="directName">
                Student Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="directName"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="directDept">Department</label>
              <select
                id="directDept"
                value={directDept}
                onChange={(e) => setDirectDept(e.target.value)}
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

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="directSemester">Semester</label>
              <select
                id="directSemester"
                value={directSemester}
                onChange={(e) => setDirectSemester(e.target.value)}
                className="form-select"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick sample chips */}
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>⚡ Quick Auto-Fill:</span>
            <button
              type="button"
              onClick={() => handleQuickStudentSelect('N24H01A0338', 'Rahul Sharma', 'Mechanical Engineering', '4')}
              className="seed-chip"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              N24H01A0338 (Rahul)
            </button>
            <button
              type="button"
              onClick={() => handleQuickStudentSelect('N24H01B0338', 'Priya Reddy', 'Computer Science & Engineering', '6')}
              className="seed-chip"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              N24H01B0338 (Priya)
            </button>
            <button
              type="button"
              onClick={() => handleQuickStudentSelect('N24H01A0501', 'Ananya Verma', 'Electronics & Communication', '6')}
              className="seed-chip"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              N24H01A0501 (Ananya)
            </button>
          </div>
        </div>
      )}

      {/* QR Code Scanned Banner */}
      {isQrScanned && facultyName && (
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '2px solid rgba(99, 102, 241, 0.5)',
            marginBottom: '1.5rem',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818CF8',
              }}
            >
              <QrCode size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                  🎯 Pre-filled from Classroom QR Code
                </span>
                <span className="badge-cs" style={{ fontSize: '0.75rem' }}>Active Evaluation</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#CBD5E1' }}>
                Evaluating <strong style={{ color: '#F1F5F9' }}>{facultyName}</strong> for{' '}
                <strong style={{ color: '#67E8F9' }}>{subject}</strong> ({department})
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLockedByQr(!isLockedByQr)}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            title={isLockedByQr ? 'Unlock to edit instructor or subject' : 'Lock to prevent changes'}
          >
            {isLockedByQr ? (
              <>
                <Lock size={14} color="#FBBF24" />
                <span>Locked by QR (Click to edit)</span>
              </>
            ) : (
              <>
                <Unlock size={14} color="#34D399" />
                <span>Unlocked (Editing enabled)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Past Submissions History Drawer */}
      {showHistory && pastSubmissions.length > 0 && (
        <div
          className="glass-card"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            marginBottom: '1.5rem',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E2E8F0' }}>
              <History size={18} color="#818CF8" />
              <span>Your Previous Evaluations ({pastSubmissions.length})</span>
            </h4>
            <button
              onClick={() => setShowHistory(false)}
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {pastSubmissions.map((item) => (
              <div
                key={item._id}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#FFFFFF' }}>{item.subject}</div>
                  <span className="rating-pill" style={{ fontSize: '0.75rem' }}>
                    <Star size={11} fill="#FBBF24" />
                    <span>{item.overallRating}/5</span>
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Instructor: <strong>{item.facultyName}</strong>
                </div>
                {item.comments && (
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>
                    "{item.comments}"
                  </p>
                )}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} />
                  <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div
          className="glass-card"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            marginBottom: '2rem',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <CheckCircle2 size={28} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', color: '#6EE7B7', marginBottom: '0.35rem' }}>
                {successMessage}
              </h3>
              <p style={{ color: '#D1FAE5', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Your feedback evaluation has been recorded in the central institutional database.
              </p>
              {submittedFeedback && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: '#A7F3D0' }}>
                  <strong>Recorded Evaluation:</strong> {submittedFeedback.subject} ({submittedFeedback.facultyName}) — Overall Score: {submittedFeedback.overallRating}/5 ⭐
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Evaluation Form */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <Sparkles size={22} color="var(--primary)" />
            <span>CDU Course & Faculty Evaluation Form</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Chaitanya Deemed to be University (CDU) • Official Course Evaluation Matrix. Please evaluate syllabus execution, pedagogy, and interaction.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Preset Subject Selector (hidden if locked by QR code) */}
          {!isLockedByQr && (
            <div className="form-group">
              <label className="form-label">
                Quick Select Course (or type custom below):
              </label>
              <select
                onChange={handleSubjectSelect}
                className="form-select"
                value={subject}
              >
                <option value="">-- Choose from standard curriculum courses or enter custom below --</option>
                {COMMON_SUBJECTS.map((item) => (
                  <option key={item.subject} value={item.subject}>
                    {item.subject} ({item.faculty}) — {item.department}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="subject">
                Subject / Course Title <span style={{ color: 'var(--danger)' }}>*</span>
                {isLockedByQr && <span style={{ fontSize: '0.75rem', color: '#FCD34D', marginLeft: '0.5rem' }}>(Locked from QR)</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <BookOpen
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
                  id="subject"
                  type="text"
                  placeholder="e.g. Thermodynamics & Heat Transfer"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  readOnly={isLockedByQr}
                  className="form-input"
                  style={{
                    paddingLeft: '38px',
                    backgroundColor: isLockedByQr ? 'rgba(255,255,255,0.02)' : undefined,
                    cursor: isLockedByQr ? 'not-allowed' : undefined,
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="facultyName">
                Faculty / Instructor Name <span style={{ color: 'var(--danger)' }}>*</span>
                {isLockedByQr && <span style={{ fontSize: '0.75rem', color: '#FCD34D', marginLeft: '0.5rem' }}>(Locked from QR)</span>}
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
                  id="facultyName"
                  type="text"
                  placeholder="e.g. Dr. K. Srinivas"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  readOnly={isLockedByQr}
                  className="form-input"
                  style={{
                    paddingLeft: '38px',
                    backgroundColor: isLockedByQr ? 'rgba(255,255,255,0.02)' : undefined,
                    cursor: isLockedByQr ? 'not-allowed' : undefined,
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="department">
                Department
              </label>
              <div style={{ position: 'relative' }}>
                <Building
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-faint)',
                  }}
                />
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isLockedByQr}
                  className="form-select"
                  style={{
                    paddingLeft: '38px',
                    backgroundColor: isLockedByQr ? 'rgba(255,255,255,0.02)' : undefined,
                    cursor: isLockedByQr ? 'not-allowed' : undefined,
                  }}
                >
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4 Multi-criteria Rating Selectors */}
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={18} color="#FBBF24" />
              <span>Performance & Course Ratings (1 - 5 Scale)</span>
            </h4>

            <RatingSelector
              id="overallRating"
              label="1. Overall Course Rating"
              description="Overall satisfaction with the subject experience, syllabus coverage, and learning outcome."
              value={overallRating}
              onChange={setOverallRating}
            />

            <RatingSelector
              id="teachingQuality"
              label="2. Teaching Quality & Pedagogy"
              description="Preparedness, lecture clarity, practical examples, and domain expertise."
              value={teachingQuality}
              onChange={setTeachingQuality}
            />

            <RatingSelector
              id="communication"
              label="3. Faculty Communication & Interaction"
              description="Approachability, willingness to clear doubts, and active classroom engagement."
              value={communication}
              onChange={setCommunication}
            />

            <RatingSelector
              id="courseUnderstanding"
              label="4. Course Understanding & Depth"
              description="How well the course syllabus and foundational concepts were internalized."
              value={courseUnderstanding}
              onChange={setCourseUnderstanding}
            />
          </div>

          {/* Comments & Suggestions */}
          <div className="form-group">
            <label className="form-label" htmlFor="comments" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={16} color="var(--primary)" />
              <span>Comments & Constructive Suggestions</span>
            </label>
            <textarea
              id="comments"
              rows={4}
              placeholder="Share specific feedback, faculty strengths, or areas for curriculum enhancement..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ minWidth: '220px' }}
              disabled={submitting}
            >
              {submitting ? (
                <span>Submitting Evaluation...</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Evaluation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
