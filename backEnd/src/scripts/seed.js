const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Fix for MongoDB Atlas connectivity in certain environments
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const Term = require('../models/Term');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const ClassSection = require('../models/ClassSection');
const College = require('../models/College');
const Faculty = require('../models/Faculty');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Ensure a Default Term exists
    const activeTerm = await Term.findOneAndUpdate(
      { code: 'HK2-2024' },
      { 
        code: 'HK2-2024',
        name: 'Học kỳ 2 Năm học 2024-2025',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        status: 'Active',
        isDefault: true
      },
      { upsert: true, new: true }
    );
    console.log('Ensured Default Term:', activeTerm.code);

    // 2. Get Colleges & Faculties
    const colleges = await College.find();
    const faculties = await Faculty.find();

    if (colleges.length === 0 || faculties.length === 0) {
      console.error('No colleges or faculties found. Please run initial setup first.');
      process.exit(1);
    }

    // 3. Create Mock Subjects
    const subjectData = [
      { code: 'IT001', name: 'Nhập môn lập trình', credits: 3, faculty: faculties[0]._id },
      { code: 'IT002', name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, faculty: faculties[0]._id },
      { code: 'MA001', name: 'Toán cao cấp A1', credits: 3, faculty: faculties[0]._id },
      { code: 'ECON01', name: 'Kinh tế vĩ mô', credits: 3, faculty: faculties[1]._id },
      { code: 'MKT01', name: 'Marketing căn bản', credits: 3, faculty: faculties[1]._id }
    ];

    let subjects = [];
    for (const sub of subjectData) {
      const s = await Subject.findOneAndUpdate({ code: sub.code }, sub, { upsert: true, new: true });
      subjects.push(s);
    }
    console.log('Ensured Mock Subjects');

    // 4. Create Mock Teachers
    const teacherData = [
      { 
        teacherId: 'T001', 
        fullName: 'Nguyễn Văn A', 
        email: 'nva@ueh.edu.vn', 
        phone: '0901234567', 
        college: colleges[0]._id, 
        faculty: faculties[0]._id 
      },
      { 
        teacherId: 'T002', 
        fullName: 'Trần Thị B', 
        email: 'ttb@ueh.edu.vn', 
        phone: '0907654321', 
        college: colleges[0]._id, 
        faculty: faculties[0]._id 
      }
    ];

    let teachers = [];
    for (const t of teacherData) {
      const teacher = await Teacher.findOneAndUpdate({ teacherId: t.teacherId }, t, { upsert: true, new: true });
      teachers.push(teacher);
    }
    console.log('Ensured Mock Teachers');

    // 5. Create Class Sections for the Default Term
    const sectionData = [
      { 
        code: activeTerm.code + '_IT001_01', 
        subject: subjects[0]._id, 
        term: activeTerm._id, 
        teacher: teachers[0]._id, 
        maxStudents: 40, 
        schedule: [{ dayOfWeek: 2, startPeriod: 1, endPeriod: 3, room: 'A.101' }] 
      },
      { 
        code: activeTerm.code + '_IT002_01', 
        subject: subjects[1]._id, 
        term: activeTerm._id, 
        teacher: teachers[0]._id, 
        maxStudents: 40, 
        schedule: [{ dayOfWeek: 3, startPeriod: 4, endPeriod: 6, room: 'B.202' }] 
      },
      { 
        code: activeTerm.code + '_MA001_01', 
        subject: subjects[2]._id, 
        term: activeTerm._id, 
        teacher: teachers[1]._id, 
        maxStudents: 60, 
        schedule: [{ dayOfWeek: 5, startPeriod: 7, endPeriod: 9, room: 'C.303' }] 
      }
    ];

    for (const sec of sectionData) {
      await ClassSection.findOneAndUpdate({ code: sec.code }, sec, { upsert: true, new: true });
    }
    console.log('Ensured Class Sections');

    console.log('Seed completed successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
