const express = require('express');
const router = express.Router();
const { getFaculties, createFaculty, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getFaculties)
    .post(protect, admin, createFaculty);

router.route('/:id')
    .put(protect, admin, updateFaculty)
    .delete(protect, admin, deleteFaculty);

module.exports = router;
