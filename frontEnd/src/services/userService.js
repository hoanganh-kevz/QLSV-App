import api from './api';

export const userService = {
    /**
     * Get all users (Admin only)
     */
    getAllUsers: async () => {
        try {
            const response = await api.get('/admin/users');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch users' };
        }
    },

    /**
     * Update user role
     */
    updateUserRole: async (userId, newRole) => {
        try {
            const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: 'Failed to update user role' };
        }
    },

    /**
     * Update teacher assignments
     */
    updateAssignments: async (userId, assignedClasses) => {
        try {
            const response = await api.put(`/admin/users/${userId}/assignments`, { assignedClasses });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: 'Failed to update assignments' };
        }
    },

    /**
     * Delete user
     */
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Delete user error:', error.response?.data || error);
            return { success: false, message: error.response?.data?.message || 'Failed to delete user' };
        }
    }
};
