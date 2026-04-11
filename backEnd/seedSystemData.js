const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
const Department = require('./src/models/Department');
const Major = require('./src/models/Major');
const Class = require('./src/models/Class');
const Student = require('./src/models/Student');
const Teacher = require('./src/models/Teacher');
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');
const Grade = require('./src/models/Grade');
const SystemConfig = require('./src/models/SystemConfig');
const Term = require('./src/models/Term');
const bcrypt = require('bcryptjs');

// Force Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '.env') });

const seedUEHDataHierarchy = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('Connected to MongoDB successfully!');

        // 0. Clear old data
        await Department.deleteMany({});
        await Major.deleteMany({});
        await Class.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await Subject.deleteMany({});
        await Grade.deleteMany({});
        await SystemConfig.deleteMany({});
        await Term.deleteMany({});
        // Keep existing Admin, delete other users
        await User.deleteMany({ role: { $ne: 'admin' } });
        console.log('Cleaned up data but kept Admin users.');
        console.log('Cleaned up existing database data.');

        // 0.5. Seed System Configuration
        const configs = [
            { key: 'SEMESTERS', value: ['HK1-2024', 'HK2-2024', 'HK3-2024', 'HK1-2025', 'HK2-2025'], description: 'List of available semesters' },
            { key: 'ACADEMIC_YEARS', value: ['2023-2024', '2024-2025'], description: 'List of academic years' },
            { key: 'BATCHES', value: ['K49', 'K50', 'K51', 'K52'], description: 'List of entry batches' },
            { key: 'STATUS_OPTIONS', value: ['Active', 'Inactive', 'Graduated'], description: 'Student status options' }
        ];

        for (const config of configs) {
            await SystemConfig.create(config);
            console.log(`- Config Seeded: ${config.key}`);
        }

        // 0.6. Seed Terms
        const terms = [
            { code: 'HK1-2024', name: 'Học kỳ 1 Năm học 2024-2025', startDate: new Date('2024-09-01'), endDate: new Date('2025-01-15'), status: 'Active' },
            { code: 'HK2-2024', name: 'Học kỳ 2 Năm học 2024-2025', startDate: new Date('2025-02-15'), endDate: new Date('2025-06-30'), status: 'Upcoming' },
            { code: 'HK3-2024', name: 'Học kỳ phụ (Hè) Năm học 2024-2025', startDate: new Date('2025-07-01'), endDate: new Date('2025-08-31'), status: 'Upcoming' }
        ];
        for (const term of terms) {
            await Term.create(term);
            console.log(`- Term Seeded: ${term.code}`);
        }

        // 1. Create Colleges (Departments)
        const collegesRaw = [
            { code: 'COB', name: 'Trường Kinh doanh UEH', description: 'UEH College of Business' },
            { code: 'CELG', name: 'Trường Kinh tế, Luật và Quản lý nhà nước UEH', description: 'UEH College of Economics, Law and Government' },
            { code: 'CTD', name: 'Trường Công nghệ và Thiết kế UEH', description: 'UEH College of Technology and Design' }
        ];

        const colleges = {};
        for (const c of collegesRaw) {
            const saved = await Department.create(c);
            colleges[c.code] = saved._id;
            console.log(`- College Created: ${c.name}`);
        }

        // 2. Create Faculties and Majors (Khoa & Ngành) under Colleges
        const hierarchyRaw = [
            {
                dept: 'COB',
                faculties: [
                    { 
                        code: 'F_BUS', name: 'Khoa Kinh doanh quốc tế - Marketing',
                        majors: [
                            { code: 'KDQT', name: 'Ngành Kinh doanh quốc tế' },
                            { code: 'MKT', name: 'Ngành Marketing' }
                        ]
                    },
                    {
                        code: 'F_MGT', name: 'Khoa Quản trị',
                        majors: [
                            { code: 'QTKD', name: 'Ngành Quản trị kinh doanh' }
                        ]
                    },
                    {
                        code: 'F_ACC', name: 'Khoa Kế toán',
                        majors: [
                            { code: 'KT_BUS', name: 'Ngành Kế toán' }
                        ]
                    }
                ]
            },
            {
                dept: 'CTD',
                faculties: [
                    {
                        code: 'F_SIT', name: 'Khoa Công nghệ thông tin kinh doanh',
                        majors: [
                            { code: 'SE', name: 'Ngành Kỹ thuật phần mềm' },
                            { code: 'MIS', name: 'Ngành Hệ thống thông tin quản lý' }
                        ]
                    },
                    {
                        code: 'F_DS', name: 'Khoa Thiết kế - Truyền thông',
                        majors: [
                            { code: 'TKD', name: 'Ngành Thiết kế đồ họa' }
                        ]
                    }
                ]
            }
        ];

        let itFacultyId;
        let seMajorId;

        for (const school of hierarchyRaw) {
            for (const f of school.faculties) {
                // Create Faculty (Khoa)
                const faculty = await Major.create({
                    code: f.code,
                    name: f.name,
                    department: colleges[school.dept],
                    type: 'Faculty',
                    parentMajor: null
                });
                console.log(`  - Faculty Created: ${f.name}`);
                if (f.code === 'F_SIT') itFacultyId = faculty._id;

                for (const m of f.majors) {
                    // Create Program (Ngành)
                    const major = await Major.create({
                        code: m.code,
                        name: m.name,
                        department: null, // Program links to Faculty, not directly to School
                        type: 'Program',
                        parentMajor: faculty._id
                    });
                    console.log(`    * Major Created: ${m.name}`);
                    if (m.code === 'SE') seMajorId = major._id;

                    // Seed Classes for each Major
                    const batches = ['K50', 'K51'];
                    for (const batch of batches) {
                        for (let i = 1; i <= 2; i++) {
                            const classNum = i.toString().padStart(2, '0');
                            await Class.create({
                                code: `${m.code}${classNum}_${batch}`,
                                name: `${m.code}${classNum} - ${batch}`,
                                major: major._id,
                                batch: batch
                            });
                            console.log(`      + Class Created: ${m.code}${classNum} (${batch})`);
                        }
                    }
                }
            }
        }

        // 3. Create Default Admin if it doesn't exist
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'adminPassword123!';
        
        let adminUser = await User.findOne({ username: adminUsername });
        
        if (!adminUser) {
            adminUser = await User.create({
                username: adminUsername,
                password: adminPassword,
                email: 'admin@ueh.edu.vn',
                name: 'System Admin',
                role: 'admin',
                status: 'Active'
            });
            console.log(`- Created Default Admin: ${adminUsername}`);
        } else {
            // Update password to match .env (model handles hashing)
            adminUser.password = adminPassword;
            await adminUser.save();
            console.log(`- Updated Admin Password for: ${adminUsername}`);
        }

        // 4. Create sample data
        const seK50Classes = await Class.find({ major: seMajorId, batch: 'K50' });
        const sampleClass = seK50Classes[0];

        if (sampleClass) {
            // Seed sample Subjects for SE K50 classes
            const subjectTemplates = [
                { code: 'INF509012', name: 'Công nghệ phần mềm', credits: 3 },
                { code: 'INF509037', name: 'Hệ quản trị cơ sở dữ liệu', credits: 3 },
                { code: 'INF509038', name: 'Lập trình Web', credits: 3 },
            ];

            for (const cls of seK50Classes) {
                for (const template of subjectTemplates) {
                    await Subject.create({
                        ...template,
                        code: `${template.code}_${cls.name.split(' ')[0]}`, // Unique code per class
                        classStr: cls.name,
                        status: 'Active'
                    });
                }
            }
            console.log(`- Seeded subjects for ${seK50Classes.length} SE K50 classes`);

            // Seed a sample Student
            await Student.create({
                mssv: '31211020001',
                fullName: 'Nguyễn Văn A',
                email: 'student.a@ueh.edu.vn',
                phone: '0901234567',
                class: sampleClass._id,
                gender: 'Male',
                status: 'Active'
            });
            console.log(`- Sample Student Seeded: Nguyễn Văn A (${sampleClass.name})`);

            // Seed a sample Teacher User
            await User.create({
                username: 'teacher',
                email: 'teacher@ueh.edu.vn',
                password: 'password123', // Model handles hashing
                name: 'Giảng viên A',
                role: 'user',
                assignedClasses: seK50Classes.map(c => c.name)
            });
            console.log('- Created Teacher User: teacher/password123 (Assigned to SE classes)');

            // Seed a sample Teacher Profile
            await Teacher.create({
                teacherId: 'UEH_T001',
                fullName: 'ThS. Trần Thị B',
                email: 'teacher@ueh.edu.vn', // Link via email
                phone: '0987654321',
                department: colleges['CTD'], // Trường CTD
                major: itFacultyId, // Khoa CNTT
                specialization: 'Software Engineering',
                gender: 'Female',
                status: 'Active'
            });
            console.log('- Sample Teacher Seeded: ThS. Trần Thị B');
        }

        console.log('UEH Professional Database Structure seeded successfully.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedUEHDataHierarchy();
