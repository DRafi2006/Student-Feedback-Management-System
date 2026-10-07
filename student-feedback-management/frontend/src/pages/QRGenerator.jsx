import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import {
  QrCode,
  Printer,
  Copy,
  Check,
  ExternalLink,
  User,
  BookOpen,
  GraduationCap,
  Sparkles,
  Wifi,
  RefreshCw,
  Info,
} from 'lucide-react';

const FACULTY_LIST = [
  { faculty: 'Dr. K. Srinivas', subject: 'Thermodynamics & Heat Transfer', department: 'Mechanical Engineering' },
  { faculty: 'Prof. M. Ramesh', subject: 'Database Management Systems', department: 'Computer Science & Engineering' },
  { faculty: 'Dr. V. Lakshmi', subject: 'VLSI Design & Embedded Systems', department: 'Electronics & Communication' },
  { faculty: 'Dr. S. Anjaneyulu', subject: 'Operating Systems & System Programming', department: 'Computer Science & Engineering' },
  { faculty: 'Dr. P. Venkat', subject: 'Artificial Intelligence & Machine Learning', department: 'Computer Science & Engineering' },
  { faculty: 'Prof. G. Sneha', subject: 'Web Technologies & Full Stack Dev', department: 'Information Technology' },
  { faculty: 'Prof. R. Narayanan', subject: 'Computer Networks & Cyber Security', department: 'Information Technology' },
  { faculty: 'Dr. T. Balaji', subject: 'Fluid Mechanics & Hydraulic Machines', department: 'Mechanical Engineering' },
];

const QRGenerator = () => {
  const [facultyName, setFacultyName] = useState('Dr. K. Srinivas');
  const [subject, setSubject] = useState('Thermodynamics & Heat Transfer');
  const [department, setDepartment] = useState('Mechanical Engineering');
  const [copied, setCopied] = useState(false);

  // Network Host / IP address state
  const [hostIp, setHostIp] = useState('10.10.10.86');
  const [port, setPort] = useState('3000');
  const [loadingIp, setLoadingIp] = useState(false);

  // Auto-detect computer's real Wi-Fi LAN IP
  const detectNetworkIp = async () => {
    setLoadingIp(true);
    try {
      // If current browser is accessed via an IP address (e.g. 10.10.10.86:3000), use that
      if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setHostIp(window.location.hostname);
        setPort(window.location.port || '3000');
        setLoadingIp(false);
        return;
      }

      const res = await axios.get('/api/network-ip');
      if (res.data && res.data.ip) {
        setHostIp(res.data.ip);
      }
    } catch (e) {
      console.warn('Could not auto-fetch LAN IP from backend, using fallback:', e);
      // Fallback to detected Wi-Fi IP
      setHostIp('10.10.10.86');
    } finally {
      setLoadingIp(false);
    }
  };

  useEffect(() => {
    detectNetworkIp();
  }, []);

  // Compute final mobile-scannable URL
  const baseUrl = `http://${hostIp}:${port}`;
  const targetUrl = `${baseUrl}/feedback?faculty=${encodeURIComponent(facultyName)}&subject=${encodeURIComponent(subject)}&dept=${encodeURIComponent(department)}`;

  const handleSelectPreset = (item) => {
    setFacultyName(item.faculty);
    setSubject(item.subject);
    setDepartment(item.department);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="hero-pill" style={{ margin: '0 auto 1rem' }}>
          <QrCode size={16} />
          <span>Classroom QR Code Evaluation Hub</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Instructor <span className="hero-title-gradient">QR Feedback</span> Generator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
          Generate mobile-scannable QR codes for faculty members. Students can scan this with any smartphone camera in class to open the evaluation form with instructor and course details pre-filled.
        </p>
      </div>

      {/* Network Notice Bar */}
      <div
        className="glass-card"
        style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '2rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Wifi size={22} color="#34D399" />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>
              Wi-Fi / LAN Host IP: <span style={{ color: '#6EE7B7', fontFamily: 'monospace', fontSize: '0.95rem' }}>{hostIp}:{port}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#D1FAE5' }}>
              Connect your smartphone to the same Wi-Fi / Hotspot network to scan seamlessly.
            </div>
          </div>
        </div>

        <button
          onClick={detectNetworkIp}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          disabled={loadingIp}
        >
          <RefreshCw size={13} className={loadingIp ? 'animate-spin' : ''} />
          <span>{loadingIp ? 'Detecting...' : 'Detect Wi-Fi IP'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Configuration Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sparkles size={20} color="var(--primary)" />
            <span>Customize Instructor QR Code</span>
          </h3>

          {/* Quick Preset Selector */}
          <div className="form-group">
            <label className="form-label">
              Select Preset Course & Faculty:
            </label>
            <select
              onChange={(e) => {
                const found = FACULTY_LIST.find((f) => f.faculty === e.target.value);
                if (found) handleSelectPreset(found);
              }}
              className="form-select"
              value={facultyName}
            >
              {FACULTY_LIST.map((item, idx) => (
                <option key={idx} value={item.faculty}>
                  {item.faculty} — {item.subject} ({item.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="facultyInput">
              Faculty / Instructor Name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                id="facultyInput"
                type="text"
                placeholder="e.g. Dr. K. Srinivas"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="subjectInput">
              Subject / Course Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <BookOpen size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                id="subjectInput"
                type="text"
                placeholder="e.g. Thermodynamics & Heat Transfer"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="deptInput">
              Department
            </label>
            <select
              id="deptInput"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="form-select"
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

          {/* Wi-Fi Host IP Customizer */}
          <div className="form-group">
            <label className="form-label" htmlFor="hostIpInput" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wifi size={14} color="#10B981" />
              <span>Computer Wi-Fi IP Address (for Mobile QR)</span>
            </label>
            <input
              id="hostIpInput"
              type="text"
              placeholder="e.g. 10.10.10.86"
              value={hostIp}
              onChange={(e) => setHostIp(e.target.value)}
              className="form-input"
              style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: '140px' }}
            >
              {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: '140px' }}
            >
              <ExternalLink size={16} />
              <span>Test Form</span>
            </a>
          </div>
        </div>

        {/* Printable QR Code Poster Card */}
        <div
          id="printable-qr-poster"
          className="glass-card"
          style={{
            padding: '2.25rem',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '2px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', color: '#A5B4FC', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
              <GraduationCap size={15} />
              <span>OFFICIAL COURSE EVALUATION</span>
            </div>

            <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>
              {facultyName || 'Instructor Name'}
            </h2>
            <p style={{ color: '#93C5FD', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              {subject || 'Course Title'}
            </p>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              {department}
            </p>

            {/* QR Code Container with High Contrast & Margin */}
            <div
              style={{
                background: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.3)',
                display: 'inline-block',
                margin: '0 auto 1.5rem',
              }}
            >
              <QRCodeSVG
                value={targetUrl}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: '#CBD5E1', marginBottom: '1.25rem' }}>
              📱 <strong>Scan with your smartphone camera</strong> to evaluate <strong>{facultyName}</strong>.
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', wordBreak: 'break-all', fontFamily: 'monospace', marginBottom: '1rem' }}>
              {targetUrl}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
          >
            <Printer size={18} />
            <span>Print Classroom QR Poster</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
