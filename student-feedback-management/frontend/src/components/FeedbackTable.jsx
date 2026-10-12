import React, { useState } from 'react';
import { Star, Search, Filter, MessageSquare, Trash2, Calendar, BookOpen, Download } from 'lucide-react';

const FeedbackTable = ({ feedbackList = [], onDeleteFeedback, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  const getDeptBadgeClass = (dept) => {
    const d = dept?.toLowerCase() || '';
    if (d.includes('computer') || d.includes('cse') || d.includes('cs')) return 'badge-cs';
    if (d.includes('information') || d.includes('it')) return 'badge-it';
    if (d.includes('mechanical') || d.includes('mech')) return 'badge-ee';
    if (d.includes('electronics') || d.includes('ece')) return 'badge-it';
    return 'badge-default';
  };

  const departments = ['All', ...new Set(feedbackList.map((f) => f.department).filter(Boolean))];

  const filteredFeedbacks = feedbackList.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.facultyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comments?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      departmentFilter === 'All' || item.department === departmentFilter;

    const matchesRating =
      ratingFilter === 'All' || item.overallRating === Number(ratingFilter);

    return matchesSearch && matchesDept && matchesRating;
  });

  const handleExportCSV = () => {
    if (filteredFeedbacks.length === 0) {
      alert('No feedback records to export.');
      return;
    }

    const headers = ['Student ID', 'Student Name', 'Department', 'Semester', 'Subject', 'Faculty Name', 'Overall Rating', 'Teaching Quality', 'Communication', 'Course Understanding', 'Comments', 'Submitted Date'];
    const rows = filteredFeedbacks.map((f) => [
      `"${f.studentId}"`,
      `"${f.studentName}"`,
      `"${f.department}"`,
      `"${f.semester}"`,
      `"${f.subject}"`,
      `"${f.facultyName}"`,
      f.overallRating,
      f.teachingQuality,
      f.communication,
      f.courseUnderstanding,
      `"${(f.comments || '').replace(/"/g, '""')}"`,
      `"${new Date(f.createdAt || Date.now()).toLocaleDateString()}"`,
    ]);

    const csvRows = [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', blobUrl);
    link.setAttribute('download', `Student_Feedback_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="#6366F1" />
            <span>Student Feedback & Evaluation Records</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              ({filteredFeedbacks.length} submissions)
            </span>
          </h3>
        </div>

        {/* Filter controls & CSV Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Search roll no, faculty, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', paddingRight: '12px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="var(--text-faint)" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
            <option value="2">2 Stars ⭐⭐</option>
            <option value="1">1 Star ⭐</option>
          </select>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem' }}
            title="Export filtered records to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.85rem', fontSize: '0.9rem' }}>Loading evaluation records...</p>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
          <MessageSquare size={40} color="var(--text-faint)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', color: '#E2E8F0', marginBottom: '0.25rem' }}>No feedback submissions found</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {searchTerm || departmentFilter !== 'All' || ratingFilter !== 'All'
              ? 'Try resetting your search query or department filter.'
              : 'Students can sign in or register with their College Roll Number to submit evaluations.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student & Roll No</th>
                <th>Dept & Semester</th>
                <th>Subject & Faculty</th>
                <th style={{ textAlign: 'center' }}>Overall Score</th>
                <th>Criteria Breakdown</th>
                <th>Comments / Feedback</th>
                <th>Submitted</th>
                {onDeleteFeedback && <th style={{ textAlign: 'center' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((item) => (
                <tr key={item._id}>
                  {/* Student Details */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{item.studentName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#818CF8', fontFamily: 'monospace', fontWeight: 600 }}>
                      {item.studentId}
                    </div>
                  </td>

                  {/* Dept & Sem */}
                  <td>
                    <span className={`table-badge ${getDeptBadgeClass(item.department)}`}>
                      {item.department}
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '3px' }}>
                      Semester {item.semester}
                    </div>
                  </td>

                  {/* Subject & Faculty */}
                  <td>
                    <div style={{ fontWeight: 600, color: '#E2E8F0' }}>{item.subject}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      👨‍🏫 {item.facultyName}
                    </div>
                  </td>

                  {/* Overall Rating */}
                  <td style={{ textAlign: 'center' }}>
                    <span className="rating-pill">
                      <Star size={14} fill="#FBBF24" />
                      <span>{item.overallRating} / 5</span>
                    </span>
                  </td>

                  {/* Detailed Scores */}
                  <td style={{ minWidth: '170px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div>Teaching: <strong style={{ color: '#6EE7B7' }}>{item.teachingQuality}/5</strong></div>
                      <div>Communication: <strong style={{ color: '#93C5FD' }}>{item.communication}/5</strong></div>
                      <div>Understanding: <strong style={{ color: '#FCD34D' }}>{item.courseUnderstanding}/5</strong></div>
                    </div>
                  </td>

                  {/* Comments */}
                  <td style={{ maxWidth: '280px' }}>
                    {item.comments ? (
                      <p style={{ fontSize: '0.825rem', color: '#CBD5E1', fontStyle: 'italic', lineHeight: 1.4 }}>
                        "{item.comments}"
                      </p>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>No comment provided</span>
                    )}
                  </td>

                  {/* Date */}
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                      {new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Action */}
                  {onDeleteFeedback && (
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => onDeleteFeedback(item._id)}
                        className="btn-logout"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedbackTable;
