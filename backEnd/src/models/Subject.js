const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Subject code is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: [true, 'Subject name is required'],
        trim: true
    },
    credits: {
        type: Number,
        required: [true, 'Credits are required'],
        min: 1
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: false // Optional to not break existing data immediately, but will enforce on frontend
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
