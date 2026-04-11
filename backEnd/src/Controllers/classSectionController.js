const ClassSection = require('../models/ClassSection');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Helper to check room conflicts
const checkRoomConflict = async (termId, schedule, excludeSectionId = null) => {
    if (!schedule || schedule.length === 0) return null;
    
    const query = { term: termId, 'schedule.room': { $exists: true, $ne: 'TBA' } };
    if (excludeSectionId) {
        query._id = { $ne: excludeSectionId };
    }
    
    const otherSections = await ClassSection.find(query);
    
    for (const newSched of schedule) {
        if (!newSched.room || newSched.room === 'TBA') continue;
        
        for (const section of otherSections) {
            if (!section.schedule) continue;
            for (const existingSched of section.schedule) {
                 if (existingSched.room === newSched.room && 
                     existingSched.dayOfWeek === newSched.dayOfWeek) {
                     if (newSched.startPeriod <= existingSched.endPeriod && 
                         newSched.endPeriod >= existingSched.startPeriod) {
                         return `Conflict: Room ${newSched.room} is already booked for class ${section.code} on Day ${newSched.dayOfWeek}, periods ${existingSched.startPeriod}-${existingSched.endPeriod}`;
                     }
                 }
            }
        }
    }
    return null;
};

// @desc    Get all class sections
// @route   GET /api/class-sections
const getAllClassSections = async (req, res) => {
    try {
        let query = {};
        
        // If user is a teacher, only show their own class sections
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findOne({ userId: req.user._id });
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher profile not found' });
            }
            query.teacher = teacher._id;
        }

        const classSections = await ClassSection.find(query)
            .populate('subject', 'code name credits faculty')
            .populate('term', 'code name startDate')
            .populate('teacher', 'fullName teacherId employeeId')
            .populate('targetClasses', 'code name')
            .populate('enrolledStudents', 'mssv fullName')
            .sort({ code: 1 });
            
        res.json(classSections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a class section
// @route   POST /api/class-sections
const createClassSection = async (req, res) => {
    try {
        const { code, subject, term, teacher, maxStudents, schedule, status, targetClasses, phase, teachingMethod, language } = req.body;
        const exists = await ClassSection.findOne({ code });
        if (exists) {
            return res.status(400).json({ message: 'Class section code already exists' });
        }
        
        const conflict = await checkRoomConflict(term, schedule);
        if (conflict) {
            return res.status(400).json({ message: conflict });
        }

        const defaultGradingSchema = [
            { name: 'Chuyên cần', weight: 20, type: 'attendance', order: 1 },
            { name: 'Giữa kỳ', weight: 30, type: 'midterm', order: 2 },
            { name: 'Cuối kỳ', weight: 50, type: 'final', order: 3 }
        ];

        const classSection = await ClassSection.create({
            code, subject, term, teacher, maxStudents, schedule, status, targetClasses,
            phase: phase ?? 0, teachingMethod: teachingMethod || 'Tập trung', language: language || 'Tiếng Việt',
            gradingSchema: req.body.gradingSchema || defaultGradingSchema,
            attendanceRules: req.body.attendanceRules || { latePenalty: 0 }
        });
        const populated = await classSection.populate(['subject', 'term', 'teacher', 'targetClasses']);
        res.status(201).json(populated);
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a class section
// @route   PUT /api/class-sections/:id
const updateClassSection = async (req, res) => {
    try {
        const classSection = await ClassSection.findById(req.params.id);
        if (!classSection) return res.status(404).json({ message: 'Class section not found' });
        
        // Permission and Ownership check
        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Only lecturers and admins can update class sections' });
        }
        
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findOne({ userId: req.user._id });
            if (!teacher || (classSection.teacher && classSection.teacher.toString() !== teacher._id.toString())) {
                return res.status(403).json({ message: 'Not authorized to update this class section' });
            }
        }
        
        const { term, schedule } = req.body;
        const termIdToUse = term || classSection.term;
        const scheduleToUse = schedule || classSection.schedule;

        if (schedule) {
            const conflict = await checkRoomConflict(termIdToUse, scheduleToUse, classSection._id);
            if (conflict) {
                return res.status(400).json({ message: conflict });
            }
        }

        const updated = await ClassSection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate(['subject', 'term', 'teacher', 'targetClasses', 'enrolledStudents']);
        res.json(updated);
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a class section
// @route   DELETE /api/class-sections/:id
const deleteClassSection = async (req, res) => {
    try {
        const classSection = await ClassSection.findById(req.params.id);
        if (!classSection) return res.status(404).json({ message: 'Class section not found' });
        
        // Ownership check for teachers
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findOne({ userId: req.user._id });
            if (!teacher || classSection.teacher.toString() !== teacher._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to delete this class section' });
            }
        }
        
        await classSection.deleteOne();
        res.json({ message: 'Class section removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Enroll a student into a class section
// @route   POST /api/class-sections/:id/enroll
const enrollStudent = async (req, res) => {
    try {
        const classSectionId = req.params.id;
        const requestedStudentId = req.body.studentId;
        
        if (!requestedStudentId) {
            return res.status(400).json({ message: 'Student ID required' });
        }
        
        const classSection = await ClassSection.findById(classSectionId);
        if (!classSection) return res.status(404).json({ message: 'Class section not found' });
        
        if (classSection.enrolledStudents.length >= classSection.maxStudents) {
            return res.status(400).json({ message: 'Class section is full. Reached max capacity of ' + classSection.maxStudents });
        }
        
        if (classSection.enrolledStudents.includes(requestedStudentId)) {
            return res.status(400).json({ message: 'Student is already enrolled' });
        }
        
        const studentObj = await Student.findById(requestedStudentId);
        if (!studentObj) return res.status(404).json({ message: 'Student not found' });
        
        // Also check if student's class is already in targetClasses
        if (classSection.targetClasses && classSection.targetClasses.includes(studentObj.class.toString())) {
            return res.status(400).json({ message: 'Student is already assigned to this class section via their main class.' });
        }
        
        // Check student schedule conflict
        const studentSections = await ClassSection.find({
            term: classSection.term,
            $or: [
                { targetClasses: studentObj.class },
                { enrolledStudents: requestedStudentId }
            ]
        });
        
        if (classSection.schedule) {
            for (const newSched of classSection.schedule) {
                for (const existingSection of studentSections) {
                    if (!existingSection.schedule) continue;
                    for (const existingSched of existingSection.schedule) {
                        if (existingSched.dayOfWeek === newSched.dayOfWeek) {
                            if (newSched.startPeriod <= existingSched.endPeriod && 
                                newSched.endPeriod >= existingSched.startPeriod) {
                                return res.status(400).json({ 
                                    message: `Schedule conflict with your class ${existingSection.code} on Day ${newSched.dayOfWeek}, periods ${existingSched.startPeriod}-${existingSched.endPeriod}` 
                                });
                            }
                        }
                    }
                }
            }
        }
        
        classSection.enrolledStudents.push(requestedStudentId);
        await classSection.save();
        
        res.json({ message: 'Enrolled successfully', classSection });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Unenroll a student from a class section
// @route   POST /api/class-sections/:id/unenroll
const unenrollStudent = async (req, res) => {
    try {
        const classSectionId = req.params.id;
        const requestedStudentId = req.body.studentId;
        
        if (!requestedStudentId) {
            return res.status(400).json({ message: 'Student ID required' });
        }
        
        const classSection = await ClassSection.findById(classSectionId);
        if (!classSection) return res.status(404).json({ message: 'Class section not found' });
        
        // Ownership check for teachers
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findOne({ userId: req.user._id });
            if (!teacher || classSection.teacher.toString() !== teacher._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to modify this class section' });
            }
        }

        if (!classSection.enrolledStudents.includes(requestedStudentId)) {
            return res.status(400).json({ message: 'Student is not enrolled in this section' });
        }
        
        classSection.enrolledStudents = classSection.enrolledStudents.filter(
            id => id.toString() !== requestedStudentId.toString()
        );
        await classSection.save();
        
        res.json({ message: 'Unenrolled successfully', classSection });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get unified student roster for a class section
// @route   GET /api/class-sections/:id/roster
const getSectionRoster = async (req, res) => {
    try {
        const classSection = await ClassSection.findById(req.params.id)
            .populate('targetClasses')
            .populate('enrolledStudents', 'mssv fullName email phone class');
            
        if (!classSection) return res.status(404).json({ message: 'Class section not found' });
        
        // 1. Get students from enrolledStudents (Directly enrolled)
        let roster = classSection.enrolledStudents.map(s => ({
            _id: s._id,
            mssv: s.mssv,
            fullName: s.fullName,
            enrollType: 'Direct'
        }));
        
        // 2. Get students from targetClasses (Administrative assignment)
        if (classSection.targetClasses && classSection.targetClasses.length > 0) {
            const targetClassIds = classSection.targetClasses.map(c => c._id);
            const targetStudents = await Student.find({ class: { $in: targetClassIds } })
                .select('mssv fullName');
                
            targetStudents.forEach(ts => {
                // Prevent duplicates if a student is both in direct and target (though shouldn't happen)
                if (!roster.some(r => r._id.toString() === ts._id.toString())) {
                    roster.push({
                        _id: ts._id,
                        mssv: ts.mssv,
                        fullName: ts.fullName,
                        enrollType: 'Target Class'
                    });
                }
            });
        }
        
        res.json({ success: true, count: roster.length, data: roster });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllClassSections,
    createClassSection,
    updateClassSection,
    deleteClassSection,
    enrollStudent,
    unenrollStudent,
    getSectionRoster
};
