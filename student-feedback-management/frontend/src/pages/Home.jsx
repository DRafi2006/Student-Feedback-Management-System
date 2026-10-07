import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  BookOpen,
  UserCheck,
} from 'lucide-react';

const Home = () => {
  const studentToken = localStorage.getItem('studentToken');
  const adminToken = localStorage.getItem('adminToken');

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Award size={16} />
          <span>Academic Quality Assurance Portal</span>
        </div>

        <h1 className="hero-title">
          College <span className="hero-title-gradient">Student Feedback</span> & Evaluation System
        </h1>

        <p className="hero-desc">
          An official, secure digital platform for students to evaluate semester courses and faculty teaching pedagogy.
          Empowering academic excellence through real-time feedback and actionable institutional analytics.
        </p>

        {/* Action Portal Cards */}
        <div className="hero-portal-cards">
          {/* Student Portal */}
          <div className="portal-card">
            <div>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  marginBottom: '1.25rem',
                }}
              >
                <GraduationCap size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Student Portal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Log in or register with your College Roll Number (e.g. N24H01A0338) to submit course evaluations across teaching quality, communication, and course understanding.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#10B981" /> Verified College Roll Number / ID
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#10B981" /> 4-Factor Rating & Review Criteria
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#10B981" /> Confidential & Instant Submission
                </div>
              </div>
            </div>

            <Link
              to={studentToken ? '/feedback' : '/student-login'}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <span>{studentToken ? 'Go to Feedback Form' : 'Student Login / Register'}</span>
              <ArrowRight size={17} />
            </Link>
          </div>

          {/* Admin Portal */}
          <div className="portal-card admin">
            <div>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--secondary)',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Department & Admin Portal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Authorized access for Department Heads and Academic Committee to review student evaluations, faculty score averages, and feedback reports.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={16} color="#8B5CF6" /> Real-time Departmental Metrics
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={16} color="#8B5CF6" /> Subject & Faculty Performance Deep-Dive
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} color="#8B5CF6" /> Authenticated Administration Access
                </div>
              </div>
            </div>

            <Link
              to={adminToken ? '/dashboard' : '/admin-login'}
              className="btn btn-outline-admin"
              style={{ width: '100%' }}
            >
              <span>{adminToken ? 'Open Admin Dashboard' : 'Admin Login'}</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ marginTop: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Institutional Quality Highlights</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Designed to meet academic accreditation standards and elevate continuous teaching improvement.
          </p>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="glass-card">
            <div style={{ color: '#6366F1', marginBottom: '0.75rem' }}><BookOpen size={26} /></div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Accredited Evaluation Matrix</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Multi-dimensional evaluation covering teaching quality, faculty interaction, and syllabus coverage.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ color: '#10B981', marginBottom: '0.75rem' }}><UserCheck size={26} /></div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Roll Number Verification</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Individual student credentials with department and semester tagging for accurate data tracking.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ color: '#8B5CF6', marginBottom: '0.75rem' }}><BarChart3 size={26} /></div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Actionable Analytics</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Live score aggregations and statistical breakdowns for faculty appraisals and academic audits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
