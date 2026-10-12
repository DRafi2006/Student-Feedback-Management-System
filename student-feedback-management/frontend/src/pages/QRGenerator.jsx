import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
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
  Download,
  Camera,
  Upload,
  ArrowRight,
  Play,
  Square,
  Globe,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Smartphone,
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

const VERCEL_ONLINE_URL = 'https://student-feedback-management-system-flax.vercel.app';

const QRGenerator = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'scanner'

  // Teacher & Class details
  const [facultyName, setFacultyName] = useState('Dr. K. Srinivas');
  const [subject, setSubject] = useState('Thermodynamics & Heat Transfer');
  const [department, setDepartment] = useState('Mechanical Engineering');
  const [copied, setCopied] = useState(false);

  // Base URL defaults to the current active website / server (e.g. http://localhost:3000 or production domain)
  const getInitialBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  };

  const [baseUrl, setBaseUrl] = useState(getInitialBaseUrl);
  const [customUrlMode, setCustomUrlMode] = useState(false);

  // Scanner states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [fileScanLoading, setFileScanLoading] = useState(false);
  const qrScannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, [activeTab]);

  // Ensure baseUrl stays updated if user loads directly on production
  useEffect(() => {
    if (
      window.location.hostname &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const cleanBaseUrl = (baseUrl || VERCEL_ONLINE_URL).replace(/\/$/, '');
  const targetUrl = `${cleanBaseUrl}/feedback?faculty=${encodeURIComponent(facultyName)}&subject=${encodeURIComponent(subject)}&dept=${encodeURIComponent(department)}`;

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

  // Download QR code as PNG image
  const handleDownloadPng = () => {
    try {
      const svg = document.getElementById('generated-qrcode-svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 650;
      canvas.height = 650;

      img.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 35, 35, 580, 580);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        const cleanName = `CDU_${facultyName}_${subject}`.replace(/[^a-zA-Z0-9]/g, '_');
        downloadLink.download = `CDU_QR_${cleanName}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Download QR PNG error:', err);
      alert('Unable to download QR code image directly. You can use Print Classroom QR Poster or Copy Link.');
    }
  };

  // --- SCANNER FUNCTIONS ---
  const handleScanSuccess = (decodedText) => {
    stopCameraScanner();

    try {
      let faculty = '';
      let sub = '';
      let dept = '';

      if (decodedText.includes('faculty=') || decodedText.includes('subject=' || decodedText.includes('dept='))) {
        const urlObj = new URL(decodedText.startsWith('http') ? decodedText : `http://localhost/${decodedText}`);
        faculty = urlObj.searchParams.get('faculty') || '';
        sub = urlObj.searchParams.get('subject') || '';
        dept = urlObj.searchParams.get('dept') || '';
      }

      setScannedResult({
        raw: decodedText,
        faculty,
        subject: sub,
        department: dept,
      });
    } catch (err) {
      setScannedResult({
        raw: decodedText,
        faculty: '',
        subject: '',
        department: '',
      });
    }
  };

  const startCameraScanner = async () => {
    setCameraError('');
    setScannedResult(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      qrScannerRef.current = html5QrCode;

      setIsCameraActive(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera Scanner start error:', err);
      setIsCameraActive(false);
      setCameraError(
        'Unable to access camera. Check browser permissions or try Upload QR Image / 1-Click Simulation below.'
      );
    }
  };

  const stopCameraScanner = async () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current.clear();
      } catch (e) {}
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFileScanLoading(true);
    setCameraError('');
    setScannedResult(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-hidden');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      console.error('File scan error:', err);
      setCameraError('No valid QR code found in this image. Please upload a clear photo of the CDU QR code.');
    } finally {
      setFileScanLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSimulateScan = (item) => {
    setScannedResult({
      raw: `/feedback?faculty=${encodeURIComponent(item.faculty)}&subject=${encodeURIComponent(item.subject)}&dept=${encodeURIComponent(item.department)}`,
      faculty: item.faculty,
      subject: item.subject,
      department: item.department,
    });
  };

  const handleProceedToFeedback = () => {
    if (!scannedResult) return;
    const query = `?faculty=${encodeURIComponent(scannedResult.faculty || facultyName)}&subject=${encodeURIComponent(scannedResult.subject || subject)}&dept=${encodeURIComponent(scannedResult.department || department)}`;
    navigate(`/feedback${query}`);
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <div id="qr-reader-hidden" style={{ display: 'none' }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="hero-pill" style={{ margin: '0 auto 1rem' }}>
          <GraduationCap size={16} />
          <span>Chaitanya Deemed to be University (CDU)</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Teacher Feedback <span className="hero-title-gradient">QR Generator</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '680px', margin: '0 auto' }}>
          Select the teacher and class below to create an instant QR code. Any student can scan this with <strong>any phone</strong> (on 4G, 5G, or any internet) to immediately open and fill the feedback form!
        </p>
      </div>

      {/* Tab Switcher */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          padding: '6px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          maxWidth: '520px',
          margin: '0 auto 2rem',
          background: 'rgba(30, 41, 59, 0.7)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('generator')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: activeTab === 'generator' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'generator' ? '#FFFFFF' : 'var(--text-muted)',
            boxShadow: activeTab === 'generator' ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <QrCode size={17} />
          <span>1. Generate Teacher QR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: activeTab === 'scanner' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'scanner' ? '#FFFFFF' : 'var(--text-muted)',
            boxShadow: activeTab === 'scanner' ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Camera size={17} />
          <span>2. Test Camera Scanner</span>
        </button>
      </div>

      {activeTab === 'generator' ? (
        /* --- TAB 1: GENERATOR --- */
        <>
          {/* Universal Phone Notice Banner */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              marginBottom: '2rem',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34D399',
                  flexShrink: 0,
                }}
              >
                <Smartphone size={22} />
              </div>

              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span>Works on Any Phone</span>
                  <span className="badge-it" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7' }}>
                    ⚡ Universal Access
                  </span>
                </div>
                <div style={{ fontSize: '0.825rem', color: '#D1FAE5', marginTop: '2px' }}>
                  Students simply scan the QR code with their regular phone camera (on mobile data, 4G, 5G, or Wi-Fi). The feedback form opens immediately!
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCustomUrlMode(!customUrlMode)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#CBD5E1',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                {customUrlMode ? 'Hide Link Setting' : '⚙️ View Target Website'}
              </button>
            </div>
          </div>

          {/* Optional URL editor if user ever wants to switch between Vercel and local */}
          {customUrlMode && (
            <div
              className="glass-card"
              style={{
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', color: '#93C5FD' }}>
                Feedback Web Address (URL encoded into QR):
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => setBaseUrl(VERCEL_ONLINE_URL)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  Reset to Live Vercel App
                </button>
                {typeof window !== 'undefined' && window.location.origin && (
                  <button
                    type="button"
                    onClick={() => setBaseUrl(window.location.origin)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    Use Current Window URL
                  </button>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Left Card: Teacher & Subject Form */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Sparkles size={20} color="var(--primary)" />
                <span>Select or Enter Teacher & Class</span>
              </h3>

              {/* Quick Preset Selector */}
              <div className="form-group">
                <label className="form-label">
                  Quick Select Teacher:
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
                  Faculty / Teacher Name <span style={{ color: 'var(--danger)' }}>*</span>
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
                  Subject / Course Name <span style={{ color: 'var(--danger)' }}>*</span>
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

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: '130px' }}
                >
                  {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                  <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                <a
                  href={`/feedback?faculty=${encodeURIComponent(facultyName)}&subject=${encodeURIComponent(subject)}&dept=${encodeURIComponent(department)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: '130px' }}
                >
                  <ExternalLink size={16} />
                  <span>Test Form</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: '130px' }}
                  title="Download high-resolution QR Code image"
                >
                  <Download size={16} />
                  <span>Save QR</span>
                </button>
              </div>
            </div>

            {/* Right Card: Official CDU Printable QR Poster */}
            <div
              id="printable-qr-poster"
              className="glass-card"
              style={{
                padding: '2.25rem',
                textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                border: '2px solid rgba(99, 102, 241, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.18)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', color: '#A5B4FC', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  <GraduationCap size={16} />
                  <span>CHAITANYA DEEMED TO BE UNIVERSITY (CDU)</span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#93C5FD', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.75rem' }}>
                  STUDENT FEEDBACK EVALUATION
                </div>

                <h2 style={{ fontSize: '1.65rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>
                  {facultyName || 'Instructor Name'}
                </h2>
                <p style={{ color: '#93C5FD', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                  {subject || 'Course Title'}
                </p>
                <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  {department}
                </p>

                {/* Scannable QR Code */}
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.3)',
                    display: 'inline-block',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <QRCodeSVG
                    id="generated-qrcode-svg"
                    value={targetUrl}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.75rem' }}>
                  📱 <strong>Scan with any phone camera</strong> to give feedback for <strong>{facultyName}</strong>.
                  <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '3px' }}>
                    ✓ Works directly on mobile data (4G/5G) or any internet
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', wordBreak: 'break-all', fontFamily: 'monospace', marginBottom: '1rem' }}>
                  {targetUrl}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: '150px', padding: '0.85rem' }}
                >
                  <Printer size={18} />
                  <span>Print Poster</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: '150px', padding: '0.85rem' }}
                >
                  <Download size={18} />
                  <span>Save QR Image</span>
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* --- TAB 2: QR SCANNER --- */
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Camera size={22} color="var(--primary)" />
                <span>Scan Teacher Feedback QR Code</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Point your camera at a CDU poster, upload an image, or use 1-Click test buttons below to see how it works.
              </p>
            </div>

            {/* Camera Viewport Area */}
            <div
              style={{
                background: '#0F172A',
                border: '2px dashed rgba(99, 102, 241, 0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                position: 'relative',
              }}
            >
              <div id="qr-reader-container" style={{ width: '100%', maxWidth: '400px' }} />

              {!isCameraActive && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <Camera size={32} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: '#E2E8F0', marginBottom: '0.5rem' }}>
                    Camera Scanner
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
                    Click "Start Camera" to scan live from your phone or webcam, or select a photo of the QR code.
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={startCameraScanner}
                      className="btn btn-primary"
                      style={{ padding: '0.65rem 1.25rem' }}
                    >
                      <Play size={16} />
                      <span>Start Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="btn btn-secondary"
                      style={{ padding: '0.65rem 1.25rem' }}
                      disabled={fileScanLoading}
                    >
                      <Upload size={16} />
                      <span>{fileScanLoading ? 'Decoding...' : 'Upload QR Photo'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              )}

              {isCameraActive && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={stopCameraScanner}
                    className="btn btn-secondary"
                    style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#FCA5A5' }}
                  >
                    <Square size={16} />
                    <span>Stop Camera</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {cameraError && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Scanned Result */}
            {scannedResult && (
              <div
                className="glass-card"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid rgba(16, 185, 129, 0.5)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <CheckCircle2 size={32} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6EE7B7', marginBottom: '0.3rem' }}>
                      QR Code Scanned Successfully!
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.75rem', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>TEACHER:</div>
                        <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>
                          {scannedResult.faculty || 'Detected from QR'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>COURSE / SUBJECT:</div>
                        <div style={{ fontWeight: 600, color: '#93C5FD', fontSize: '0.95rem' }}>
                          {scannedResult.subject || 'Detected from QR'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>DEPARTMENT:</div>
                        <div style={{ fontWeight: 600, color: '#CBD5E1', fontSize: '0.95rem' }}>
                          {scannedResult.department || 'All Departments'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedToFeedback}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.85rem' }}
                    >
                      <span>Open Pre-filled Feedback Form</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Simulation Presets */}
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <HelpCircle size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E2E8F0' }}>
                  No camera handy? Test with 1-Click Simulation:
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Click any teacher below to immediately open the pre-filled feedback form:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {FACULTY_LIST.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSimulateScan(item)}
                    className="btn btn-secondary"
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <QrCode size={14} color="var(--primary)" />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{item.faculty}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.subject}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
