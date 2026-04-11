import api from './api';

export const classSectionService = {
    getAllSections: async () => {
        try {
            const response = await api.get('/class-sections');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch class sections'
            };
        }
    },
    
    createSection: async (sectionData) => {
        try {
            const response = await api.post('/class-sections', sectionData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create class section'
            };
        }
    },
    
    updateSection: async (id, sectionData) => {
        try {
            const response = await api.put(`/class-sections/${id}`, sectionData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update class section'
            };
        }
    },
    
    deleteSection: async (id) => {
        try {
            const response = await api.delete(`/class-sections/${id}`);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete class section'
            };
        }
    },
    
    enrollStudent: async (sectionId, studentId) => {
        try {
            const response = await api.post(`/class-sections/${sectionId}/enroll`, { studentId });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to enroll in class section'
            };
        }
    },
    
    unenrollStudent: async (sectionId, studentId) => {
        try {
            const response = await api.post(`/class-sections/${sectionId}/unenroll`, { studentId });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to unenroll from class section'
            };
        }
    },
    
    getSectionRoster: async (id) => {
        try {
            const response = await api.get(`/class-sections/${id}/roster`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch class roster'
            };
        }
    }
};
