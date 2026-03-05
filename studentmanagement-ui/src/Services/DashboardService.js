import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get grade distribution
  getGradeDistribution: async (classId) => {
    const response = await api.get('/dashboard/grade-distribution', {
      params: { classId },
    });
    return response.data;
  },

  // Get top students
  getTopStudents: async (limit = 10) => {
    const response = await api.get('/dashboard/top-students', {
      params: { limit },
    });
    return response.data;
  },

  // Get class performance
  getClassPerformance: async () => {
    const response = await api.get('/dashboard/class-performance');
    return response.data;
  },
};