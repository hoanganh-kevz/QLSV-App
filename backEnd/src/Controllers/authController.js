const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (username.toLowerCase() === 'admin') {
            return res.status(403).json({
                message: 'Username "admin" is reserved and cannot be registered publicly.',
            });
        }

        const userExists = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (userExists) {
            return res.status(400).json({
                message: 'User with this email or username already exists',
            });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: 'user', 
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                assignedClasses: user.assignedClasses,
                preferences: user.preferences,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            $or: [{ username }, { email: username.toLowerCase() }]
        });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                assignedClasses: user.assignedClasses,
                preferences: user.preferences,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google Login
// @route   POST /api/auth/google
const googleLogin = async (req, res) => {
    try {
        const { email, name, picture, sub } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                username: email.split('@')[0], 
                email,
                name: name,
                googleId: sub,
                avatar: picture,
                role: 'user',
            });
        } else if (!user.googleId) {
            user.googleId = sub;
            if (!user.avatar) user.avatar = picture;
            if (!user.name) user.name = name;
            await user.save();
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar || picture,
            phone: user.phone,
            assignedClasses: user.assignedClasses,
            preferences: user.preferences,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                preferences: user.preferences,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.avatar = req.body.avatar || user.avatar;
            
            if (req.body.email && req.body.email !== user.email) {
                const emailExists = await User.findOne({ email: req.body.email });
                if (emailExists) {
                    return res.status(400).json({ message: 'Email already in use' });
                }
                user.email = req.body.email;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            if (req.body.preferences) {
                const existingPrefs = user.preferences ? user.preferences.toObject() : {};
                user.preferences = {
                    ...existingPrefs,
                    ...req.body.preferences,
                    notifications: {
                        ...(existingPrefs.notifications || {}),
                        ...(req.body.preferences.notifications || {})
                    }
                };
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                phone: updatedUser.phone,
                preferences: updatedUser.preferences,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password - Generate 6-digit OTP 
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng với email này.' });
        }

        // Generate 6-digit random OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP and set to resetPasswordToken field
        const hashedOtp = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');
            
        user.resetPasswordToken = hashedOtp;
        user.resetPasswordExpire = Date.now() + 3600000;

        await user.save();

        // Send real email via nodemailer
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'Mã OTP đã được gửi về email của bạn.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password with Email + OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    try {
        const { otp, password } = req.body;
        const email = req.body.email?.toLowerCase();
        
        // Hash OTP from input to match hashed OTP in DB
        const hashedOtp = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        const user = await User.findOne({
            email,
            resetPasswordToken: hashedOtp,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            const checkUser = await User.findOne({ email });
            if (!checkUser) {
                return res.status(400).json({ message: 'Email không tồn tại trong hệ thống' });
            }
            return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Mật khẩu đã được thay đổi thành công',
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    register, login, googleLogin, getMe, updateUserProfile, forgotPassword, resetPassword 
};