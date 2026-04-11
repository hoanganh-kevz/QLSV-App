const CourseRegistration = require('../models/CourseRegistration');
const ClassSection = require('../models/ClassSection');
const Student = require('../models/Student');
const Term = require('../models/Term');
const { findScheduleConflict } = require('../utils/scheduleUtils');
const { updateStudentTuition } = require('./tuitionController');

// @desc    Get all available class sections for registration
// @route   GET /api/course-registrations/available
// @access  Private
exports.getAvailableClasses = async (req, res) => {
  try {
    const activeTerm = await Term.findOne({ isDefault: true });
    if (!activeTerm) {
      return res.status(404).json({ message: 'Không tìm thấy học kỳ hoạt động' });
    }

    const classes = await ClassSection.find({ term: activeTerm._id })
      .populate('subject', 'name code credits')
      .populate('teacher', 'fullName');

    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Register a class section
// @route   POST /api/course-registrations
// @access  Private (Student)
exports.registerClass = async (req, res) => {
  try {
    const { classSectionId } = req.body;
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    const classSection = await ClassSection.findById(classSectionId);
    if (!classSection) {
      return res.status(404).json({ message: 'Lớp học phần không tồn tại' });
    }

    // Check if already registered
    const existing = await CourseRegistration.findOne({
      student: student._id,
      classSection: classSectionId,
      status: 'Registered'
    });
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã đăng ký lớp học này rồi' });
    }

    // Check for Schedule Conflicts with student's current registrations
    const myRegistrations = await CourseRegistration.find({
      student: student._id,
      term: classSection.term,
      status: 'Registered'
    }).populate('classSection');
    
    const existingSections = myRegistrations.map(r => r.classSection).filter(s => !!s);
    const conflict = findScheduleConflict(classSection.schedule, existingSections);
    
    if (conflict) {
      return res.status(400).json({ 
        message: `Trùng lịch: ${conflict.message}`,
        conflictDetail: conflict
      });
    }

    const registration = await CourseRegistration.create({
      student: student._id,
      classSection: classSectionId,
      term: classSection.term,
      status: 'Registered'
    });

    // SYNC: Update ClassSection.enrolledStudents array for attendance roster
    if (!classSection.enrolledStudents.includes(student._id)) {
      classSection.enrolledStudents.push(student._id);
      await classSection.save();
    }

    // SYNC: Update Tuition
    try {
      await updateStudentTuition(student._id, classSection.term);
    } catch (tuitionErr) {
      console.error('Failed to update tuition after registration:', tuitionErr);
      // Don't fail the whole registration if tuition update fails
    }

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Cancel a registration
// @route   DELETE /api/course-registrations/:id
// @access  Private (Student)
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await CourseRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đăng ký' });
    }

    // Only allow student to cancel their own registration
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || registration.student.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền hủy đăng ký này' });
    }

    const classSectionId = registration.classSection;
    const termId = registration.term;
    await registration.deleteOne();

    // SYNC: Remove from ClassSection.enrolledStudents array
    const classSection = await ClassSection.findById(classSectionId);
    if (classSection) {
      classSection.enrolledStudents = classSection.enrolledStudents.filter(
        id => id.toString() !== student._id.toString()
      );
      await classSection.save();
    }

    // SYNC: Update Tuition
    try {
      await updateStudentTuition(student._id, termId);
    } catch (tuitionErr) {
      console.error('Failed to update tuition after cancellation:', tuitionErr);
    }

    res.status(200).json({ success: true, message: 'Đã hủy đăng ký lớp học và cập nhật danh sách lớp, học phí' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Get current student's registrations
// @route   GET /api/course-registrations/my-registrations
// @access  Private (Student)
exports.getMyRegistrations = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    // Combined lookup: 
    // 1. Classes student registered for manually (CourseRegistration)
    // 2. Classes student is assigned to via their Living Class (targetClasses)
    const enrolledSections = await ClassSection.find({
      $or: [
        { targetClasses: student.class },
        { enrolledStudents: student._id }
      ]
    })
    .populate('subject', 'name code credits')
    .populate('teacher', 'fullName')
    .populate('term', 'name code')
    .sort({ createdAt: -1 });

    // To maintain compatibility with frontend, we'll format them to look like registrations if needed,
    // or just return the sections directly. Let's return the sections with a virtual registration status.
    const formattedRegistrations = enrolledSections.map(s => ({
      _id: s._id, // Using section ID as proxy
      classSection: s,
      status: 'Registered', // All these are effectively registered/enrolled
      isCohort: s.targetClasses.includes(student.class)
    }));

    res.status(200).json({ success: true, data: formattedRegistrations });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
