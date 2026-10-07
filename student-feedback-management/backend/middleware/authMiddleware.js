const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'student_feedback_secret_2026';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Protect middleware for Student routes
const protectStudent = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'student') {
        return res.status(403).json({ message: 'Access denied: Student access required' });
      }

      req.student = await Student.findById(decoded.id).select('-password');
      if (!req.student) {
        return res.status(401).json({ message: 'Student not found or token expired' });
      }

      next();
    } catch (error) {
      console.error('Student Auth error:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Protect middleware for Admin routes
const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin access required' });
      }

      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        return res.status(401).json({ message: 'Admin not found or token expired' });
      }

      next();
    } catch (error) {
      console.error('Admin Auth error:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = {
  generateToken,
  protectStudent,
  protectAdmin,
};
