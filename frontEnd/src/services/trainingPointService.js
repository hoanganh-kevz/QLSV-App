import api from './api';

const trainingPointService = {
  getMyPoints: async () => {
    const response = await api.get('/training-points/my-points');
    return response.data;
  },
  getAllPoints: async () => {
    const response = await api.get('/training-points');
    return response.data;
  },
};

export default trainingPointService;
