import api from './api';

export const termService = {
    getAllTerms: async () => {
        try {
            const response = await api.get('/terms');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch terms'
            };
        }
    },
    
    createTerm: async (termData) => {
        try {
            const response = await api.post('/terms', termData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create term'
            };
        }
    },
    
    updateTerm: async (id, termData) => {
        try {
            const response = await api.put(`/terms/${id}`, termData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update term'
            };
        }
    },
    
    deleteTerm: async (id) => {
        try {
            const response = await api.delete(`/terms/${id}`);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete term'
            };
        }
    }
};
