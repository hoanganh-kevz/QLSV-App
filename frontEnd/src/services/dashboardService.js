import api from './api';

export const dashboardService = {
  // Fetch real dashboard statistics from backend
  getDashboardStats: async (termId) => {
    try {
      const url = termId ? `/dashboard/stats?termId=${termId}` : '/dashboard/stats';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};
