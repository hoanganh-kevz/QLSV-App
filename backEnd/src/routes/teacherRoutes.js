const express = require('express');
const router = express.Router();
const { getTeachers, createTeacher, updateTeacher, deleteTeacher, bulkImportTeachers, getTeacherSchedule } = require('../controllers/teacherController');
const { getMyOverrides, createOverride, updateOverride, deleteOverride } = require('../controllers/weeklyOverrideController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getTeachers);
router.post('/', createTeacher);
router.post('/bulk-import', bulkImportTeachers);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

// Weekly override routes (giảng viên tùy chỉnh lịch theo tuần) - phải đặt trước /:id/schedule
router.get('/me/schedule-overrides', protect, getMyOverrides);
router.post('/me/schedule-overrides', protect, createOverride);
router.put('/me/schedule-overrides/:classSectionId/:week', protect, updateOverride);
router.delete('/me/schedule-overrides/:classSectionId/:week', protect, deleteOverride);

router.get('/:id/schedule', protect, getTeacherSchedule);

module.exports = router;
