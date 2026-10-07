const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Feedback = require('../models/Feedback');
const { generateToken, protectAdmin } = require('../middleware/authMiddleware');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const admin = await Admin.findOne({ username: cleanUsername });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken({ id: admin._id, username: admin.username, role: 'admin' });

    res.json({
      success: true,
      message: 'Admin logged in successfully',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Admin Login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// @desc    Get Admin Dashboard Analytics (calculated directly from MongoDB)
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', protectAdmin, async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();

    if (totalFeedback === 0) {
      return res.json({
        success: true,
        stats: {
          totalFeedback: 0,
          averageRating: 0,
          totalSubjects: 0,
          studentsSubmittedCount: 0,
          avgTeachingQuality: 0,
          avgCommunication: 0,
          avgCourseUnderstanding: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          subjectBreakdown: [],
          recentFeedback: [],
        },
      });
    }

    // Aggregation for overall and criteria averages
    const aggregateResult = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$overallRating' },
          avgTeaching: { $avg: '$teachingQuality' },
          avgComm: { $avg: '$communication' },
          avgCourse: { $avg: '$courseUnderstanding' },
        },
      },
    ]);

    const statsGroup = aggregateResult[0] || {};
    const averageRating = statsGroup.avgOverall ? Number(statsGroup.avgOverall.toFixed(2)) : 0;
    const avgTeachingQuality = statsGroup.avgTeaching ? Number(statsGroup.avgTeaching.toFixed(2)) : 0;
    const avgCommunication = statsGroup.avgComm ? Number(statsGroup.avgComm.toFixed(2)) : 0;
    const avgCourseUnderstanding = statsGroup.avgCourse ? Number(statsGroup.avgCourse.toFixed(2)) : 0;

    // Distinct subjects and students
    const distinctSubjects = await Feedback.distinct('subject');
    const distinctStudents = await Feedback.distinct('studentId');

    // Rating distribution
    const ratingDistributionAgg = await Feedback.aggregate([
      {
        $group: {
          _id: '$overallRating',
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistributionAgg.forEach((item) => {
      if (item._id >= 1 && item._id <= 5) {
        ratingDistribution[item._id] = item.count;
      }
    });

    // Subject breakdown
    const subjectBreakdown = await Feedback.aggregate([
      {
        $group: {
          _id: '$subject',
          facultyName: { $first: '$facultyName' },
          department: { $first: '$department' },
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' },
          avgTeaching: { $avg: '$teachingQuality' },
          avgComm: { $avg: '$communication' },
        },
      },
      {
        $project: {
          subject: '$_id',
          facultyName: 1,
          department: 1,
          count: 1,
          avgRating: { $round: ['$avgRating', 2] },
          avgTeaching: { $round: ['$avgTeaching', 2] },
          avgComm: { $round: ['$avgComm', 2] },
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    // Recent 5 feedback submissions
    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalFeedback,
        averageRating,
        totalSubjects: distinctSubjects.length,
        studentsSubmittedCount: distinctStudents.length,
        avgTeachingQuality,
        avgCommunication,
        avgCourseUnderstanding,
        ratingDistribution,
        subjectBreakdown,
        recentFeedback,
      },
    });
  } catch (error) {
    console.error('Admin Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to calculate dashboard statistics' });
  }
});

module.exports = router;
