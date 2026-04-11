const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ClassSection = require('./src/models/ClassSection');
const Student = require('./src/models/Student');
const User = require('./src/models/User');
const Term = require('./src/models/Term');

async function debugData() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to:', mongoUri?.substring(0, 30) + '...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Find the student "Lữ Võ Hoàng Phúc"
    const student = await Student.findOne({ fullName: /Lữ Võ Hoàng Phúc/i }).populate('userId');
    if (!student) {
      console.log('Student "Lữ Võ Hoàng Phúc" not found');
    } else {
      console.log('Student Found:', {
        _id: student._id,
        fullName: student.fullName,
        userId: student.userId?._id,
        class: student.class
      });
    }

    // 2. List all terms
    const allTerms = await Term.find();
    console.log('\nTerms:');
    allTerms.forEach(t => console.log(`- ${t.code} (${t.name}) | Default: ${t.isDefault} | Status: ${t.status}`));

    // 3. List all class sections
    const sections = await ClassSection.find().populate('subject', 'name code').populate('term', 'name code');
    console.log('\nAll Class Sections:');
    sections.forEach(s => {
      console.log(`- [${s.term?.code}] ${s.subject?.name} (${s.code}) | Status: ${s.status} | TargetClasses: ${s.targetClasses.length} | Enrolled: ${s.enrolledStudents.length}`);
    });

    // 4. Find "Phân tích thiết kế hệ thống" specifically
    const pttkh = sections.filter(s => s.subject?.name?.toLowerCase().includes('phân tích thiết kế hệ thống'));
    if (pttkh.length > 0) {
       console.log('\nFound "Phân tích thiết kế hệ thống":');
       pttkh.forEach(p => {
         console.log(JSON.stringify({
           _id: p._id,
           code: p.code,
           subject: p.subject?.name,
           term: p.term?.code,
           status: p.status,
           targetClasses: p.targetClasses,
           enrolledCount: p.enrolledStudents.length
         }, null, 2));
       });
    } else {
       console.log('\n"Phân tích thiết kế hệ thống" not found in sections');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugData();
