import api from './api';

const petitionService = {
  createPetition: async (data) => {
    const response = await api.post('/petitions', data);
    return response.data;
  },
  getMyPetitions: async () => {
    const response = await api.get('/petitions/my-petitions');
    return response.data;
  },
  getAllPetitions: async () => {
    const response = await api.get('/petitions');
    return response.data;
  },
  updateStatus: async (id, data) => {
    const response = await api.put(`/petitions/${id}/status`, data);
    return response.data;
  },
  updatePetition: async (id, data) => {
    const response = await api.put(`/petitions/${id}`, data);
    return response.data;
  },
  deletePetition: async (id) => {
    const response = await api.delete(`/petitions/${id}`);
    return response.data;
  }
};

export default petitionService;
