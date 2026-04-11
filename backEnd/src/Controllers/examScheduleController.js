const ExamSchedule = require('../models/ExamSchedule');
const CourseRegistration = require('../models/CourseRegistration');
const Student = require('../models/Student');

// @desc    Get all exam schedules (Admin)
// @route   GET /api/exam-schedules
// @access  Private (Admin)
exports.getAll = async (req, res) => {
  try {
    const schedules = await ExamSchedule.find()
      .populate({
        path: 'classSection',
        populate: { path: 'subject', select: 'name code' }
      })
      .sort({ examDate: 1, startTime: 1 });
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Get current student's exam schedule
// @route   GET /api/exam-schedules/my-schedule
// @access  Private (Student)
exports.getMyExamSchedule = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    // Find all registered classes
    const registrations = await CourseRegistration.find({ 
      student: student._id,
      status: 'Registered'
    });

    const classIds = registrations.map(r => r.classSection);

    const schedules = await ExamSchedule.find({ classSection: { $in: classIds } })
      .populate({
        path: 'classSection',
        populate: { path: 'subject', select: 'name code' }
      })
      .sort({ examDate: 1, startTime: 1 });

    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
