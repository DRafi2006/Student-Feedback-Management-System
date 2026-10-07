const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { generateToken, protectStudent } = require('../middleware/authMiddleware');

// @desc    Register a new student
// @route   POST /api/students/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { studentId, name, password, department, semester } = req.body;

    if (!studentId || !name || !password || !department || !semester) {
      return res.status(400).json({ message: 'All registration fields are required.' });
    }

    const cleanId = studentId.trim().toUpperCase();

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ studentId: cleanId });
    if (existingStudent) {
      return res.status(400).json({
        message: `Student ID / Roll No ${cleanId} is already registered. Please log in directly.`,
      });
    }

    const student = await Student.create({
      studentId: cleanId,
      name: name.trim(),
      password,
      department: department.trim(),
      semester: String(semester).trim(),
    });

    const token = generateToken({ id: student._id, studentId: student.studentId, role: 'student' });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully!',
      token,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        department: student.department,
        semester: student.semester,
      },
    });
  } catch (error) {
    console.error('Student Registration error:', error);
    res.status(500).json({ message: 'Server error during student registration', error: error.message });
  }
});

// @desc    Student login
// @route   POST /api/students/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ message: 'Please provide both College Roll No / Student ID and Password' });
    }

    const cleanId = studentId.trim().toUpperCase();
    const student = await Student.findOne({ studentId: cleanId });

    if (!student) {
      return res.status(401).json({ message: 'Invalid College Roll No / Student ID or Password' });
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid College Roll No / Student ID or Password' });
    }

    const token = generateToken({ id: student._id, studentId: student.studentId, role: 'student' });

    res.json({
      success: true,
      message: 'Student logged in successfully',
      token,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        department: student.department,
        semester: student.semester,
      },
    });
  } catch (error) {
    console.error('Student Login error:', error);
    res.status(500).json({ message: 'Server error during student login' });
  }
});

// @desc    Get logged-in student profile
// @route   GET /api/students/profile
// @access  Private (Student)
router.get('/profile', protectStudent, async (req, res) => {
  try {
    res.json({
      success: true,
      student: {
        id: req.student._id,
        studentId: req.student.studentId,
        name: req.student.name,
        department: req.student.department,
        semester: req.student.semester,
      },
    });
  } catch (error) {
    console.error('Student Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

module.exports = router;
