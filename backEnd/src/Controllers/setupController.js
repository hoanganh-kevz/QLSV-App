const User = require('../models/User');

// @desc    Check if system needs setup (no admin exists)
// @route   GET /api/setup/status
// @access  Public
const getSetupStatus = async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        res.json({ setupRequired: adminCount === 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Initialize system with first admin
// @route   POST /api/setup/init
// @access  Public
const initializeSystem = async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        
        if (adminCount > 0) {
            return res.status(403).json({ 
                message: 'System already initialized. Initial setup not allowed.' 
            });
        }

        const { username, email, password, name } = req.body;

        const user = await User.create({
            username,
            email,
            password,
            name,
            role: 'admin'
        });

        if (user) {
            res.status(201).json({
                message: 'System initialized successfully',
                _id: user._id,
                username: user.username,
                role: user.role
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSetupStatus, initializeSystem };
