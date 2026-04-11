const Teacher = require('../models/Teacher');
const ClassSection = require('../models/ClassSection');

// Helper: tìm giảng viên từ user đang đăng nhập
const getTeacherFromUser = async (userId) => {
    const teacher = await Teacher.findOne({ userId });
    if (!teacher) throw new Error('Không tìm thấy giảng viên');
    return teacher;
};

// @desc    Lấy tất cả overrides của giảng viên hiện tại
// @route   GET /api/teachers/me/schedule-overrides?termId=&week=
const getMyOverrides = async (req, res) => {
    try {
        const teacher = await getTeacherFromUser(req.user._id);
        const { termId, week } = req.query;

        const query = { teacher: teacher._id };
        if (termId) query.term = termId;

        const sections = await ClassSection.find(query)
            .populate('subject', 'code name credits')
            .populate('term', 'code name startDate endDate')
            .select('code weeklyOverrides schedule subject term');

        // Lọc và trả về overrides theo tuần nếu có
        let result = sections.map(s => ({
            classSectionId: s._id,
            code: s.code,
            subject: s.subject,
            term: s.term,
            baseSchedule: s.schedule,
            overrides: week
                ? s.weeklyOverrides.filter(o => o.week === parseInt(week))
                : s.weeklyOverrides
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Tạo hoặc cập nhật override cho một lớp trong một tuần cụ thể
// @route   POST /api/teachers/me/schedule-overrides
const createOverride = async (req, res) => {
    try {
        const teacher = await getTeacherFromUser(req.user._id);
        const { classSectionId, week, termId, overrideType, schedule, teachingMethod, room, note } = req.body;

        if (!classSectionId || !week || !overrideType) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: classSectionId, week, overrideType' });
        }

        const section = await ClassSection.findOne({ _id: classSectionId, teacher: teacher._id });
        if (!section) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học phần hoặc bạn không có quyền chỉnh sửa' });
        }

        // Xóa override cũ cho tuần này nếu có
        section.weeklyOverrides = section.weeklyOverrides.filter(o => o.week !== parseInt(week));

        // Thêm override mới
        section.weeklyOverrides.push({
            week: parseInt(week),
            termId: termId || section.term,
            overrideType,
            schedule: schedule || [],
            teachingMethod,
            room,
            note,
            createdAt: new Date()
        });

        await section.save();

        const updated = await ClassSection.findById(section._id)
            .populate('subject', 'code name credits')
            .populate('term', 'code name');

        res.status(201).json({
            message: 'Đã lưu tùy chỉnh tuần thành công',
            classSection: updated
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Cập nhật override (alias POST - dùng chung xử lý)
// @route   PUT /api/teachers/me/schedule-overrides/:classSectionId/:week
const updateOverride = async (req, res) => {
    try {
        const teacher = await getTeacherFromUser(req.user._id);
        const { classSectionId, week } = req.params;
        const { overrideType, schedule, teachingMethod, room, note, termId } = req.body;

        const section = await ClassSection.findOne({ _id: classSectionId, teacher: teacher._id });
        if (!section) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học phần hoặc bạn không có quyền chỉnh sửa' });
        }

        const overrideIdx = section.weeklyOverrides.findIndex(o => o.week === parseInt(week));
        if (overrideIdx === -1) {
            return res.status(404).json({ message: 'Không tìm thấy override cho tuần này' });
        }

        const existing = section.weeklyOverrides[overrideIdx];
        existing.overrideType = overrideType ?? existing.overrideType;
        existing.schedule = schedule ?? existing.schedule;
        existing.teachingMethod = teachingMethod ?? existing.teachingMethod;
        existing.room = room ?? existing.room;
        existing.note = note ?? existing.note;
        if (termId) existing.termId = termId;

        await section.save();

        const updated = await ClassSection.findById(section._id)
            .populate('subject', 'code name credits')
            .populate('term', 'code name');

        res.json({ message: 'Đã cập nhật tùy chỉnh thành công', classSection: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Xóa override (khôi phục về lịch gốc)
// @route   DELETE /api/teachers/me/schedule-overrides/:classSectionId/:week
const deleteOverride = async (req, res) => {
    try {
        const teacher = await getTeacherFromUser(req.user._id);
        const { classSectionId, week } = req.params;

        const section = await ClassSection.findOne({ _id: classSectionId, teacher: teacher._id });
        if (!section) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học phần hoặc bạn không có quyền chỉnh sửa' });
        }

        const prevLength = section.weeklyOverrides.length;
        section.weeklyOverrides = section.weeklyOverrides.filter(o => o.week !== parseInt(week));

        if (section.weeklyOverrides.length === prevLength) {
            return res.status(404).json({ message: 'Không tìm thấy override cho tuần này' });
        }

        await section.save();

        res.json({ message: 'Đã xóa tùy chỉnh, khôi phục về lịch gốc' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

module.exports = { getMyOverrides, createOverride, updateOverride, deleteOverride };
