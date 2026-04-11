const College = require('../models/College');

// @desc    Get all colleges
// @route   GET /api/colleges
// @access  Public
const getColleges = async (req, res) => {
    try {
        const colleges = await College.find({ status: 'Active' }).sort({ name: 1 });
        res.json(colleges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a college
// @route   POST /api/colleges
// @access  Private/Admin
const createCollege = async (req, res) => {
    try {
        const { code, name, description } = req.body;
        const exists = await College.findOne({ code: code.toUpperCase() });
        if (exists) return res.status(400).json({ message: 'College code already exists' });

        const college = await College.create({ code, name, description });
        res.status(201).json(college);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a college
// @route   PUT /api/colleges/:id
const updateCollege = async (req, res) => {
    try {
        const { code, name, description, status } = req.body;
        const updated = await College.findByIdAndUpdate(
            req.params.id,
            { code, name, description, status },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'College not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a college
// @route   DELETE /api/colleges/:id
const deleteCollege = async (req, res) => {
    try {
        const deleted = await College.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'College not found' });
        res.json({ message: 'College removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getColleges, createCollege, updateCollege, deleteCollege };
