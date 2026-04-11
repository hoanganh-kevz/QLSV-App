const express = require('express');
const router = express.Router();
const {
    getAllClassSections,
    createClassSection,
    updateClassSection,
    deleteClassSection,
    enrollStudent,
    unenrollStudent,
    getSectionRoster
} = require('../controllers/classSectionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllClassSections)
    .post(protect, admin, createClassSection);

router.route('/:id')
    .put(protect, updateClassSection)
    .delete(protect, admin, deleteClassSection);

router.post('/:id/enroll', protect, enrollStudent);
router.post('/:id/unenroll', protect, unenrollStudent);
router.get('/:id/roster', protect, getSectionRoster);

module.exports = router;
