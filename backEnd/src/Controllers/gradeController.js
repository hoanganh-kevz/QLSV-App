const Grade = require('../models/Grade');
const Student = require('../models/Student');
const ClassSection = require('../models/ClassSection');
const TeacherEvaluation = require('../models/TeacherEvaluation');
const Term = require('../models/Term');

// @desc    Create a single grade
// @route   POST /api/grades
const createGrade = async (req, res) => {
    try {
        const { studentId, studentMssv, studentName, subjectCode, subjectName, classStr, semester, midterm, final, attendance } = req.body;

        const existing = await Grade.findOne({ studentId, subjectCode, semester });
        if (existing) {
            return res.status(400).json({ message: 'Grade already exists for this student/subject/semester' });
        }

        const grade = await Grade.create({
            studentId, studentMssv, studentName, subjectCode, subjectName, classStr, semester, midterm, final, attendance,
        });

        res.status(201).json(grade);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Batch create/update grades
// @route   POST /api/grades/batch
const batchSaveGrades = async (req, res) => {
    try {
        const { grades } = req.body; // Array of grade objects

        if (!grades || !Array.isArray(grades) || grades.length === 0) {
            return res.status(400).json({ message: 'Grades array is required' });
        }

        const results = [];
        for (const g of grades) {
            // Find existing by IDs if available, else by strings
            const query = {
                studentId: g.studentId,
                subjectCode: g.subjectCode
            };
            
            if (g.term) {
                query.term = g.term;
            } else {
                query.semester = g.semester;
            }

            const existing = await Grade.findOne(query);

            if (existing) {
                // Update dynamic components
                if (g.components) existing.components = g.components;
                if (g.isExamBanned !== undefined) existing.isExamBanned = g.isExamBanned;
                // Update IDs if they were missing before
                if (g.term) existing.term = g.term;
                if (g.classSection) existing.classSection = g.classSection;
                if (g.subject) existing.subject = g.subject;
                
                const updated = await existing.save();
                results.push(updated);
            } else {
                // Create
                const created = await Grade.create(g);
                results.push(created);
            }
        }

        res.status(200).json({ message: `Successfully saved ${results.length} grades`, data: results });
    } catch (error) {
        console.error('Batch save error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update a grade
// @route   PUT /api/grades/:id
const updateGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        const { midterm, final, attendance, subjectName } = req.body;
        if (midterm !== undefined) grade.midterm = midterm;
        if (final !== undefined) grade.final = final;
        if (attendance !== undefined) grade.attendance = attendance;
        if (subjectName) grade.subjectName = subjectName;

        const updated = await grade.save(); // triggers pre-save hook
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get grades for a student (transcript)
// @route   GET /api/grades/student/:studentId
const getGradesByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        let student = await Student.findById(studentId);
        
        // If not found by Student ID, try finding by User ID (common when student is logged in)
        if (!student) {
            student = await Student.findOne({ userId: studentId });
        }

        if (!student) return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên tương ứng' });

        // Logic check: Evaluation Requirement (Skip for admins)
        if (req.user.role !== 'admin') {
            const enrolledSections = await ClassSection.find({
                $or: [
                    { targetClasses: student.class },
                    { enrolledStudents: student._id }
                ],
                status: 'Completed'
            }).populate('subject', 'name code');

            if (enrolledSections.length > 0) {
                const completedEvals = await TeacherEvaluation.find({ student: student._id });
                const evaluatedSectionIds = completedEvals.map(e => e.classSection.toString());

                const missingEvaluations = enrolledSections.filter(s => !evaluatedSectionIds.includes(s._id.toString()));

                if (missingEvaluations.length > 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'BẠN CẦN HOÀN THÀNH ĐÁNH GIÁ GIẢNG VIÊN ĐỂ XEM ĐIỂM',
                        type: 'EVALUATION_REQUIRED',
                        missing: missingEvaluations.map(s => ({
                            id: s._id,
                            subjectName: s.subject?.name,
                            subjectCode: s.subject?.code,
                            term: s.term
                        }))
                    });
                }
            }
        }

        const grades = await Grade.find({ studentId }).sort({ semester: -1, subjectCode: 1 });
        res.json(grades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get grades by class/subject/semester (grade sheet)
// @route   GET /api/grades/class
const getGradesByClass = async (req, res) => {
    try {
        const { classStr, subjectCode, semester, termId, classSectionId } = req.query;
        const filter = {};
        
        // Prefer ObjectIDs
        if (classSectionId) filter.classSection = classSectionId;
        else if (classStr) filter.classStr = classStr;

        if (termId) filter.term = termId;
        else if (semester) filter.semester = semester;

        if (subjectCode) filter.subjectCode = subjectCode;

        const grades = await Grade.find(filter)
            .populate('studentId', 'mssv fullName')
            .populate('term', 'name code')
            .sort({ studentMssv: 1 });
            
        res.json(grades);
    } catch (error) {
        console.error('getGradesByClass error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a grade
// @route   DELETE /api/grades/:id
const deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        await grade.deleteOne();
        res.json({ message: 'Grade removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all grades
// @route   GET /api/grades
const getAllGrades = async (req, res) => {
    try {
        const grades = await Grade.find({}).sort({ createdAt: -1 });
        res.json(grades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createGrade,
    batchSaveGrades,
    updateGrade,
    getGradesByStudent,
    getGradesByClass,
    deleteGrade,
    getAllGrades,
};
