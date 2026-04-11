const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res) => {
    try {
        let query = {};
        
        // If the user is not an admin, only show students from their assigned classes
        if (req.user && req.user.role !== 'admin') {
            const assignedClasses = req.user.assignedClasses || [];
            query = { class: { $in: assignedClasses } };
        }

        const students = await Student.find(query)
            .populate({
                path: 'class',
                populate: {
                    path: 'major',
                    populate: { 
                        path: 'faculty',
                        populate: { path: 'college' }
                    }
                }
            })
            .sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Public
const createStudent = async (req, res) => {
    try {
        const { mssv, fullName, email, phone, class: classId, dob, gender, address, status, avatarUrl } = req.body;

        const studentExists = await Student.findOne({ $or: [{ mssv }, { email }] });
        if (studentExists) {
            return res.status(400).json({ message: 'Student with this MSSV or Email already exists' });
        }

        const userExists = await User.findOne({ username: mssv });
        if (userExists) {
            return res.status(400).json({ message: 'User account with this MSSV already exists' });
        }

        // 1. Create User first
        const user = await User.create({
            username: mssv,
            password: mssv, // Default password is MSSV
            email: email,
            name: fullName,
            phone: phone,
            role: 'student'
        });

        // 2. Create Student and link to User
        let student;
        try {
            student = await Student.create({
                mssv,
                fullName,
                email,
                phone,
                class: classId,
                dob,
                gender,
                address,
                status,
                avatarUrl,
                userId: user._id
            });
        } catch (dbError) {
            await User.findByIdAndDelete(user._id);
            throw dbError;
        }

        const populated = await Student.findById(student._id).populate({
            path: 'class',
            populate: { 
                path: 'major', 
                populate: { 
                    path: 'faculty',
                    populate: { path: 'college' }
                } 
            }
        });

        res.status(201).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res) => {
    try {
        const { mssv, fullName, email, phone, class: classId, dob, gender, address, status, avatarUrl } = req.body;

        const student = await Student.findById(req.params.id);

        if (student) {
            student.mssv = mssv || student.mssv;
            student.fullName = fullName || student.fullName;
            student.email = email || student.email;
            student.phone = phone || student.phone;
            student.class = classId || student.class;
            student.dob = dob !== undefined ? dob : student.dob;
            student.gender = gender || student.gender;
            student.address = address !== undefined ? address : student.address;
            student.status = status || student.status;
            student.avatarUrl = avatarUrl !== undefined ? avatarUrl : student.avatarUrl;

            await student.save();
            const populated = await Student.findById(student._id).populate({
                path: 'class',
                populate: { 
                    path: 'major', 
                    populate: { 
                        path: 'faculty',
                        populate: { path: 'college' }
                    } 
                }
            });
            res.json(populated);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            await student.deleteOne();
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk import students
// @route   POST /api/students/bulk-import
const bulkImportStudents = async (req, res) => {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: 'No student data provided' });
    }

    const results = { success: [], failed: [] };

    for (const item of students) {
        try {
            const { mssv, fullName, email, phone, class: classVal, dob, gender, address, status } = item;

            if (!mssv || !fullName || !email || !phone || !classVal) {
                results.failed.push({ row: item, reason: 'Missing required fields: mssv, fullName, email, phone, class' });
                continue;
            }

            // Lookup class by code or name
            const targetClass = await require('../models/Class').findOne({ 
                $or: [{ code: classVal }, { name: classVal }] 
            });
            if (!targetClass) {
                results.failed.push({ row: item, reason: `Class not found: ${classVal}` });
                continue;
            }
            const classId = targetClass._id;

            const studentExists = await Student.findOne({ $or: [{ mssv }, { email }] });
            if (studentExists) {
                results.failed.push({ row: item, reason: `Duplicate mssv or email: ${mssv} / ${email}` });
                continue;
            }

            const userExists = await User.findOne({ username: mssv });
            if (userExists) {
                results.failed.push({ row: item, reason: `User account already exists for: ${mssv}` });
                continue;
            }

            const user = await User.create({
                username: mssv,
                password: mssv,
                email,
                name: fullName,
                phone,
                role: 'student'
            });

            try {
                await Student.create({
                    mssv, fullName, email, phone,
                    class: classId,
                    dob: dob || null,
                    gender: gender || 'Other',
                    address: address || '',
                    status: status || 'Active',
                    userId: user._id
                });
            } catch (dbErr) {
                await User.findByIdAndDelete(user._id);
                throw dbErr;
            }

            results.success.push({ mssv, fullName });
        } catch (err) {
            results.failed.push({ row: item, reason: err.message });
        }
    }

    res.status(200).json({
        message: `Import complete: ${results.success.length} succeeded, ${results.failed.length} failed`,
        success: results.success,
        failed: results.failed
    });
};

// @desc    Get student's schedule
// @route   GET /api/students/:id/schedule?termId=xyz
const getStudentSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { termId } = req.query;

        let student;
        if (id === 'me') {
            student = await Student.findOne({ userId: req.user._id });
        } else {
            student = await Student.findById(id);
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const query = {
            $or: [
                { targetClasses: student.class },
                { enrolledStudents: student._id }
            ]
        };
        
        if (termId) {
            query.term = termId;
        }

        const classSections = await require('../models/ClassSection').find(query)
            .populate('subject', 'code name credits')
            .populate('term', 'code name')
            .populate('teacher', 'fullName employeeId');

        res.json(classSections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkImportStudents,
    getStudentSchedule,
};
