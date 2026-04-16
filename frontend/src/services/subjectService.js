import api from './api';

export const subjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await api.get('/subjects');
      
      // Chuyển đổi dữ liệu Backend trả về thành chuẩn Frontend cần
      const mappedData = response.data.map(s => ({
          ...s,
          _id: s.subjectID || s.id,
          code: s.subjectCode || s.code,
          name: s.subjectName || s.name,
          faculty: s.departmentName ? { name: s.departmentName } : null,
      }));
      
      return { success: true, data: mappedData };
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return { success: false, message: error.response?.data?.message || 'Error fetching subjects' };
    }
  },

  // Create a new subject
  createSubject: async (subjectData) => {
    try {
      const payload = {
          SubjectCode: subjectData.code,
          SubjectName: subjectData.name,
          Credits: subjectData.credits,
          DepartmentID: subjectData.faculty,
          SubjectType: subjectData.type || "Core"
      };
      const response = await api.post('/subjects', payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating subject:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create subject' };
    }
  },

  // Update a subject
  updateSubject: async (id, subjectData) => {
    try {
      const payload = {
          SubjectCode: subjectData.code, // C# expects SubjectCode, but UpdateSubjectDto maybe only wants Name and Credits
          SubjectName: subjectData.name,
          Credits: subjectData.credits,
          DepartmentID: subjectData.faculty,
          SubjectType: subjectData.type || "Core"
      };
      const response = await api.put(`/subjects/${id}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating subject:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update subject' };
    }
  },

  // Delete a subject
  deleteSubject: async (id) => {
    try {
      if (!id || id === 'undefined') return { success: false, message: "Invalid ID" };
      const response = await api.delete(`/subjects/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting subject:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete subject' };
    }
  }
};
