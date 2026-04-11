const TrainingPoint = require('../models/TrainingPoint');
const Student = require('../models/Student');

// @desc    Get all training point records (Admin)
// @route   GET /api/training-points
// @access  Private (Admin)
exports.getAll = async (req, res) => {
  try {
    const records = await TrainingPoint.find()
      .populate('student', 'mssv fullName')
      .populate('term', 'code name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Get current student's training points
// @route   GET /api/training-points/my-points
// @access  Private (Student)
exports.getMyTrainingPoints = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }
    const records = await TrainingPoint.find({ student: student._id })
      .populate('term', 'code name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
