const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Security Check: Prevent demoting existing admins to avoid accidental lock-outs
        if (user.role === 'admin' && req.body.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Cannot change the role of an Administrator account for security reasons. Please contact technical support if this is required.' 
            });
        }

        user.role = req.body.role || user.role;
        await user.save();
        res.json({ message: 'User role updated successfully', role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update assigned classes
// @route   PUT /api/admin/users/:id/assignments
// @access  Private/Admin
const updateUserAssignments = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.assignedClasses = req.body.assignedClasses || [];
        await user.save();
        res.json({ message: 'User assignments updated', assignedClasses: user.assignedClasses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Security check for last admin
        if (user.role === 'admin' && (await User.countDocuments({ role: 'admin' })) === 1) {
            return res.status(400).json({ message: 'Cannot delete the last administrator account' });
        }

        const userId = user._id;

        // Cascade delete: Remove associated Teacher or Student profiles
        await Promise.all([
            Student.deleteOne({ userId }),
            Teacher.deleteOne({ userId })
        ]);

        await user.deleteOne();
        res.json({ success: true, message: 'User and all associated data have been permanently removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    updateUserAssignments,
    deleteUser
};
