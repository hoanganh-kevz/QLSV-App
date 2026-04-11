import api from './api';

const courseRegistrationService = {
  getAvailableClasses: async () => {
    const response = await api.get('/course-registrations/available');
    return response.data;
  },
  registerClass: async (classSectionId) => {
    const response = await api.post('/course-registrations', { classSectionId });
    return response.data;
  },
  cancelRegistration: async (id) => {
    const response = await api.delete(`/course-registrations/${id}`);
    return response.data;
  },
  getMyRegistrations: async () => {
    const response = await api.get('/course-registrations/my-registrations');
    return response.data;
  }
};

export default courseRegistrationService;
