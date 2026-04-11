const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Bảo vệ tất cả route
router.use(protect);

router.post('/batch', authorize('admin', 'teacher'), attendanceController.batchMark);
router.get('/my-history', authorize('student'), attendanceController.getStudentHistory);
router.get('/class/:classSectionId', authorize('admin', 'teacher'), attendanceController.getClassRecords);

module.exports = router;
