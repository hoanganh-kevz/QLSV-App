const TeacherEvaluation = require('../models/TeacherEvaluation');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ClassSection = require('../models/ClassSection');
const Term = require('../models/Term');

// @desc    Submit an evaluation
// @route   POST /api/teacher-evaluations
// @access  Private (Student)
exports.submitEvaluation = async (req, res) => {
  try {
    const { classSectionId, ratings, comment } = req.body;
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    // Verify student was in this class (Unified logic: enrolledStudents or targetClasses)
    const classSection = await ClassSection.findById(classSectionId);
    if (!classSection) {
      return res.status(404).json({ message: 'Lớp học phần không tồn tại' });
    }

    const isEnrolled = classSection.enrolledStudents.includes(student._id) || 
                       classSection.targetClasses.includes(student.class);

    if (!isEnrolled) {
      return res.status(400).json({ message: 'Bạn không học lớp này hoặc không có quyền đánh giá' });
    }

    // New Requirement: Only evaluate completed classes
    if (classSection.status !== 'Completed') {
      return res.status(400).json({ message: 'Lớp học chưa hoàn thành, chưa thể gửi đánh giá' });
    }

    // Check if already evaluated
    const existing = await TeacherEvaluation.findOne({
      student: student._id,
      classSection: classSectionId
    });
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã đánh giá giảng viên cho lớp học này rồi' });
    }

    const evaluation = await TeacherEvaluation.create({
      student: student._id,
      teacher: classSection.teacher,
      classSection: classSectionId,
      ratings,
      comment
    });

    res.status(201).json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Get evaluations related to the current user (sent by students, received by teachers)
// @route   GET /api/teacher-evaluations/my-evaluations
// @access  Private (Student, Teacher)
exports.getMyEvaluations = async (req, res) => {
  try {
    const role = req.user.role;
    let query = {};
    let populateOptions = [];

    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user._id });
      if (!teacher) return res.status(404).json({ message: 'Không tìm thấy hồ sơ giảng viên' });
      query = { teacher: teacher._id };
      populateOptions = [
        { path: 'student', select: 'fullName mssv' },
        { path: 'classSection', populate: { path: 'subject', select: 'name code' } }
      ];
    } else if (role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
      query = { student: student._id };
      populateOptions = [
        { path: 'teacher', select: 'fullName' },
        { path: 'classSection', populate: { path: 'subject', select: 'name code' } }
      ];
    } else if (role === 'admin') {
      // Admins see everything
      query = {};
      populateOptions = [
        { path: 'student', select: 'fullName mssv' },
        { path: 'teacher', select: 'fullName' },
        { path: 'classSection', populate: { path: 'subject', select: 'name code' } }
      ];
    }

    const evaluations = await TeacherEvaluation.find(query)
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: evaluations });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
// @desc    Get classes eligible for evaluation (enrolled via any method)
// @route   GET /api/teacher-evaluations/eligible-classes
// @access  Private (Student)
exports.getEligibleClasses = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== 'student') {
      return res.status(200).json({ success: true, data: [], message: 'Chức năng chỉ dành cho sinh viên' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });

    // Find the default (active) term
    const activeTerm = await Term.findOne({ isDefault: true });
    
    // Build query to find sections
    const query = {
      status: { $in: ['Active', 'Completed'] }
    };
    
    // Students see all completed classes they are part of (Cohort or Manual)
    const enrolledSections = await ClassSection.find({
      ...query,
      $or: [
        { targetClasses: student.class },
        { enrolledStudents: student._id }
      ]
    }).populate('subject teacher').populate({ path: 'term', select: 'name code' });

    // Mark which ones are already evaluated
    const existingEvals = await TeacherEvaluation.find({ student: student._id });
    const evaluatedIds = existingEvals.map(ev => ev.classSection.toString());

    const result = enrolledSections.map(section => {
      const sectionObj = section.toObject();
      return {
        ...sectionObj,
        isEvaluated: evaluatedIds.includes(section._id.toString())
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
