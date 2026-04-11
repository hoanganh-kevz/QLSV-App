import axios from 'axios';

const API_URL = '/api/setup';

export const setupService = {
    getSetupStatus: async () => {
        try {
            const response = await axios.get(`${API_URL}/status`);
            return { success: true, setupRequired: response.data.setupRequired };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Failed to check setup status' 
            };
        }
    },

    initializeSystem: async (adminData) => {
        try {
            const response = await axios.post(`${API_URL}/init`, adminData);
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'System initialization failed' 
            };
        }
    }
};
