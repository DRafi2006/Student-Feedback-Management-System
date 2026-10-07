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
} from 'lucide-react';

const COMMON_SUBJECTS = [
  { subject: 'Thermodynamics & Heat Transfer', faculty: 'Dr. K. Srinivas' },
  { subject: 'Database Management Systems', faculty: 'Prof. M. Ramesh' },
  { subject: 'VLSI Design & Embedded Systems', faculty: 'Dr. V. Lakshmi' },
  { subject: 'Operating Systems & System Programming', faculty: 'Dr. S. Anjaneyulu' },
  { subject: 'Artificial Intelligence & Machine Learning', faculty: 'Dr. P. Venkat' },
  { subject: 'Web Technologies & Full Stack Dev', faculty: 'Prof. G. Sneha' },
  { subject: 'Computer Networks & Cyber Security', faculty: 'Prof. R. Narayanan' },
  { subject: 'Fluid Mechanics & Hydraulic Machines', faculty: 'Dr. T. Balaji' },
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
  const [student, setStudent] = useState(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [teachingQuality, setTeachingQuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [courseUnderstanding, setCourseUnderstanding] = useState(5);
  const [comments, setComments] = useState('');
  const [isQrScanned, setIsQrScanned] = useState(false);

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    const storedInfo = localStorage.getItem('studentInfo');

    if (!token || !storedInfo) {
      // Remember query params if any so student returns here after login
      const currentQuery = window.location.search;
      navigate(`/student-login${currentQuery ? '?redirect=' + encodeURIComponent('/feedback' + currentQuery) : ''}`);
      return;
    }

    try {
      const parsed = JSON.parse(storedInfo);
      setStudent(parsed);
    } catch (e) {
      navigate('/student-login');
    }

    // Check for QR Code pre-filled parameters in URL
    const queryFaculty = searchParams.get('faculty');
    const querySubject = searchParams.get('subject');

    if (queryFaculty || querySubject) {
      if (queryFaculty) setFacultyName(queryFaculty);
      if (querySubject) setSubject(querySubject);
      setIsQrScanned(true);
    }
  }, [navigate, searchParams]);

  const handleSubjectSelect = (e) => {
    const selectedTitle = e.target.value;
    if (selectedTitle) {
      setSubject(selectedTitle);
      const found = COMMON_SUBJECTS.find((s) => s.subject === selectedTitle);
      if (found) {
        setFacultyName(found.faculty);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!student) {
      setErrorMessage('Student session missing. Please log in again.');
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
        studentId: student.studentId,
        studentName: student.name,
        department: student.department,
        semester: student.semester,
        subject: subject.trim(),
        facultyName: facultyName.trim(),
        overallRating,
        teachingQuality,
        communication,
        courseUnderstanding,
        comments: comments.trim(),
      };

      const token = localStorage.getItem('studentToken');
      const response = await axios.post('/api/feedback', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.success) {
        setSuccessMessage('Feedback submitted successfully.');
        setSubmittedFeedback(response.data.feedback);

        // Reset form fields
        setSubject('');
        setFacultyName('');
        setComments('');
        setOverallRating(5);
        setTeachingQuality(5);
        setCommunication(5);
        setCourseUnderstanding(5);
        setIsQrScanned(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      const msg =
        error.response?.data?.message ||
        'Failed to save feedback evaluation. Please check required fields and retry.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!student) {
    return null;
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Student Profile Banner */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/qr-generator" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <QrCode size={14} />
              <span>QR Hub</span>
            </Link>
            <div className="role-pill student">
              Verified Student
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Scanned Badge */}
      {isQrScanned && facultyName && (
        <div
          className="glass-card"
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <QrCode size={24} color="#818CF8" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E2E8F0' }}>
              🎯 Pre-filled from Faculty QR Code
            </div>
            <div style={{ fontSize: '0.825rem', color: '#A5B4FC' }}>
              Evaluating <strong>{facultyName}</strong> for <strong>{subject || 'Course'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
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
                Your feedback evaluation has been recorded. The Department Head and Academic Committee will review these aggregated analytics.
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
            <span>Course & Faculty Evaluation Form</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Please evaluate your course and instructor based on syllabus execution, classroom delivery, and responsiveness.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Preset Subject Selector */}
          <div className="form-group">
            <label className="form-label">
              Quick Select Course (or type directly below):
            </label>
            <select
              onChange={handleSubjectSelect}
              className="form-select"
              value={subject}
            >
              <option value="">-- Choose from standard curriculum courses or enter custom below --</option>
              {COMMON_SUBJECTS.map((item) => (
                <option key={item.subject} value={item.subject}>
                  {item.subject} ({item.faculty})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="subject">
                Subject / Course Title <span style={{ color: 'var(--danger)' }}>*</span>
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
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="facultyName">
                Faculty / Instructor Name <span style={{ color: 'var(--danger)' }}>*</span>
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
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  required
                />
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
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
                  <span>Submit Feedback</span>
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
