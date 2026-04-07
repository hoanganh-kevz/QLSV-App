import api from './api';

export const studentService = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await api.get('/students');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { success: false, message: error.response?.data?.message || 'Error fetching students' };
    }
  },

  // Create a new student
  createStudent: async (studentData) => {
    try {
      const response = await api.post('/students', studentData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating student:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create student' };
    }
  },

  // Update a student
  updateStudent: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating student:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update student' };
    }
  },

  // Delete a student
  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting student:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete student' };
    }
  },

  // Bulk import
  bulkImportStudents: async (students) => {
    try {
      const response = await api.post('/students/bulk-import', { students });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error bulk importing students:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to import students' };
    }
  },

  // Get student schedule
  getStudentSchedule: async (studentId, termId) => {
    try {
      const response = await api.get(`/students/${studentId}/schedule?termId=${termId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching student schedule:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch schedule' };
    }
  }
};
