const fs = require('fs');
const path = require('path');

const features = [
  { name: 'CourseRegistration', camel: 'courseRegistration', url: 'course-registrations' },
  { name: 'Attendance', camel: 'attendance', url: 'attendances' },
  { name: 'Tuition', camel: 'tuition', url: 'tuitions' },
  { name: 'Petition', camel: 'petition', url: 'petitions' },
  { name: 'Announcement', camel: 'announcement', url: 'announcements' },
  { name: 'TrainingPoint', camel: 'trainingPoint', url: 'training-points' },
  { name: 'ExamSchedule', camel: 'examSchedule', url: 'exam-schedules' },
  { name: 'TeacherEvaluation', camel: 'teacherEvaluation', url: 'teacher-evaluations' }
];

const backendDir = path.join(__dirname, 'backEnd', 'src');
const frontendDir = path.join(__dirname, 'frontEnd', 'src');

features.forEach(feat => {
    // Backend - Model
    const modelPath = path.join(backendDir, 'models', `${feat.name}.js`);
    fs.writeFileSync(modelPath, `const mongoose = require('mongoose');

const ${feat.camel}Schema = new mongoose.Schema({
  // TODO: Add fields here
}, { timestamps: true });

module.exports = mongoose.model('${feat.name}', ${feat.camel}Schema);
`);

    // Backend - Controller
    const controllerPath = path.join(backendDir, 'controllers', `${feat.camel}Controller.js`);
    fs.writeFileSync(controllerPath, `const ${feat.name} = require('../models/${feat.name}');

// @desc    Get all ${feat.camel}
// @route   GET /api/${feat.url}
// @access  Private
exports.getAll = async (req, res) => {
  try {
    res.status(200).json({ message: '${feat.name} endpoint is under construction' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
`);

    // Backend - Routes
    const routePath = path.join(backendDir, 'routes', `${feat.camel}Routes.js`);
    fs.writeFileSync(routePath, `const express = require('express');
const router = express.Router();
const ${feat.camel}Controller = require('../controllers/${feat.camel}Controller');
const { protect } = require('../middleware/authMiddleware'); // Giả định dùng chung middleware

// Bảo vệ tất cả route
router.use(protect);

router.route('/')
  .get(${feat.camel}Controller.getAll);

module.exports = router;
`);

    // Frontend - Service
    const servicePath = path.join(frontendDir, 'services', `${feat.camel}Service.js`);
    fs.writeFileSync(servicePath, `import api from './api';

const ${feat.camel}Service = {
  getAll: async () => {
    const response = await api.get('/${feat.url}');
    return response.data;
  },
};

export default ${feat.camel}Service;
`);

    // Frontend - Page
    const pageDir = path.join(frontendDir, 'pages', feat.name);
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
    
    let viTitle = "";
    switch(feat.name) {
        case "CourseRegistration": viTitle = "Đăng ký học phần"; break;
        case "Attendance": viTitle = "Điểm danh"; break;
        case "Tuition": viTitle = "Quản lý học phí"; break;
        case "Petition": viTitle = "Đơn từ Sinh viên"; break;
        case "Announcement": viTitle = "Bảng tin"; break;
        case "TrainingPoint": viTitle = "Điểm rèn luyện"; break;
        case "ExamSchedule": viTitle = "Lịch thi"; break;
        case "TeacherEvaluation": viTitle = "Đánh giá giảng viên"; break;
    }

    const pagePath = path.join(pageDir, `${feat.name}Page.jsx`);
    fs.writeFileSync(pagePath, `import React from 'react';
import { Typography, Card, Empty } from 'antd';

const { Title, Paragraph } = Typography;

const ${feat.name}Page = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>${viTitle}</Title>
      <Paragraph>
        Giao diện module <strong>${viTitle}</strong> đang được xây dựng...
      </Paragraph>
      
      <Card style={{ marginTop: 24, borderRadius: 8 }}>
        <Empty description="Chưa có dữ liệu" />
      </Card>
    </div>
  );
};

export default ${feat.name}Page;
`);
});

console.log("Scaffolding 8 features completed successfully.");
