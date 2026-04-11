const express = require('express');
const path = require('path');
const dns = require('dns');
const dotenv = require('dotenv');
const cors = require('cors');

// Use Google Public DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load env vars — resolve path relative to this file's directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const { verifyEmailConfig } = require('./services/emailService');

// Connect to database
connectDB();

// Verify Email Config for OTP
verifyEmailConfig();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/setup', require('./routes/setupRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/colleges', require('./routes/collegeRoutes'));
app.use('/api/faculties', require('./routes/facultyRoutes'));
app.use('/api/majors', require('./routes/majorRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));
app.use('/api/terms', require('./routes/termRoutes'));
app.use('/api/class-sections', require('./routes/classSectionRoutes'));
app.use('/api/course-registrations', require('./routes/courseRegistrationRoutes'));
app.use('/api/attendances', require('./routes/attendanceRoutes'));
app.use('/api/tuitions', require('./routes/tuitionRoutes'));
app.use('/api/petitions', require('./routes/petitionRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/training-points', require('./routes/trainingPointRoutes'));
app.use('/api/exam-schedules', require('./routes/examScheduleRoutes'));
app.use('/api/teacher-evaluations', require('./routes/teacherEvaluationRoutes'));
// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
