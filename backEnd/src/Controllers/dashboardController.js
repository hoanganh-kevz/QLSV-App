const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Grade = require('../models/Grade');
const ClassSection = require('../models/ClassSection');
const Subject = require('../models/Subject');
const Term = require('../models/Term');

// @desc    Get dashboard statistics (role-based, real data only)
// @route   GET /api/dashboard/stats
// @access  Private (requires protect middleware)
const getDashboardStats = async (req, res) => {
    try {
        const role = req.user?.role || 'admin';
        const userId = req.user?._id;
        const { termId } = req.query; // New: optional term filtering

        // ================================================================
        // ADMIN & MANAGER: System-wide overview
        // ================================================================
        if (role === 'admin' || role === 'manager') {
            // Use try-catch or Promise.all with individual catch if needed, 
            // but here we expect basic counts to work
            const [totalStudents, totalTeachers, totalClassSections, totalSubjects, totalTerms] = await Promise.all([
                Student.countDocuments({ status: 'Active' }).catch(() => 0),
                Teacher.countDocuments({ status: 'Active' }).catch(() => 0),
                ClassSection.countDocuments({ status: 'Active' }).catch(() => 0),
                Subject.countDocuments({ status: 'Active' }).catch(() => 0),
                Term.countDocuments({}).catch(() => 0),
            ]);

            // Statistical breakdown of sections per term
            const classSectionsByTerm = await ClassSection.aggregate([
                { $group: { _id: '$term', count: { $sum: 1 } } },
                {
                    $lookup: {
                        from: 'terms',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'termInfo'
                    }
                },
                { $unwind: { path: '$termInfo', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        termCode: { $ifNull: ['$termInfo.code', 'Other'] },
                        termName: { $ifNull: ['$termInfo.name', 'N/A'] },
                        count: 1
                    }
                },
                { $sort: { termCode: 1 } }
            ]).catch(err => {
                console.error('Admin Dashboard Aggregation Error (terms):', err);
                return [];
            });

            // Students per admin class
            const studentsByClass = await Student.aggregate([
                { $match: { status: 'Active' } },
                { $group: { _id: '$class', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'classes',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'classInfo'
                    }
                },
                { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        name: { $ifNull: ['$classInfo.name', 'Unknown'] },
                        count: 1
                    }
                }
            ]).catch(err => {
                console.error('Admin Dashboard Aggregation Error (classes):', err);
                return [];
            });

            // Status distribution for sections
            const classSectionStatusDist = await ClassSection.aggregate([
                { $group: { _id: '$status', value: { $sum: 1 } } },
                { $project: { name: '$_id', value: 1, _id: 0 } }
            ]).catch(() => []);

            return res.json({
                success: true,
                data: {
                    role: 'admin',
                    metrics: {
                        totalStudents,
                        totalTeachers,
                        totalClassSections,
                        totalSubjects,
                        totalTerms,
                    },
                    classSectionsByTerm: classSectionsByTerm.map(t => ({
                        term: t.termCode,
                        termName: t.termName,
                        count: t.count
                    })),
                    studentsByClass: studentsByClass.map(c => ({
                        name: c.name,
                        value: c.count
                    })),
                    classSectionStatusDist,
                }
            });
        }

        // ================================================================
        // TEACHER: Chỉ hiện dữ liệu lớp mình đang giảng dạy
        // ================================================================
        if (role === 'teacher') {
            // Tìm Teacher profile theo userId (field tên là 'userId' trong Teacher model)
            const teacher = await Teacher.findOne({ userId: userId });
            if (!teacher) {
                return res.json({
                    success: true,
                    data: {
                        role: 'teacher',
                        noProfile: true,
                        metrics: { totalClasses: 0, totalStudents: 0, avgGrade: 0 },
                        classSections: [],
                        gradeDistribution: [],
                        performanceByClass: [],
                    }
                });
            }

            // Filter by Teacher ID
            const query = { teacher: teacher._id };
            if (termId) {
                query.term = termId;
            }

            // Lấy tất cả lớp học phần theo query
            const classSections = await ClassSection.find(query)
                .populate('subject', 'name code credits')
                .populate('term', 'code name status');

            const classSectionIds = classSections.map(c => c._id);

            // Với mỗi lớp: lấy danh sách sinh viên đã enroll
            const classSectionIdsStr = classSections.map(c => c._id.toString());

            // Tổng số sinh viên enrolled trong tất cả các lớp (unique)
            const enrolledStudentIds = new Set();
            classSections.forEach(cs => {
                cs.enrolledStudents.forEach(sid => enrolledStudentIds.add(sid.toString()));
            });

            // Lấy điểm số của tất cả sinh viên trong các lớp (dùng classStr)
            // Lấy classStr của các lớp này
            const classSectionCodes = classSections.map(c => c.code);
            const grades = await Grade.find({
                classStr: { $in: classSectionCodes },
                totalScore: { $ne: null }
            });

            const avgGrade = grades.length > 0
                ? (grades.reduce((sum, g) => sum + g.totalScore, 0) / grades.length)
                : 0;

            // Phổ điểm chữ
            const distribution = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D+': 0, 'D': 0, 'F': 0 };
            grades.forEach(g => {
                if (g.letterGrade && distribution[g.letterGrade] !== undefined) {
                    distribution[g.letterGrade]++;
                }
            });
            const gradeDistribution = Object.entries(distribution)
                .filter(([_, v]) => v > 0)
                .map(([name, value]) => ({ name, value }));

            // Hiệu suất theo từng lớp học phần (mỗi lớp riêng biệt)
            const performanceByClass = classSections.map(cs => {
                const classGrades = grades.filter(g => g.classStr === cs.code);
                const avg = classGrades.length > 0
                    ? parseFloat((classGrades.reduce((s, g) => s + g.totalScore, 0) / classGrades.length).toFixed(2))
                    : 0;
                return {
                    classCode: cs.code,
                    subjectName: cs.subject?.name || cs.code,
                    termCode: cs.term?.code || 'N/A',
                    enrolledCount: cs.enrolledStudents.length,
                    gradedCount: classGrades.length,
                    avgScore: avg,
                    status: cs.status,
                };
            });

            return res.json({
                success: true,
                data: {
                    role: 'teacher',
                    metrics: {
                        totalClasses: classSections.length,
                        totalStudents: enrolledStudentIds.size,
                        avgGrade: parseFloat(avgGrade.toFixed(2)),
                    },
                    classSections: classSections.map(cs => ({
                        id: cs._id,
                        code: cs.code,
                        subjectName: cs.subject?.name || 'N/A',
                        termCode: cs.term?.code || 'N/A',
                        enrolledCount: cs.enrolledStudents.length,
                        maxStudents: cs.maxStudents,
                        status: cs.status,
                        teachingMethod: cs.teachingMethod,
                    })),
                    gradeDistribution,
                    performanceByClass,
                }
            });
        }

        // ================================================================
        // STUDENT: Chỉ hiện điểm của chính sinh viên đó
        // ================================================================
        if (role === 'student') {
            // Tìm Student profile theo userId (field tên là 'userId' trong Student model)
            const student = await Student.findOne({ userId: userId }).populate('class', 'name');
            
            if (!student) {
                return res.json({
                    success: true,
                    data: {
                        role: 'student',
                        noProfile: true,
                        metrics: { avgGpa: 0, totalCredits: 0, totalCourses: 0, passedCourses: 0 },
                        performanceData: [],
                        gradeDetails: [],
                    }
                });
            }

            // Lấy toàn bộ điểm theo studentId (ObjectId, đúng field)
            const grades = await Grade.find({ studentId: student._id });

            const passedGrades = grades.filter(g => g.gpa4 !== null && g.gpa4 >= 1.0 && g.totalScore !== null);
            const failedGrades = grades.filter(g => g.gpa4 !== null && g.gpa4 < 1.0 && g.totalScore !== null);

            // Tính GPA 4.0 với trọng số tín chỉ (nếu có) hoặc đơn giản trung bình
            const gradesWithScore = grades.filter(g => g.gpa4 !== null && g.totalScore !== null);
            const avgGpa = gradesWithScore.length
                ? parseFloat((gradesWithScore.reduce((s, g) => s + g.gpa4, 0) / gradesWithScore.length).toFixed(2))
                : 0;

            // Tổng số tín chỉ — lấy từ Subject nếu có, fallback về 3
            const subjectCodes = [...new Set(grades.map(g => g.subjectCode).filter(Boolean))];
            const subjects = await Subject.find({ code: { $in: subjectCodes } }, 'code credits');
            const creditMap = {};
            subjects.forEach(s => { creditMap[s.code] = s.credits; });

            const totalCredits = passedGrades.reduce((sum, g) => sum + (creditMap[g.subjectCode] || 3), 0);

            // Tiến độ GPA qua từng học kỳ
            const semesterMap = {};
            gradesWithScore.forEach(g => {
                if (!g.semester) return;
                if (!semesterMap[g.semester]) semesterMap[g.semester] = { total: 0, count: 0, credits: 0 };
                semesterMap[g.semester].total += g.gpa4;
                semesterMap[g.semester].count += 1;
                semesterMap[g.semester].credits += (creditMap[g.subjectCode] || 3);
            });

            const performanceData = Object.entries(semesterMap)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([semester, stat]) => ({
                    semester,
                    avgGpa: parseFloat((stat.total / stat.count).toFixed(2)),
                    credits: stat.credits,
                }));

            return res.json({
                success: true,
                data: {
                    role: 'student',
                    studentInfo: {
                        fullName: student.fullName,
                        mssv: student.mssv,
                        className: student.class?.name || 'N/A',
                    },
                    metrics: {
                        avgGpa,
                        totalCredits,
                        totalCourses: grades.length,
                        passedCourses: passedGrades.length,
                        failedCourses: failedGrades.length,
                    },
                    performanceData,
                    // Chi tiết từng môn để hiển thị bảng
                    gradeDetails: grades.map(g => ({
                        subjectCode: g.subjectCode,
                        subjectName: g.subjectName,
                        semester: g.semester,
                        totalScore: g.totalScore,
                        gpa4: g.gpa4,
                        letterGrade: g.letterGrade,
                        credits: creditMap[g.subjectCode] || 3,
                    })),
                }
            });
        }

        // Fallback nếu role không hợp lệ
        return res.status(403).json({ success: false, message: 'Vai trò không được phép' });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

module.exports = {
    getDashboardStats,
};
