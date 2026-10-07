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

// Connect to Database and auto-seed
connectDB().then(() => {
  autoSeedIfEmpty();
});

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

// Helper to get local network IPv4 address
const getLocalNetworkIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

app.get('/api/network-ip', (req, res) => {
  const ip = getLocalNetworkIp();
  res.json({
    success: true,
    ip,
    frontendUrl: `http://${ip}:3000`,
    backendUrl: `http://${ip}:5000`,
  });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - Network: http://${localIp}:${PORT}`);
});
