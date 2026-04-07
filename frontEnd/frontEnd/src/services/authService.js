import api from './api';

// Auth Service — calls backend API for authentication

/**
 * Register a new user
 * POST /api/auth/register
 */
export const registerUser = async ({ username, email, password }) => {
    const response = await api.post('/auth/register', {
        username,
        email,
        password,
    });
    return response.data;
};

/**
 * Login user with username & password
 * POST /api/auth/login
 */
export const loginUser = async ({ username, password }) => {
    const response = await api.post('/auth/login', {
        username,
        password,
    });
    return response.data;
};

/**
 * Google Login — send Google user info to backend
 * POST /api/auth/google
 */
export const googleLogin = async (googleUserInfo) => {
    const response = await api.post('/auth/google', {
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture,
        sub: googleUserInfo.sub,
    });
    return response.data;
};

/**
 * Forgot Password — Request OTP code
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

/**
 * Reset Password — Use OTP to set new password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (payload) => {
    // payload: { email, otp, password }
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
};
