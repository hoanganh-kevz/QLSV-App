import api from './api';

export const gradeService = {
    // Get all grades
    getAllGrades: async () => {
        try {
            const response = await api.get('/grades');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching grades' };
        }
    },

    // Create single grade
    createGrade: async (gradeData) => {
        try {
            const response = await api.post('/grades', gradeData);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to create grade' };
        }
    },

    // Batch save grades
    batchSaveGrades: async (grades) => {
        try {
            const response = await api.post('/grades/batch', { grades });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to batch save grades' };
        }
    },

    // Update a grade
    updateGrade: async (id, gradeData) => {
        try {
            const response = await api.put(`/grades/${id}`, gradeData);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to update grade' };
        }
    },

    // Get grades by student (transcript)
    getGradesByStudent: async (studentId) => {
        try {
            const response = await api.get(`/grades/student/${studentId}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching transcript' };
        }
    },

    // Get grades by class (grade sheet)
    getGradesByClass: async (params) => {
        try {
            const response = await api.get('/grades/class', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching grade sheet' };
        }
    },

    // Delete a grade
    deleteGrade: async (id) => {
        try {
            const response = await api.delete(`/grades/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete grade' };
        }
    },
};
