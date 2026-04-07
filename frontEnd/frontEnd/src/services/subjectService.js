import api from './api';

// Temporary mock data to simulate backend response
const MOCK_SUBJECTS = [
    { id: 'SUB001', code: 'IT101', name: 'Introduction to Programming', credits: 3, classStr: 'IS01', status: 'Active' },
    { id: 'SUB002', code: 'MATH101', name: 'Calculus I', credits: 4, classStr: 'IS01', status: 'Active' },
    { id: 'SUB003', code: 'ENG101', name: 'English Composition', credits: 3, classStr: 'IS02', status: 'Active' },
    { id: 'SUB004', code: 'PHYS101', name: 'General Physics', credits: 4, classStr: 'IS03', status: 'Inactive' },
];

export const subjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await api.get('/subjects');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return { success: false, message: error.response?.data?.message || 'Error fetching subjects' };
    }
  },

  // Create a new subject
  createSubject: async (subjectData) => {
    try {
      const response = await api.post('/subjects', subjectData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating subject:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create subject' };
    }
  },

  // Update a subject
  updateSubject: async (id, subjectData) => {
    try {
      const response = await api.put(`/subjects/${id}`, subjectData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating subject:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update subject' };
    }
  },

  // Delete a subject
  deleteSubject: async (id) => {
    try {
      const response = await api.delete(`/subjects/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting subject:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete subject' };
    }
  }
};
