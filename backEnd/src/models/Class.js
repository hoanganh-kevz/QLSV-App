const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    major: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major',
        required: true
    },
    batch: {
        type: String, // e.g., "K50", "K51"
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Graduated'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
