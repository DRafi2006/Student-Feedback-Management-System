const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protectStudent, protectAdmin } = require('../middleware/authMiddleware');

// @desc    Submit new student feedback
// @route   POST /api/feedback
// @access  Public or Student Authenticated
router.post('/', async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      department,
      semester,
      subject,
      facultyName,
      overallRating,
      teachingQuality,
      communication,
      courseUnderstanding,
      comments,
    } = req.body;

    // Validate required fields
    if (
      !studentId ||
      !studentName ||
      !department ||
      !semester ||
      !subject ||
      !facultyName ||
      overallRating === undefined ||
      teachingQuality === undefined ||
      communication === undefined ||
      courseUnderstanding === undefined
    ) {
      return res.status(400).json({
        message: 'All feedback fields and rating criteria (1-5) are required.',
      });
    }

    const numOverall = Number(overallRating);
    const numTeaching = Number(teachingQuality);
    const numComm = Number(communication);
    const numCourse = Number(courseUnderstanding);

    if (
      [numOverall, numTeaching, numComm, numCourse].some(
        (r) => isNaN(r) || r < 1 || r > 5
      )
    ) {
      return res.status(400).json({
        message: 'Ratings must be numbers between 1 and 5.',
      });
    }

    const cleanStudentId = studentId.trim().toUpperCase();
    const cleanSubject = subject.trim();

    // Check if feedback already exists for this student and subject
    const existingFeedback = await Feedback.findOne({
      studentId: cleanStudentId,
      subject: cleanSubject,
    });

    if (existingFeedback) {
      existingFeedback.studentName = studentName.trim();
      existingFeedback.department = department.trim();
      existingFeedback.semester = String(semester).trim();
      existingFeedback.facultyName = facultyName.trim();
      existingFeedback.overallRating = numOverall;
      existingFeedback.teachingQuality = numTeaching;
      existingFeedback.communication = numComm;
      existingFeedback.courseUnderstanding = numCourse;
      existingFeedback.comments = comments ? comments.trim() : '';

      const updatedFeedback = await existingFeedback.save();

      return res.status(200).json({
        success: true,
        message: 'Feedback updated successfully.',
        feedback: updatedFeedback,
        isUpdate: true,
      });
    }

    const feedbackDoc = new Feedback({
      studentId: cleanStudentId,
      studentName: studentName.trim(),
      department: department.trim(),
      semester: String(semester).trim(),
      subject: cleanSubject,
      facultyName: facultyName.trim(),
      overallRating: numOverall,
      teachingQuality: numTeaching,
      communication: numComm,
      courseUnderstanding: numCourse,
      comments: comments ? comments.trim() : '',
    });

    const savedFeedback = await feedbackDoc.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback: savedFeedback,
      isUpdate: false,
    });
  } catch (error) {
    console.error('Submit Feedback error:', error);
    res.status(500).json({
      message: 'Failed to submit feedback',
      error: error.message,
    });
  }
});

// @desc    Get evaluations submitted by a student
// @route   GET /api/feedback/student/:studentId
// @access  Public / Student
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId.trim().toUpperCase();
    const list = await Feedback.find({ studentId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: list.length,
      feedback: list,
    });
  } catch (error) {
    console.error('Fetch student feedback error:', error);
    res.status(500).json({ message: 'Failed to retrieve student feedback history' });
  }
});

// @desc    Get all feedback records (Admin)
// @route   GET /api/feedback
// @access  Private (Admin)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const { search, department, subject, minRating } = req.query;
    let query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (minRating) {
      query.overallRating = { $gte: Number(minRating) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { studentId: searchRegex },
        { studentName: searchRegex },
        { facultyName: searchRegex },
        { subject: searchRegex },
        { department: searchRegex },
        { comments: searchRegex },
      ];
    }

    const feedbackList = await Feedback.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbackList.length,
      feedback: feedbackList,
    });
  } catch (error) {
    console.error('Fetch Feedback error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback records' });
  }
});

// @desc    Get feedback by ID
// @route   GET /api/feedback/:id
// @access  Private (Admin)
router.get('/:id', protectAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve feedback' });
  }
});

// @desc    Delete a feedback record
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback record not found' });
    }
    res.json({ success: true, message: 'Feedback record removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete feedback record' });
  }
});

module.exports = router;
