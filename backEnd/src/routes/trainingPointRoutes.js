const express = require('express');
const router = express.Router();
const trainingPointController = require('../controllers/trainingPointController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('admin'), trainingPointController.getAll);

router.get('/my-points', authorize('student'), trainingPointController.getMyTrainingPoints);

module.exports = router;
