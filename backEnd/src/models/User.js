const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        name: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId; // Password not required for Google login
            },
            minlength: 8,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'teacher', 'student', 'manager'],
            default: 'user',
        },
        avatar: {
            type: String,
            default: '',
        },
        googleId: {
            type: String,
            default: null,
        },
        assignedClasses: {
            type: [String],
            default: [],
        },
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpire: {
            type: Date,
            default: null,
        },
        preferences: {
            language: { type: String, default: 'vi' },
            timezone: { type: String, default: 'gmt7' },
            theme: { type: String, default: 'light' },
            compactMode: { type: Boolean, default: false },
            notifications: {
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
                weeklyReport: { type: Boolean, default: false },
            }
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
