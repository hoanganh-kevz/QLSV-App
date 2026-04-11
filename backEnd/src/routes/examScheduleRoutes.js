const express = require('express');
const router = express.Router();
const examScheduleController = require('../controllers/examScheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher'), examScheduleController.getAll);

router.get('/my-schedule', authorize('student'), examScheduleController.getMyExamSchedule);

module.exports = router;
