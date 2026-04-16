import api from './api';

export const gradeService = {
    // Get all grades
    getAllGrades: async () => {
        try {
            const response = await api.get('/grades');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching grades' };
        }
    },

    // Create single grade
    createGrade: async (gradeData) => {
        try {
            const response = await api.post('/grades', gradeData);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to create grade' };
        }
    },

    // Batch save grades
    batchSaveGrades: async (grades) => {
        try {
            // Re-map to ensure backend compatibility
            const payload = grades.map(g => ({
                StudentID: g.studentId,
                SubjectCode: g.subjectCode,
                Semester: g.semester,
                GradeID: g.gradeId || null,
                AttendanceScore: g.attendance,
                MidtermScore: g.midterm,
                FinalScore: g.final
            }));
            const response = await api.post('/grades/batch', { grades: payload });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to batch save grades' };
        }
    },

    // Update a grade
    updateGrade: async (id, gradeData) => {
        try {
            const response = await api.put(`/grades/${id}`, gradeData);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to update grade' };
        }
    },

    // Get grades by student (transcript)
    getGradesByStudent: async (studentId) => {
        try {
            const response = await api.get(`/grades/student/${studentId}`);
            const data = Array.isArray(response.data) ? response.data : (response.data?.grades || []);
            
            const mappedData = data.map(g => ({
                ...g,
                _id: g.gradeID,
                midterm: g.midtermScore,
                final: g.finalScore,
                attendance: g.attendanceScore,
                gpa4: g.gradePoint,
                totalScore: g.totalScore,
                letterGrade: g.letterGrade,
                subjectCode: g.subjectCode,
                subjectName: g.subjectName,
                semester: g.semester
            }));
            
            return { success: true, data: mappedData };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching transcript' };
        }
    },

    // Get grades by class (grade sheet)
    getGradesByClass: async (params) => {
        try {
            const response = await api.get('/grades/class', { params });
            const data = Array.isArray(response.data) ? response.data : [];
            
            const mappedData = data.map(g => ({
                ...g,
                _id: g.gradeID,
                studentId: g.studentID,
                studentMssv: g.studentCode,
                studentName: g.studentName,
                midterm: g.midtermScore,
                final: g.finalScore,
                attendance: g.attendanceScore,
                totalScore: g.totalScore,
                letterGrade: g.letterGrade,
                gpa4: g.gradePoint 
            }));
            
            return { success: true, data: mappedData };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Error fetching grade sheet' };
        }
    },

    // Delete a grade
    deleteGrade: async (id) => {
        try {
            if (!id || id === 'undefined') return { success: false, message: 'Invalid Grade ID' };
            const response = await api.delete(`/grades/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete grade' };
        }
    },
};
