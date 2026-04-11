const express = require('express');
const router = express.Router();
const courseRegistrationController = require('../controllers/courseRegistrationController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Giả định dùng chung middleware

// Bảo vệ tất cả route
router.use(protect);

router.get('/available', courseRegistrationController.getAvailableClasses);
router.get('/my-registrations', authorize('student'), courseRegistrationController.getMyRegistrations);

router.route('/')
  .post(authorize('student'), courseRegistrationController.registerClass);

router.route('/:id')
  .delete(authorize('student'), courseRegistrationController.cancelRegistration);

module.exports = router;
