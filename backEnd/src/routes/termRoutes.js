const express = require('express');
const router = express.Router();
const {
    getAllTerms,
    createTerm,
    updateTerm,
    deleteTerm
} = require('../controllers/termController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAllTerms)
    .post(protect, admin, createTerm);

router.route('/:id')
    .put(protect, admin, updateTerm)
    .delete(protect, admin, deleteTerm);

module.exports = router;
