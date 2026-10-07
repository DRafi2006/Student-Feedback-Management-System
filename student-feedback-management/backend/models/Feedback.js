const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
      uppercase: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    facultyName: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
    },
    overallRating: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    teachingQuality: {
      type: Number,
      required: [true, 'Teaching quality rating is required'],
      min: [1, 'Teaching quality must be at least 1'],
      max: [5, 'Teaching quality cannot exceed 5'],
    },
    communication: {
      type: Number,
      required: [true, 'Communication rating is required'],
      min: [1, 'Communication must be at least 1'],
      max: [5, 'Communication cannot exceed 5'],
    },
    courseUnderstanding: {
      type: Number,
      required: [true, 'Course understanding rating is required'],
      min: [1, 'Course understanding must be at least 1'],
      max: [5, 'Course understanding cannot exceed 5'],
    },
    comments: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
