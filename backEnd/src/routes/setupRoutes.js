const express = require('express');
const router = express.Router();
const { getSetupStatus, initializeSystem } = require('../controllers/setupController');

router.get('/status', getSetupStatus);
router.post('/init', initializeSystem);

module.exports = router;
