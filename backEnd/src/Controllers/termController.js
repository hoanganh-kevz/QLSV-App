const Term = require('../models/Term');

// @desc    Get all terms
// @route   GET /api/terms
const getAllTerms = async (req, res) => {
    try {
        const terms = await Term.find({}).sort({ startDate: -1 });
        res.json(terms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a term
// @route   POST /api/terms
const createTerm = async (req, res) => {
    try {
        const { code, name, startDate, endDate, status } = req.body;
        const exists = await Term.findOne({ code });
        if (exists) {
            return res.status(400).json({ message: 'Term code already exists' });
        }
        const term = await Term.create({ code, name, startDate, endDate, status });
        res.status(201).json(term);
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a term
// @route   PUT /api/terms/:id
const updateTerm = async (req, res) => {
    try {
        const term = await Term.findById(req.params.id);
        if (!term) return res.status(404).json({ message: 'Term not found' });
        const updated = await Term.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(updated);
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a term
// @route   DELETE /api/terms/:id
const deleteTerm = async (req, res) => {
    try {
        const term = await Term.findById(req.params.id);
        if (!term) return res.status(404).json({ message: 'Term not found' });
        await term.deleteOne();
        res.json({ message: 'Term removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllTerms,
    createTerm,
    updateTerm,
    deleteTerm
};
