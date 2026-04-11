const express = require('express');
const router = express.Router();

const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getClasses)
    .post(protect, admin, createClass);

router.route('/:id')
    .put(protect, admin, updateClass)
    .delete(protect, admin, deleteClass);

module.exports = router;
