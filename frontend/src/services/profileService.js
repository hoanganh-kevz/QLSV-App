import api from './api';

export const profileService = {
    /**
     * Get current user's profile
     */
    getProfile: async () => {
        try {
            const response = await api.get('/auth/me');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching profile', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch profile'
            };
        }
    },

    /**
     * Update profile details
     */
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);
            return {
                success: true,
                data: response.data,
                message: 'Profile updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update profile'
            };
        }
    },

    /**
     * Change user password
     */
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/auth/profile', {
                currentPassword: passwordData.currentPassword,
                password: passwordData.newPassword
            });
            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to change password'
            };
        }
    },

    /**
     * Update user preferences
     */
    updatePreferences: async (preferences) => {
        try {
            const response = await api.put('/auth/profile', { preferences });
            return {
                success: true,
                data: response.data,
                message: 'Preferences updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update preferences'
            };
        }
    }
};
