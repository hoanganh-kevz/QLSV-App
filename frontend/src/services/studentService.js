import api from './api';

export const studentService = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await api.get('/students');
      const data = response.data;
      
      // Handle PagedStudentResult or Array
      const items = data.items || data.data?.items || data.data || data;
      const studentsArray = Array.isArray(items) ? items : [];

      const mappedData = studentsArray.map(s => ({
          ...s,
          _id: s.studentID || s.id,
          mssv: s.studentCode || s.mssv,
          fullName: s.fullName || s.name,
          class: s.class || s.classID || (s.className ? { name: s.className } : null)
      }));

      return { success: true, data: mappedData };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { success: false, message: error.response?.data?.message || 'Error fetching students' };
    }
  },

  // Create a new student
  createStudent: async (studentData) => {
    try {
      const payload = {
          FullName: studentData.fullName,
          Email: studentData.email,
          PhoneNumber: studentData.phone,
          Address: studentData.address,
          DateOfBirth: studentData.dob || new Date().toISOString(),
          Gender: studentData.gender === 'male' ? 1 : studentData.gender === 'female' ? 2 : 0, 
          Nationality: studentData.nationality || "Vietnam",
          IdCard: studentData.mssv, // Frontend sends mssv
          ClassID: studentData.class,
          EnrollmentYear: new Date().getFullYear(),
          AcademicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
          Username: studentData.mssv || studentData.email?.split('@')[0],
          Password: studentData.mssv || "123456" // Default password
      };
      
      const response = await api.post('/students', payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating student:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create student' };
    }
  },

  // Update a student
  updateStudent: async (id, studentData) => {
    try {
      const payload = {
          FullName: studentData.fullName,
          Email: studentData.email,
          PhoneNumber: studentData.phone,
          Address: studentData.address,
          DateOfBirth: studentData.dob || new Date().toISOString(),
          Gender: studentData.gender === 'male' ? 1 : studentData.gender === 'female' ? 2 : 0,
          ClassID: studentData.class,
          // Frontend might not send all required info on update, filling defaults safely
          EnrollmentYear: new Date().getFullYear(),
          AcademicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`
      };
      const response = await api.put(`/students/${id}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating student:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update student' };
    }
  },

  // Delete a student
  deleteStudent: async (id) => {
    try {
      if (!id || id === 'undefined') return { success: false, message: "Invalid ID" };
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
