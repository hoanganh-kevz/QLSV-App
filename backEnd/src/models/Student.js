const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
    {
        mssv: {
            type: String,
            required: [true, 'Student ID (MSSV) is required'],
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
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class is required'],
        },
        dob: {
            type: Date,
            required: false,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            default: 'Other',
        },
        address: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Graduated'],
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

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
