const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Auto-seed default credentials if DB is empty
const autoSeedIfEmpty = async () => {
  try {
    const Student = require('./models/Student');
    const Admin = require('./models/Admin');
    const Feedback = require('./models/Feedback');

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('🌱 Initializing default Admin account...');
      await Admin.create({ username: 'admin', password: 'admin123' });
      console.log('✅ Default Admin created (admin / admin123)');
    }

    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('🌱 Initializing default Student accounts...');
      await Student.create([
        {
          studentId: 'N24H01A0338',
          name: 'Rahul Sharma',
          password: 'student123',
          department: 'Mechanical Engineering',
          semester: '4',
        },
        {
          studentId: 'N24H01B0338',
          name: 'Priya Reddy',
          password: 'student123',
          department: 'Computer Science & Engineering',
          semester: '6',
        },
        {
          studentId: 'N24H01A0501',
          name: 'Ananya Verma',
          password: 'student123',
          department: 'Electronics & Communication',
          semester: '6',
        },
        {
          studentId: 'N24H01A0102',
          name: 'Karthik Kumar',
          password: 'student123',
          department: 'Information Technology',
          semester: '4',
        },
      ]);
      console.log('✅ Default Students created (N24H01A0338, N24H01B0338, N24H01A0501, N24H01A0102 / student123)');
    }

    const feedbackCount = await Feedback.countDocuments();
    if (feedbackCount === 0) {
      console.log('🌱 Initializing initial Feedback samples in database...');
      await Feedback.create([
        {
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
        },
        {
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
        },
        {
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
        },
      ]);
      console.log('✅ Initial Feedback samples seeded into database');
    }
  } catch (err) {
    console.error('Auto-seed check error:', err.message);
  }
};

// Express application instance
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for seamless local development
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for API calls
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Root & Health check
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Student Feedback Management System API is running',
    version: '1.0.0',
    endpoints: {
      studentLogin: 'POST /api/students/login',
      adminLogin: 'POST /api/admin/login',
      submitFeedback: 'POST /api/feedback',
      allFeedback: 'GET /api/feedback',
      adminDashboard: 'GET /api/admin/dashboard',
    },
  });
});

const os = require('os');

// Helper to get all and best local network IPv4 addresses
const getAllNetworkIps = () => {
  const interfaces = os.networkInterfaces();
  const list = [];
  let bestIp = '127.0.0.1';

  // Order priority: Wi-Fi / WLAN first, then Ethernet / LAN, then others
  const sortedNames = Object.keys(interfaces).sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const isAWifi = aLower.includes('wi-fi') || aLower.includes('wlan') || aLower.includes('wireless');
    const isBWifi = bLower.includes('wi-fi') || bLower.includes('wlan') || bLower.includes('wireless');
    if (isAWifi && !isBWifi) return -1;
    if (!isAWifi && isBWifi) return 1;

    const isAEth = aLower.includes('ethernet') || aLower.includes('eth');
    const isBEth = bLower.includes('ethernet') || bLower.includes('eth');
    if (isAEth && !isBEth) return -1;
    if (!isAEth && isBEth) return 1;

    return 0;
  });

  for (const name of sortedNames) {
    const ifaces = interfaces[name] || [];
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        list.push({ name, ip: iface.address });
        if (bestIp === '127.0.0.1') {
          bestIp = iface.address;
        }
      }
    }
  }

  return { bestIp, allIps: list };
};

const getLocalNetworkIp = () => {
  const { bestIp } = getAllNetworkIps();
  return bestIp;
};

app.get('/api/network-ip', (req, res) => {
  const { bestIp, allIps } = getAllNetworkIps();
  res.json({
    success: true,
    ip: bestIp,
    allIps,
    frontendUrl: `http://${bestIp}:3000`,
    backendUrl: `http://${bestIp}:5000`,
    tunnelUrl: activeTunnelUrl,
  });
});

// Automatic Zero-Config Public Tunnel (Allows phone scanning anywhere on 4G/5G without same Wi-Fi)
let activeTunnel = null;
let activeTunnelUrl = null;

const startPublicTunnel = () => {
  return new Promise((resolve) => {
    if (activeTunnelUrl) {
      return resolve({ success: true, url: activeTunnelUrl, active: true });
    }

    const { spawn } = require('child_process');
    try {
      const child = spawn('ssh', [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ServerAliveInterval=30',
        '-R', '80:localhost:3000',
        'nokey@localhost.run',
      ]);

      activeTunnel = child;
      let urlFound = false;

      const handler = (data) => {
        const text = data.toString();
        const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.lhr\.life/);
        if (match && !urlFound) {
          urlFound = true;
          activeTunnelUrl = match[0];
          console.log(`🌐 Public Mobile Tunnel Online: ${activeTunnelUrl}`);
          resolve({ success: true, url: activeTunnelUrl, active: true });
        }
      };

      child.stdout.on('data', handler);
      child.stderr.on('data', handler);

      child.on('close', () => {
        activeTunnel = null;
        activeTunnelUrl = null;
      });

      child.on('error', (err) => {
        console.warn('Tunnel process error:', err.message);
        resolve({ success: false, message: err.message });
      });

      setTimeout(() => {
        if (!urlFound) {
          resolve({
            success: false,
            message: 'Tunnel initialization timed out. You can manually enter a public/deployed URL.',
          });
        }
      }, 15000);
    } catch (e) {
      resolve({ success: false, message: e.message });
    }
  });
};

app.get('/api/tunnel', async (req, res) => {
  const result = await startPublicTunnel();
  res.json(result);
});

app.post('/api/tunnel/stop', (req, res) => {
  if (activeTunnel) {
    activeTunnel.kill();
    activeTunnel = null;
    activeTunnelUrl = null;
  }
  res.json({ success: true, message: 'Tunnel stopped' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
});

const PORT = process.env.PORT || 5000;
const localIp = getLocalNetworkIp();

// Start Server after Database is completely initialized & seeded
const startServer = async () => {
  try {
    console.log('⏳ Connecting to Database and verifying seed data...');
    await connectDB();
    await autoSeedIfEmpty();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n========================================================');
      console.log('🚀 Student Feedback Management Backend is READY!');
      console.log(`   - Local URL:    http://localhost:${PORT}`);
      console.log(`   - Network URL:  http://${localIp}:${PORT}`);
      console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
      console.log('========================================================\n');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
