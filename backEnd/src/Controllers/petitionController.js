const Petition = require('../models/Petition');
const Student = require('../models/Student');

// @desc    Get all petitions (Admin/Teacher)
// @route   GET /api/petitions
// @access  Private (Admin, Teacher)
exports.getAll = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ Admin mới có quyền quản lý đơn từ' });
    }
    const petitions = await Petition.find()
      .populate('student', 'mssv fullName')
      .populate({
        path: 'classSection',
        select: 'code subject',
        populate: {
          path: 'subject',
          select: 'name code'
        }
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: petitions });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Get current student's petitions
// @route   GET /api/petitions/my-petitions
// @access  Private (Student)
exports.getMyPetitions = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }
    const petitions = await Petition.find({ student: student._id })
      .populate({
        path: 'classSection',
        select: 'code subject',
        populate: {
          path: 'subject',
          select: 'name code'
        }
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: petitions });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Create a petition
// @route   POST /api/petitions
// @access  Private (Student)
exports.createPetition = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }
    const { type, title, content, attachmentUrl, classSectionId, absenceDate } = req.body;
    const petition = await Petition.create({
      student: student._id,
      classSection: classSectionId || null,
      absenceDate: absenceDate || null,
      type,
      title,
      content,
      attachmentUrl
    });
    res.status(201).json({ success: true, data: petition });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Update petition status (Admin/Teacher)
// @route   PUT /api/petitions/:id/status
// @access  Private (Admin, Teacher)
exports.updateStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ Admin mới có quyền cập nhật trạng thái đơn từ' });
    }
    const { status, response } = req.body;
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: 'Không tìm thấy đơn từ' });
    }
    petition.status = status;
    petition.response = response;
    petition.respondedBy = req.user._id;
    await petition.save();
    res.status(200).json({ success: true, data: petition });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Update a petition (Student)
// @route   PUT /api/petitions/:id
// @access  Private (Student)
exports.updatePetition = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: 'Không tìm thấy đơn từ' });
    }

    if (petition.student.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa đơn này' });
    }

    if (petition.status !== 'Pending') {
      return res.status(400).json({ message: 'Chỉ có thể sửa đơn khi đang ở trạng thái chờ duyệt' });
    }

    const { type, title, content, attachmentUrl, classSectionId, absenceDate } = req.body;
    
    petition.type = type || petition.type;
    petition.title = title || petition.title;
    petition.content = content || petition.content;
    petition.attachmentUrl = attachmentUrl || petition.attachmentUrl;
    if (classSectionId !== undefined) petition.classSection = classSectionId;
    if (absenceDate !== undefined) petition.absenceDate = absenceDate;

    await petition.save();
    res.status(200).json({ success: true, data: petition });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Delete a petition (Student)
// @route   DELETE /api/petitions/:id
// @access  Private (Student)
exports.deletePetition = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
    }

    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: 'Không tìm thấy đơn từ' });
    }

    if (petition.student.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa đơn này' });
    }

    if (petition.status !== 'Pending') {
      return res.status(400).json({ message: 'Chỉ có thể xóa đơn khi đang ở trạng thái chờ duyệt' });
    }

    await petition.deleteOne();
    res.status(200).json({ success: true, message: 'Đã xóa đơn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
