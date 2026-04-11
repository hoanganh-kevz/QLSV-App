import api from './api';

const attendanceService = {
  batchMark: async (attendanceData) => {
    const response = await api.post('/attendances/batch', attendanceData);
    return response.data;
  },
  getMyHistory: async () => {
    const response = await api.get('/attendances/my-history');
    return response.data;
  },
  getClassRecords: async (classSectionId, date) => {
    const response = await api.get(`/attendances/class/${classSectionId}${date ? `?date=${date}` : ''}`);
    return response.data;
  },
};

export default attendanceService;
