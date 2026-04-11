const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({})
            .populate('faculty', 'code name')
            .sort({ code: 1 });
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a subject
// @route   POST /api/subjects
const createSubject = async (req, res) => {
    try {
        const { code, name, credits } = req.body;
        const exists = await Subject.findOne({ code });
        if (exists) {
            return res.status(400).json({ message: 'Subject code already exists' });
        }
        const subject = await Subject.create({ code, name, credits, faculty: req.body.faculty });
        const populatedSubject = await Subject.findById(subject._id).populate('faculty', 'code name');
        res.status(201).json(populatedSubject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('faculty', 'code name');
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        await subject.deleteOne();
        res.json({ message: 'Subject removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
};
