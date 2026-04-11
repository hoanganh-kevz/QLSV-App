const express = require('express');
const router = express.Router();
const tuitionController = require('../controllers/tuitionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('admin'), tuitionController.getAll);

router.get('/my-tuition', authorize('student'), tuitionController.getMyTuition);

module.exports = router;
