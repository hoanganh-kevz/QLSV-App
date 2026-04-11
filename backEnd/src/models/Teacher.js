const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
    {
        teacherId: {
            type: String,
            required: [true, 'Teacher ID is required'],
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        college: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: [true, 'College is required'],
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Faculty',
            required: [true, 'Faculty is required'],
        },
        major: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Major',
            default: null, // Optional - teachers belong to faculty, not a specific major
        },
        specialization: {
            type: String,
            trim: true,
            default: '',
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            default: 'Other',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'On Leave'],
            default: 'Active',
        },
        avatarUrl: {
            type: String,
            default: null,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
