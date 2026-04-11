const express = require('express');
const router = express.Router();
const {
    createGrade,
    batchSaveGrades,
    updateGrade,
    getGradesByStudent,
    getGradesByClass,
    deleteGrade,
    getAllGrades,
} = require('../controllers/gradeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllGrades);
router.post('/', protect, createGrade);
router.post('/batch', protect, batchSaveGrades);
router.get('/student/:studentId', protect, getGradesByStudent);
router.get('/class', protect, getGradesByClass);
router.put('/:id', protect, updateGrade);
router.delete('/:id', protect, deleteGrade);

module.exports = router;
