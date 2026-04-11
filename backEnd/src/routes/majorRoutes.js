const express = require('express');
const router = express.Router();
const { getMajors, createMajor, updateMajor, deleteMajor } = require('../controllers/majorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getMajors)
    .post(protect, admin, createMajor);

router.route('/:id')
    .put(protect, admin, updateMajor)
    .delete(protect, admin, deleteMajor);

module.exports = router;
