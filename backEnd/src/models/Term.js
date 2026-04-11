const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Term code is required'],
        unique: true,
        trim: true,
        uppercase: true // e.g., HK1-2024
    },
    name: {
        type: String,
        required: [true, 'Term name is required'],
        trim: true // e.g., Học kỳ 1 Năm học 2024-2025
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Active', 'Locked'],
        default: 'Upcoming'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Term', termSchema);
