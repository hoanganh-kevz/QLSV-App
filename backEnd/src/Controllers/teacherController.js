const Teacher = require('../models/Teacher');
const User = require('../models/User');
const ClassSection = require('../models/ClassSection');

// @desc    Get all teachers
// @route   GET /api/teachers
const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({})
            .populate('college', 'name code')
            .populate('faculty', 'name code')
            .populate('major', 'name code')
            .sort({ createdAt: -1 });
        res.json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a teacher
// @route   POST /api/teachers
const createTeacher = async (req, res) => {
    try {
        const { teacherId, fullName, email, phone, college, faculty, major, specialization, gender, status, avatarUrl } = req.body;

        const exists = await Teacher.findOne({ $or: [{ teacherId }, { email }] });
        if (exists) {
            return res.status(400).json({ message: 'Teacher with this ID or Email already exists' });
        }

        const userExists = await User.findOne({ username: teacherId });
        if (userExists) {
            return res.status(400).json({ message: 'User account with this Teacher ID already exists' });
        }

        // 1. Create User
        const user = await User.create({
            username: teacherId,
            password: teacherId + '@123456', // Default password
            email: email,
            name: fullName,
            phone: phone,
            role: 'teacher'
        });

        // 2. Create Teacher and link to User
        const teacher = await Teacher.create({
            teacherId, fullName, email, phone, college, faculty, major, specialization, gender, status, avatarUrl, userId: user._id
        });

        const populated = await Teacher.findById(teacher._id)
            .populate('college', 'name')
            .populate('faculty', 'name')
            .populate('major', 'name');

        res.status(201).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
const updateTeacher = async (req, res) => {
    try {
        const { teacherId, fullName, email, phone, college, faculty, major, specialization, gender, status, avatarUrl } = req.body;

        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        teacher.fullName = fullName || teacher.fullName;
        teacher.email = email || teacher.email;
        teacher.phone = phone || teacher.phone;
        teacher.college = college || teacher.college;
        teacher.faculty = faculty || teacher.faculty;
        teacher.major = major !== undefined ? major : teacher.major;
        teacher.specialization = specialization !== undefined ? specialization : teacher.specialization;
        teacher.gender = gender || teacher.gender;
        teacher.status = status || teacher.status;
        teacher.avatarUrl = avatarUrl !== undefined ? avatarUrl : teacher.avatarUrl;

        await teacher.save();
        const updated = await Teacher.findById(teacher._id)
            .populate('college', 'name')
            .populate('faculty', 'name')
            .populate('major', 'name');
            
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        await teacher.deleteOne();
        res.json({ message: 'Teacher removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk import teachers
// @route   POST /api/teachers/bulk-import
const bulkImportTeachers = async (req, res) => {
    const { teachers } = req.body;
    if (!Array.isArray(teachers) || teachers.length === 0) {
        return res.status(400).json({ message: 'No teacher data provided' });
    }

    const College = require('../models/College');
    const Faculty = require('../models/Faculty');
    const mongoose = require('mongoose');
    const results = { success: [], failed: [] };

    for (const item of teachers) {
        try {
            const { teacherId, fullName, email, phone, college: collegeVal, faculty: facultyVal, specialization, gender, status } = item;

            if (!teacherId || !fullName || !email || !phone || !collegeVal || !facultyVal) {
                results.failed.push({ row: item, reason: 'Missing required fields: teacherId, fullName, email, phone, college, faculty' });
                continue;
            }

            // Resolve college - try ObjectId first, then by code or name
            let collegeDoc = null;
            if (mongoose.Types.ObjectId.isValid(collegeVal)) {
                collegeDoc = await College.findById(collegeVal);
            }
            if (!collegeDoc) {
                collegeDoc = await College.findOne({ $or: [{ code: collegeVal }, { name: new RegExp(collegeVal, 'i') }] });
            }
            if (!collegeDoc) {
                results.failed.push({ row: item, reason: `College not found: ${collegeVal}` });
                continue;
            }

            // Resolve faculty - try ObjectId first, then by code or name
            let facultyDoc = null;
            if (mongoose.Types.ObjectId.isValid(facultyVal)) {
                facultyDoc = await Faculty.findById(facultyVal);
            }
            if (!facultyDoc) {
                facultyDoc = await Faculty.findOne({ $or: [{ code: facultyVal }, { name: new RegExp(facultyVal, 'i') }] });
            }
            if (!facultyDoc) {
                results.failed.push({ row: item, reason: `Faculty not found: ${facultyVal}` });
                continue;
            }

            const exists = await Teacher.findOne({ $or: [{ teacherId }, { email }] });
            if (exists) {
                results.failed.push({ row: item, reason: `Duplicate teacherId or email: ${teacherId} / ${email}` });
                continue;
            }

            const userExists = await User.findOne({ username: teacherId });
            if (userExists) {
                results.failed.push({ row: item, reason: `User account already exists for: ${teacherId}` });
                continue;
            }

            const user = await User.create({
                username: teacherId,
                password: teacherId + '@123456',
                email,
                name: fullName,
                phone,
                role: 'teacher'
            });

            try {
                await Teacher.create({
                    teacherId, fullName, email, phone,
                    college: collegeDoc._id,
                    faculty: facultyDoc._id,
                    specialization: specialization || '',
                    gender: gender || 'Other',
                    status: status || 'Active',
                    userId: user._id
                });
            } catch (dbErr) {
                await User.findByIdAndDelete(user._id);
                throw dbErr;
            }

            results.success.push({ teacherId, fullName });
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

// @desc    Get teacher's schedule
// @route   GET /api/teachers/:id/schedule?termId=xyz
const getTeacherSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { termId } = req.query;

        let teacher;
        if (id === 'me') {
            teacher = await Teacher.findOne({ userId: req.user._id });
        } else {
            teacher = await Teacher.findById(id);
        }

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        
        const query = {
            teacher: teacher._id
        };
        
        if (termId) {
            query.term = termId;
        }

        const classSections = await ClassSection.find(query)
            .populate('subject', 'code name credits')
            .populate('term', 'code name startDate endDate')
            .populate('teacher', 'fullName employeeId');

        // Filter weeklyOverrides to only include overrides for the selected termId
        const result = classSections.map(section => {
            const sec = section.toObject();
            if (termId && sec.weeklyOverrides) {
                sec.weeklyOverrides = sec.weeklyOverrides.filter(
                    o => o.termId && o.termId.toString() === termId
                );
            }
            return sec;
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getTeachers, createTeacher, updateTeacher, deleteTeacher, bulkImportTeachers, getTeacherSchedule };
