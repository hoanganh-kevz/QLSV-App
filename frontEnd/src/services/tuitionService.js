import api from './api';

const tuitionService = {
  getMyTuition: async () => {
    const response = await api.get('/tuitions/my-tuition');
    return response.data;
  },
  getAllTuitions: async () => {
    const response = await api.get('/tuitions');
    return response.data;
  },
};

export default tuitionService;
