import api from './api';

const examScheduleService = {
  getMySchedule: async () => {
    const response = await api.get('/exam-schedules/my-schedule');
    return response.data;
  },
  getAllSchedules: async () => {
    const response = await api.get('/exam-schedules');
    return response.data;
  },
};

export default examScheduleService;
