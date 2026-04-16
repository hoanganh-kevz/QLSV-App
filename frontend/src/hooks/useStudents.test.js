import { renderHook, act } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach } from 'vitest';
import { useStudents } from './useStudents';
import { studentService } from '../services/studentService';
import { showError } from '../components/common/ErrorMessage/ErrorMessage';

// Mock the studentService
vi.mock('../services/studentService', () => ({
  studentService: {
    getAllStudents: vi.fn(),
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn(),
  },
}));

// Mock ErrorMessage
vi.mock('../components/common/ErrorMessage/ErrorMessage', () => ({
  showError: vi.fn(),
}));

describe('useStudents hook', () => {
  const mockStudents = [
    { _id: '1', fullName: 'Student One', mssv: '21520001', classStr: 'IS01' },
    { _id: '2', fullName: 'Student Two', mssv: '21520002', classStr: 'IS02' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch students on mount', async () => {
    studentService.getAllStudents.mockResolvedValue({ success: true, data: mockStudents });

    const { result } = renderHook(() => useStudents());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for the effect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.students).toHaveLength(2);
    expect(result.current.students[0].id).toBe('1');
    expect(studentService.getAllStudents).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Failed to fetch';
    studentService.getAllStudents.mockResolvedValue({ success: false, message: errorMessage });

    const { result } = renderHook(() => useStudents());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.students).toHaveLength(0);
    expect(showError).toHaveBeenCalledWith(errorMessage);
  });

  it('should add a student and refresh the list', async () => {
    studentService.getAllStudents.mockResolvedValueOnce({ success: true, data: [] })
                                  .mockResolvedValueOnce({ success: true, data: [{ _id: '3', fullName: 'New Student' }] });
    studentService.createStudent.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useStudents());

    await act(async () => {
      await result.current.addStudent({ fullName: 'New Student' });
    });

    expect(studentService.createStudent).toHaveBeenCalledWith({ fullName: 'New Student' });
    expect(studentService.getAllStudents).toHaveBeenCalledTimes(2);
    expect(result.current.students).toHaveLength(1);
  });

  it('should delete a student and refresh the list', async () => {
    studentService.getAllStudents.mockResolvedValueOnce({ success: true, data: mockStudents })
                                  .mockResolvedValueOnce({ success: true, data: [mockStudents[1]] });
    studentService.deleteStudent.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useStudents());

    await act(async () => {
      await result.current.deleteStudent('1');
    });

    expect(studentService.deleteStudent).toHaveBeenCalledWith('1');
    expect(studentService.getAllStudents).toHaveBeenCalledTimes(2);
    expect(result.current.students).toHaveLength(1);
  });
});
