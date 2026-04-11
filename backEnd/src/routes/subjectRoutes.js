const express = require('express');
const router = express.Router();
const { getAllSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllSubjects)
    .post(protect, admin, createSubject);

router.route('/:id')
    .put(protect, admin, updateSubject)
    .delete(protect, admin, deleteSubject);

module.exports = router;
