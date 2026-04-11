const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/ADMIN/OneDrive/Máy tính/CNPM_CUOI_KY/backEnd/.env' });

const teachers = [
    { teacherId: 'GV001', fullName: 'TS. Thái Kim Phụng',          title: 'Trưởng khoa',           specialization: 'Quản trị - Marketing', gender: 'Female' },
    { teacherId: 'GV002', fullName: 'TS. Trương Việt Phương',       title: 'Phó Trưởng khoa',        specialization: 'Kinh tế quốc tế',      gender: 'Male' },
    { teacherId: 'GV003', fullName: 'TS. Nguyễn Mạnh Tuấn',        title: 'Giám đốc Chương trình',  specialization: 'Quản trị kinh doanh',   gender: 'Male' },
    { teacherId: 'GV004', fullName: 'TS. Bùi Xuân Huy',            title: 'Giám đốc Chương trình',  specialization: 'Marketing',             gender: 'Male' },
    { teacherId: 'GV005', fullName: 'ThS. Phan Hiền',               title: 'Giám đốc Chương trình',  specialization: 'Kinh doanh quốc tế',   gender: 'Female' },
    { teacherId: 'GV006', fullName: 'TS. Ngô Tấn Vũ Khanh',        title: 'Giám đốc Chương trình',  specialization: 'Logistics',             gender: 'Male' },
    { teacherId: 'GV007', fullName: 'TS. Nguyễn Quốc Hùng',        title: 'Giám đốc Chương trình',  specialization: 'Thương mại điện tử',   gender: 'Male' },
    { teacherId: 'GV008', fullName: 'TS. Đặng Ngọc Hoàng Thành',   title: 'Giám đốc Chương trình',  specialization: 'Ngoại thương',          gender: 'Male' },
    { teacherId: 'GV009', fullName: 'TS. Bùi Thanh Hiếu',          title: 'Giám đốc Chương trình',  specialization: 'Kinh doanh quốc tế',   gender: 'Male' },
];

// We'll assign to COB (Trường Kinh doanh UEH) -> COB_D2 (Khoa Kinh doanh Quốc tế - Marketing)
const COLLEGE_CODE = 'COB';
const FACULTY_CODE = 'COB_D2';

async function importTeachers() {
    await mongoose.connect(process.env.MONGO_URI);

    const College = require('./src/models/College.js');
    const Faculty = require('./src/models/Faculty.js');
    const Teacher = require('./src/models/Teacher.js');
    const User = require('./src/models/User.js');
    const bcrypt = require('bcryptjs');

    const college = await College.findOne({ code: COLLEGE_CODE });
    if (!college) { console.error('College not found:', COLLEGE_CODE); process.exit(1); }
    
    const faculty = await Faculty.findOne({ code: FACULTY_CODE });
    if (!faculty) { console.error('Faculty not found:', FACULTY_CODE); process.exit(1); }

    console.log(`Importing into College: ${college.name} (${college._id})`);
    console.log(`Faculty: ${faculty.name} (${faculty._id})`);

    let success = 0, failed = 0;
    for (const t of teachers) {
        try {
            const emailBase = t.teacherId.toLowerCase() + '@ueh.edu.vn';
            const phoneBase = '09' + Math.floor(Math.random() * 90000000 + 10000000).toString();
            
            const exists = await Teacher.findOne({ $or: [{ teacherId: t.teacherId }, { email: emailBase }] });
            if (exists) {
                console.log(`  SKIP (already exists): ${t.teacherId}`);
                continue;
            }
            
            const userExists = await User.findOne({ username: t.teacherId });
            if (userExists) {
                console.log(`  SKIP (user exists): ${t.teacherId}`);
                continue;
            }

            const user = await User.create({
                username: t.teacherId,
                password: t.teacherId + '@123456',
                email: emailBase,
                name: t.fullName,
                phone: phoneBase,
                role: 'teacher'
            });

            try {
                await Teacher.create({
                    teacherId: t.teacherId,
                    fullName: t.fullName,
                    email: emailBase,
                    phone: phoneBase,
                    college: college._id,
                    faculty: faculty._id,
                    specialization: t.specialization + ' - ' + t.title,
                    gender: t.gender,
                    status: 'Active',
                    userId: user._id
                });
                console.log(`  OK: ${t.teacherId} - ${t.fullName}`);
                success++;
            } catch (err) {
                await User.findByIdAndDelete(user._id);
                throw err;
            }
        } catch (err) {
            console.error(`  FAILED: ${t.teacherId} - ${err.message}`);
            failed++;
        }
    }
    
    console.log(`\nDone: ${success} imported, ${failed} failed.`);
    mongoose.disconnect();
}

importTeachers().catch(console.error);
