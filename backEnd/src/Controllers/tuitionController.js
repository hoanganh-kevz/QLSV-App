const Tuition = require('../models/Tuition');
const Student = require('../models/Student');
const CourseRegistration = require('../models/CourseRegistration');
const ClassSection = require('../models/ClassSection');
const Term = require('../models/Term');

const PRICE_PER_CREDIT = 500000; // 500k VND per credit

// @desc    Get all tuition records (Admin)
// @route   GET /api/tuitions
// @access  Private (Admin)
exports.getAll = async (req, res) => {
  try {
    const tuitions = await Tuition.find()
      .populate('student', 'mssv fullName')
      .populate('term', 'code name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tuitions });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Get current student's tuition
// @route   GET /api/tuitions/my-tuition
// @access  Private (Student)
exports.getMyTuition = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }
    const tuitions = await Tuition.find({ student: student._id })
      .populate('term', 'code name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tuitions });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Calculate and update student tuition for a specific term
exports.updateStudentTuition = async (studentId, termId) => {
  try {
    // 1. Get all active registrations for this student & term
    const registrations = await CourseRegistration.find({
      student: studentId,
      term: termId,
      status: 'Registered'
    }).populate({
        path: 'classSection',
        populate: { path: 'subject', select: 'credits' }
    });

    // 2. Sum credits
    let totalCredits = 0;
    const details = [];
    
    registrations.forEach(reg => {
        const credits = reg.classSection?.subject?.credits || 0;
        const subName = reg.classSection?.subject?.name || 'Môn học';
        totalCredits += credits;
        details.push({
            description: `Học phí môn: ${subName}`,
            amount: credits * PRICE_PER_CREDIT
        });
    });

    const totalAmount = totalCredits * PRICE_PER_CREDIT;

    // 3. Update or Create Tuition record
    const tuition = await Tuition.findOneAndUpdate(
      { student: studentId, term: termId },
      { 
        totalAmount,
        details,
        // Set deadline if creating new (e.g., 30 days from now)
        $setOnInsert: { deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      },
      { upsert: true, new: true }
    );

    return tuition;
  } catch (error) {
    console.error('Error updating tuition:', error);
    throw error;
  }
};
