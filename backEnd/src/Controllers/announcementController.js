const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('author', 'name role username')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (Admin)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, isUrgent, expiresAt } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      category,
      isUrgent,
      expiresAt,
      author: req.user._id
    });
    
    const populated = await announcement.populate('author', 'name role username');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    await announcement.deleteOne();
    res.status(200).json({ success: true, message: 'Đã xóa thông báo' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
