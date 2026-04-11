const Class = require('../models/Class');

// @desc    Get all classes
// @route   GET /api/classes
const getClasses = async (req, res) => {
    try {
        const { majorId, batch } = req.query;
        const query = { status: 'Active' };
        if (majorId) query.major = majorId;
        if (batch) query.batch = batch;

        const classes = await Class.find(query)
            .populate({
                path: 'major',
                populate: { 
                    path: 'faculty',
                    populate: { path: 'college' }
                }
            })
            .sort({ code: 1 });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a class
// @route   POST /api/classes
const createClass = async (req, res) => {
    try {
        const { code, name, majorId, batch } = req.body;
        const newClass = await Class.create({ 
            code, 
            name, 
            major: majorId,
            batch: batch || 'K50'
        });
        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
const updateClass = async (req, res) => {
    try {
        const { code, name, majorId, batch, status } = req.body;
        const updatedClass = await Class.findByIdAndUpdate(
            req.params.id, 
            { code, name, major: majorId, batch, status },
            { new: true }
        );
        if (!updatedClass) return res.status(404).json({ message: 'Class not found' });
        res.json(updatedClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
const deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) return res.status(404).json({ message: 'Class not found' });
        res.json({ message: 'Class removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getClasses, createClass, updateClass, deleteClass };

