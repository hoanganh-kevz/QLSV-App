const Faculty = require('../models/Faculty');

// @desc    Get all faculties
// @route   GET /api/faculties
// @access  Public
const getFaculties = async (req, res) => {
    try {
        const { collegeId } = req.query;
        const query = { status: 'Active' };
        if (collegeId) query.college = collegeId;

        const faculties = await Faculty.find(query)
            .populate('college', 'name')
            .sort({ name: 1 });
        res.json(faculties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a faculty
// @route   POST /api/faculties
// @access  Private/Admin
const createFaculty = async (req, res) => {
    try {
        const { code, name, type, collegeId, description } = req.body;
        const exists = await Faculty.findOne({ code: code.toUpperCase() });
        if (exists) return res.status(400).json({ message: 'Faculty code already exists' });

        const faculty = await Faculty.create({ code, name, type, college: collegeId, description });
        res.status(201).json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a faculty
// @route   PUT /api/faculties/:id
const updateFaculty = async (req, res) => {
    try {
        const { code, name, type, collegeId, description, status } = req.body;
        const updated = await Faculty.findByIdAndUpdate(
            req.params.id,
            { code, name, type, college: collegeId, description, status },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Faculty not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a faculty
// @route   DELETE /api/faculties/:id
const deleteFaculty = async (req, res) => {
    try {
        const deleted = await Faculty.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Faculty not found' });
        res.json({ message: 'Faculty removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFaculties, createFaculty, updateFaculty, deleteFaculty };
