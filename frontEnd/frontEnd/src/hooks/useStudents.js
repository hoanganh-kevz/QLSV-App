import { useState, useCallback, useEffect } from 'react';
import { studentService } from '../services/studentService';
import { showError } from '../components/common/ErrorMessage/ErrorMessage';

export const useStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadStudents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await studentService.getAllStudents();
            if (res.success) {
                // Map MongoDB _id back to id for UI DataTable rowKey
                const formattedData = res.data.map(item => ({ ...item, id: item._id }));
                setStudents(formattedData);
                return { success: true, data: formattedData };
            } else {
                showError(res.message);
                return { success: false, message: res.message };
            }
        } catch (error) {
            const msg = error.message || 'An unexpected error occurred';
            showError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const addStudent = useCallback(async (newStudent) => {
        setLoading(true);
        try {
            const res = await studentService.createStudent(newStudent);
            if (res.success) {
                await loadStudents();
                return { success: true };
            } else {
                showError(res.message);
                return { success: false, message: res.message };
            }
        } finally {
            setLoading(false);
        }
    }, [loadStudents]);

    const updateStudent = useCallback(async (id, updatedData) => {
        setLoading(true);
        try {
            const res = await studentService.updateStudent(id, updatedData);
            if (res.success) {
                await loadStudents();
                return { success: true };
            } else {
                showError(res.message);
                return { success: false, message: res.message };
            }
        } finally {
            setLoading(false);
        }
    }, [loadStudents]);

    const deleteStudent = useCallback(async (id) => {
        setLoading(true);
        try {
            const res = await studentService.deleteStudent(id);
            if (res.success) {
                await loadStudents();
                return { success: true };
            } else {
                showError(res.message);
                return { success: false, message: res.message };
            }
        } finally {
            setLoading(false);
        }
    }, [loadStudents]);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    return {
        students,
        loading,
        loadStudents,
        addStudent,
        updateStudent,
        deleteStudent
    };
};
