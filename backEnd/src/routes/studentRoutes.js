const express = require('express');
const {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkImportStudents,
    getStudentSchedule,
} = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

const apiRouter = express.Router();

apiRouter.route('/')
    .get(protect, getStudents)
    .post(protect, admin, createStudent);

apiRouter.post('/bulk-import', protect, admin, bulkImportStudents);

apiRouter.route('/:id')
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);

apiRouter.get('/:id/schedule', protect, getStudentSchedule);

module.exports = apiRouter;
