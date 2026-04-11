import api from './api';

const teacherEvaluationService = {
  submitEvaluation: async (data) => {
    const response = await api.post('/teacher-evaluations', data);
    return response.data;
  },
  getMyEvaluations: async () => {
    const response = await api.get('/teacher-evaluations/my-evaluations');
    return response.data;
  },
  getEligibleClasses: async () => {
    const response = await api.get('/teacher-evaluations/eligible-classes');
    return response.data;
  },
};

export default teacherEvaluationService;
