const express = require('express');
const router = express.Router();
const teacherEvaluationController = require('../controllers/teacherEvaluationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my-evaluations', authorize('student', 'teacher', 'admin'), teacherEvaluationController.getMyEvaluations);
router.get('/eligible-classes', authorize('student'), teacherEvaluationController.getEligibleClasses);

router.route('/')
  .post(authorize('student'), teacherEvaluationController.submitEvaluation);

module.exports = router;
