const express = require('express');
const router = express.Router();
const { getSystemConfig, updateSystemConfig } = require('../controllers/systemController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/config', getSystemConfig);
router.post('/config', protect, admin, updateSystemConfig);

module.exports = router;
