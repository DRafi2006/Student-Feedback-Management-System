import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  BookOpen,
  Star,
  TrendingUp,
  RefreshCw,
  Award,
  MessageSquare,
  CheckCircle,
  GraduationCap,
  QrCode,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import FeedbackTable from '../components/FeedbackTable';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState('');
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    if (isRefresh) setRefreshing(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Fetch aggregated stats and full feedback records in parallel
      const [statsRes, feedbackRes] = await Promise.all([
        axios.get('/api/admin/dashboard', config),
        axios.get('/api/feedback', config),
      ]);

      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (feedbackRes.data && feedbackRes.data.success) {
        setFeedbackList(feedbackRes.data.feedback);
      }

      if (isRefresh) {
        setNotification('Dashboard data refreshed with latest student evaluations');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response && error.response.status === 401 && !token.startsWith('demo_')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin-login');
      } else {
        // Populate fallback demo stats and feedback records for offline/demo sessions
        const localFeedbacks = JSON.parse(localStorage.getItem('local_evaluations') || '[]');
        const defaultSampleFeedbacks = [
          {
            _id: 'sample_fb_1',
            studentId: 'N24H01A0338',
            studentName: 'Rahul Sharma',
            department: 'Mechanical Engineering',
            semester: '4',
            subject: 'Thermodynamics & Heat Transfer',
            facultyName: 'Dr. K. Srinivas',
            overallRating: 5,
            teachingQuality: 5,
            communication: 5,
            courseUnderstanding: 4,
            comments: 'Excellent numerical explanations and practical lab demonstrations. Very supportive faculty.',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'sample_fb_2',
            studentId: 'N24H01B0338',
            studentName: 'Priya Reddy',
            department: 'Computer Science & Engineering',
            semester: '6',
            subject: 'Database Management Systems',
            facultyName: 'Prof. M. Ramesh',
            overallRating: 5,
            teachingQuality: 5,
            communication: 4,
            courseUnderstanding: 5,
            comments: 'Loved the real-world query optimization examples and interactive lab projects.',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'sample_fb_3',
            studentId: 'N24H01A0501',
            studentName: 'Ananya Verma',
            department: 'Electronics & Communication',
            semester: '6',
            subject: 'VLSI Design & Embedded Systems',
            facultyName: 'Dr. V. Lakshmi',
            overallRating: 4,
            teachingQuality: 4,
            communication: 5,
            courseUnderstanding: 4,
            comments: 'Great industry relevant insights and hands-on simulation tools.',
            createdAt: new Date().toISOString(),
          },
        ];

        const combinedList = [...localFeedbacks, ...defaultSampleFeedbacks];
        setFeedbackList(combinedList);

        const total = combinedList.length;
        const avg = total > 0 ? (combinedList.reduce((acc, f) => acc + (f.overallRating || 0), 0) / total).toFixed(1) : 0;
        const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        combinedList.forEach((f) => {
          if (dist[f.overallRating] !== undefined) dist[f.overallRating]++;
        });

        setStats({
          totalFeedback: total,
          averageRating: parseFloat(avg),
          totalSubjects: new Set(combinedList.map((f) => f.subject)).size,
          uniqueStudents: new Set(combinedList.map((f) => f.studentId)).size,
          criteriaAverages: {
            teachingQuality: 4.7,
            communication: 4.6,
            courseUnderstanding: 4.4,
          },
          ratingDistribution: dist,
          subjectStats: [
            { subject: 'Thermodynamics & Heat Transfer', facultyName: 'Dr. K. Srinivas', department: 'Mechanical Engineering', count: 1, avgRating: 5.0 },
            { subject: 'Database Management Systems', facultyName: 'Prof. M. Ramesh', department: 'Computer Science & Engineering', count: 1, avgRating: 5.0 },
            { subject: 'VLSI Design & Embedded Systems', facultyName: 'Dr. V. Lakshmi', department: 'Electronics & Communication', count: 1, avgRating: 4.0 },
          ],
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to remove this feedback evaluation?')) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotification('Evaluation record deleted successfully');
      setTimeout(() => setNotification(''), 3000);
      fetchDashboardData(true);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete feedback record.');
    }
  };

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{"username":"admin"}');

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--secondary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Computing institutional statistics...</p>
      </div>
    );
  }

  const ratingDist = stats?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalCount = stats?.totalFeedback || 0;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="role-pill admin">Academic Admin</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Logged in as <strong>{adminInfo.username}</strong>
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>CDU Institutional Feedback & Evaluation Analytics</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/qr-generator')}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.875rem' }}
          >
            <QrCode size={16} />
            <span>Generate Instructor QR</span>
          </button>

          <button
            onClick={() => fetchDashboardData(true)}
            className="btn btn-secondary"
            disabled={refreshing}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.875rem' }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh Records'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Primary Key Metric Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Feedback"
          value={stats?.totalFeedback || 0}
          subtitle="All-time student evaluations"
          icon={MessageSquare}
          accentColor="#6366F1"
        />

        <StatCard
          title="Average Rating"
          value={stats?.averageRating || '0.0'}
          subtitle="Overall college evaluation score"
          icon={Star}
          accentColor="#F59E0B"
          isRating={true}
        />

        <StatCard
          title="Total Subjects"
          value={stats?.totalSubjects || 0}
          subtitle="Distinct evaluated courses"
          icon={BookOpen}
          accentColor="#06B6D4"
        />

        <StatCard
          title="Students Participated"
          value={stats?.studentsSubmittedCount || 0}
          subtitle="Unique student roll numbers"
          icon={Users}
          accentColor="#10B981"
        />
      </div>

      {/* 3 Detailed Criteria Average Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#E2E8F0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="#8B5CF6" />
          <span>Evaluation Criteria Score Breakdown</span>
        </h3>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {/* Teaching Quality */}
          <div className="glass-card" style={{ borderLeft: '4px solid #10B981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>TEACHING QUALITY</span>
              <Award size={18} color="#10B981" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <span className="stat-value">{stats?.avgTeachingQuality || '0.0'}</span>
              <span style={{ color: '#6EE7B7', fontSize: '0.9rem', fontWeight: 600 }}>/ 5.0</span>
            </div>
            <div className="breakdown-progress-bg">
              <div
                className="breakdown-progress-fill"
                style={{
                  width: `${((stats?.avgTeachingQuality || 0) / 5) * 100}%`,
                  background: 'linear-gradient(90deg, #059669, #10B981)',
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Pedagogy, laboratory sessions & concept clarity
            </div>
          </div>

          {/* Communication */}
          <div className="glass-card" style={{ borderLeft: '4px solid #6366F1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>FACULTY INTERACTION</span>
              <MessageSquare size={18} color="#6366F1" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <span className="stat-value">{stats?.avgCommunication || '0.0'}</span>
              <span style={{ color: '#A5B4FC', fontSize: '0.9rem', fontWeight: 600 }}>/ 5.0</span>
            </div>
            <div className="breakdown-progress-bg">
              <div
                className="breakdown-progress-fill"
                style={{
                  width: `${((stats?.avgCommunication || 0) / 5) * 100}%`,
                  background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Doubt clarification, responsiveness & guidance
            </div>
          </div>

          {/* Course Understanding */}
          <div className="glass-card" style={{ borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>COURSE UNDERSTANDING</span>
              <BookOpen size={18} color="#F59E0B" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <span className="stat-value">{stats?.avgCourseUnderstanding || '0.0'}</span>
              <span style={{ color: '#FCD34D', fontSize: '0.9rem', fontWeight: 600 }}>/ 5.0</span>
            </div>
            <div className="breakdown-progress-bg">
              <div
                className="breakdown-progress-fill"
                style={{
                  width: `${((stats?.avgCourseUnderstanding || 0) / 5) * 100}%`,
                  background: 'linear-gradient(90deg, #D97706, #FBBF24)',
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Curriculum depth & learning outcomes
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visual Breakdown: Rating Distribution & Subject Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Rating Distribution */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={18} color="#FBBF24" />
            <span>Overall Score Distribution</span>
          </h3>

          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDist[stars] || 0;
            const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : 0;
            return (
              <div key={stars} className="breakdown-bar">
                <div className="breakdown-label" style={{ width: '80px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{stars}</span>
                  <Star size={12} fill="#FBBF24" color="#FBBF24" />
                </div>
                <div className="breakdown-progress-bg">
                  <div
                    className="breakdown-progress-fill"
                    style={{
                      width: `${percentage}%`,
                      background:
                        stars >= 4
                          ? 'linear-gradient(90deg, #10B981, #34D399)'
                          : stars === 3
                          ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                          : 'linear-gradient(90deg, #EF4444, #F87171)',
                    }}
                  />
                </div>
                <div className="breakdown-val">
                  {count} <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subject-Wise Rating Breakdown */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={18} color="#6366F1" />
            <span>Top Rated Subjects & Faculty</span>
          </h3>

          {stats?.subjectBreakdown && stats.subjectBreakdown.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(showAllSubjects ? stats.subjectBreakdown : stats.subjectBreakdown.slice(0, 4)).map((sub, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F1F5F9' }}>
                      {sub.subject}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {sub.facultyName} • {sub.count} {sub.count === 1 ? 'evaluation' : 'evaluations'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="rating-pill">
                      <Star size={13} fill="#FBBF24" />
                      <span>{sub.avgRating} / 5</span>
                    </span>
                  </div>
                </div>
              ))}

              {stats.subjectBreakdown.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllSubjects(!showAllSubjects)}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem', fontSize: '0.8rem', marginTop: '0.25rem' }}
                >
                  {showAllSubjects ? 'Show Top 4 Courses' : `Show All Courses (${stats.subjectBreakdown.length})`}
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No subject evaluations recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Full Feedback Records Table */}
      <FeedbackTable
        feedbackList={feedbackList}
        onDeleteFeedback={handleDeleteFeedback}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
