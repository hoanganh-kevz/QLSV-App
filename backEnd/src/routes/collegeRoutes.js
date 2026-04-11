const express = require('express');
const router = express.Router();
const { getColleges, createCollege, updateCollege, deleteCollege } = require('../controllers/collegeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getColleges)
    .post(protect, admin, createCollege);

router.route('/:id')
    .put(protect, admin, updateCollege)
    .delete(protect, admin, deleteCollege);

module.exports = router;
