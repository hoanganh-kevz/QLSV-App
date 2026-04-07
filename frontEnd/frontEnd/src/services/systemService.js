import api from './api';

export const systemService = {
    getColleges: async () => {
        try {
            const response = await api.get('/colleges');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching colleges' };
        }
    },
    getFaculties: async (options = {}) => {
        try {
            let params = {};
            if (typeof options === 'string') {
                params.collegeId = options;
            } else {
                params = options;
            }
            const response = await api.get('/faculties', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching faculties' };
        }
    },
    getMajors: async (options = {}) => {
        try {
            let params = {};
            if (typeof options === 'string') {
                params.facultyId = options;
            } else {
                params = options;
            }
            const response = await api.get('/majors', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching majors' };
        }
    },
    getClasses: async (options = {}) => {
        try {
            let params = {};
            if (typeof options === 'string') {
                params.majorId = options;
            } else {
                params = options;
            }
            const response = await api.get('/classes', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching classes' };
        }
    },
    // Colleges
    createCollege: async (data) => {
        try {
            const response = await api.post('/colleges', data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error creating college' };
        }
    },
    updateCollege: async (id, data) => {
        try {
            const response = await api.put(`/colleges/${id}`, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error updating college' };
        }
    },
    deleteCollege: async (id) => {
        try {
            await api.delete(`/colleges/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error deleting college' };
        }
    },

    // Faculties
    createFaculty: async (data) => {
        try {
            const response = await api.post('/faculties', data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error creating faculty' };
        }
    },
    updateFaculty: async (id, data) => {
        try {
            const response = await api.put(`/faculties/${id}`, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error updating faculty' };
        }
    },
    deleteFaculty: async (id) => {
        try {
            await api.delete(`/faculties/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error deleting faculty' };
        }
    },

    // Majors
    createMajor: async (data) => {
        try {
            const response = await api.post('/majors', data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error creating major' };
        }
    },
    updateMajor: async (id, data) => {
        try {
            const response = await api.put(`/majors/${id}`, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error updating major' };
        }
    },
    deleteMajor: async (id) => {
        try {
            await api.delete(`/majors/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error deleting major' };
        }
    },

    // Classes
    createClass: async (data) => {
        try {
            const response = await api.post('/classes', data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error creating class' };
        }
    },
    updateClass: async (id, data) => {
        try {
            const response = await api.put(`/classes/${id}`, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error updating class' };
        }
    },
    deleteClass: async (id) => {
        try {
            await api.delete(`/classes/${id}`);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error deleting class' };
        }
    },

    getConfig: async () => {

        try {
            const response = await api.get('/system/config');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching system configuration' };
        }
    }
};
