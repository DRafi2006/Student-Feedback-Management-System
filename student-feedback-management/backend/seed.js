const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Admin = require('./models/Admin');
const Feedback = require('./models/Feedback');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing database collections...');
    await Student.deleteMany({});
    await Admin.deleteMany({});
    await Feedback.deleteMany({});

    console.log('🌱 Seeding Students with College Roll Numbers...');
    const students = await Student.create([
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
    console.log(`✅ Created ${students.length} Student accounts`);

    console.log('🌱 Seeding Admin account...');
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123',
    });
    console.log(`✅ Created Admin account (${admin.username})`);

    console.log('🌱 Seeding initial Feedback samples...');
    const feedbacks = await Feedback.create([
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
    console.log(`✅ Created ${feedbacks.length} sample Feedback records in MongoDB`);

    console.log('\n=========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=========================================');
    console.log('Student College IDs:');
    console.log('  - N24H01A0338 / student123 (Rahul Sharma - Mech Sem 4)');
    console.log('  - N24H01B0338 / student123 (Priya Reddy - CSE Sem 6)');
    console.log('  - N24H01A0501 / student123 (Ananya Verma - ECE Sem 6)');
    console.log('  - N24H01A0102 / student123 (Karthik Kumar - IT Sem 4)');
    console.log('Admin Credentials:');
    console.log('  - admin / admin123');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
