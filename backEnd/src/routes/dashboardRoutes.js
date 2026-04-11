const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

// Apply protect middleware
router.get('/stats', protect, getDashboardStats);

module.exports = router;
