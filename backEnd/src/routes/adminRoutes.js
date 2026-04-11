const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, updateUserAssignments, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/assignments', updateUserAssignments);
router.delete('/users/:id', deleteUser);

module.exports = router;
