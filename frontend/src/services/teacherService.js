import api from './api';

export const teacherService = {
    getAllTeachers: async () => {
        try {
            const response = await api.get('/teachers');
            const data = response.data;
            const teachersArray = Array.isArray(data) ? data : (data.items || data.data || []);
            
            const mappedData = teachersArray.map(t => ({
                ...t,
                _id: t.teacherID || t.id,
                teacherId: t.teacherCode || t.teacherId,
                fullName: t.fullName || t.name,
                department: t.departmentName ? { name: t.departmentName } : null
            }));
            
            return { success: true, data: mappedData };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching teachers' };
        }
    },

    createTeacher: async (data) => {
        try {
            const payload = {
                TeacherCode: data.teacherId, // Maps back to TeacherCode
                FullName: data.fullName,
                Email: data.email,
                PhoneNumber: data.phone,
                Gender: data.gender === 'male' ? 1 : data.gender === 'female' ? 2 : 0,
                DepartmentID: data.faculty,
                Status: data.status,
                Username: data.teacherId || data.email?.split('@')[0],
                Password: "Teacher@123" // Default
            };
            const response = await api.post('/teachers', payload);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to create teacher' };
        }
    },

    updateTeacher: async (id, data) => {
        try {
            const payload = {
                TeacherCode: data.teacherId,
                FullName: data.fullName,
                Email: data.email,
                PhoneNumber: data.phone,
                Gender: data.gender === 'male' ? 1 : data.gender === 'female' ? 2 : 0,
                DepartmentID: data.faculty,
                Status: data.status
            };
            const response = await api.put(`/teachers/${id}`, payload);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to update teacher' };
        }
    },

    deleteTeacher: async (id) => {
        try {
            if (!id || id === 'undefined') return { success: false, message: "Invalid ID" };
            const response = await api.delete(`/teachers/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete teacher' };
        }
    },

    bulkImport: async (teachers) => {
        try {
            const response = await api.post('/teachers/bulk-import', { teachers });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Bulk import failed' };
        }
    },

    getTeacherSchedule: async (id, termId) => {
        try {
            const response = await api.get(`/teachers/${id}/schedule`, {
                params: { termId }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to get teacher schedule' };
        }
    },

    // Weekly Override APIs
    getWeeklyOverrides: async (termId, week) => {
        try {
            const response = await api.get('/teachers/me/schedule-overrides', { params: { termId, week } });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Không thể lấy danh sách tùy chỉnh' };
        }
    },

    createWeeklyOverride: async (classSectionId, data) => {
        try {
            const response = await api.post('/teachers/me/schedule-overrides', { classSectionId, ...data });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Không thể tạo tùy chỉnh' };
        }
    },

    updateWeeklyOverride: async (classSectionId, week, data) => {
        try {
            const response = await api.put(`/teachers/me/schedule-overrides/${classSectionId}/${week}`, data);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Không thể cập nhật tùy chỉnh' };
        }
    },

    deleteWeeklyOverride: async (classSectionId, week) => {
        try {
            const response = await api.delete(`/teachers/me/schedule-overrides/${classSectionId}/${week}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Không thể xóa tùy chỉnh' };
        }
    },
};
