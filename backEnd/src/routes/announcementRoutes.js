const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(exports.getAll || announcementController.getAll) // Supports both formats
  .post(authorize('admin'), announcementController.createAnnouncement);

router.route('/:id')
  .delete(authorize('admin'), announcementController.deleteAnnouncement);

module.exports = router;
