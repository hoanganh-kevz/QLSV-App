const Major = require('../models/Major');

// @desc    Get all majors
// @route   GET /api/majors
// @access  Public
const getMajors = async (req, res) => {
    try {
        const { facultyId } = req.query;
        const query = { status: 'Active' };
        if (facultyId) query.faculty = facultyId;

        const majors = await Major.find(query)
            .populate('faculty', 'name type')
            .sort({ name: 1 });
        res.json(majors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a major
// @route   POST /api/majors
// @access  Private/Admin
const createMajor = async (req, res) => {
    try {
        const { code, name, facultyId } = req.body;
        const exists = await Major.findOne({ code: code.toUpperCase() });
        if (exists) return res.status(400).json({ message: 'Major code already exists' });
        
        const major = await Major.create({ code, name, faculty: facultyId });
        res.status(201).json(major);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a major
// @route   PUT /api/majors/:id
const updateMajor = async (req, res) => {
    try {
        const { code, name, facultyId, status } = req.body;
        const updated = await Major.findByIdAndUpdate(
            req.params.id,
            { code, name, faculty: facultyId, status },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Major not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a major
// @route   DELETE /api/majors/:id
const deleteMajor = async (req, res) => {
    try {
        const deleted = await Major.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Major not found' });
        res.json({ message: 'Major removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMajors, createMajor, updateMajor, deleteMajor };
