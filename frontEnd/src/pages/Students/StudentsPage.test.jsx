import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import StudentsPage from './StudentsPage';
import { useAuth } from '../../context/AuthContext';

// Mock useStudents hook (StudentsPage now uses this instead of studentService directly)
vi.mock('../../hooks/useStudents', () => ({
    useStudents: vi.fn(),
}));

import { useStudents } from '../../hooks/useStudents';

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../components/common/AdvancedFilterPanel/AdvancedFilterPanel', () => ({
    default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../components/common/SearchBar/SearchBar', () => ({
    default: ({ onSearch, placeholder }) => (
        <input
            placeholder={placeholder}
            onChange={(e) => onSearch(e.target.value)}
        />
    ),
}));

vi.mock('../../components/common/ConfirmDialog/ConfirmDialog', () => ({
    showConfirmDialog: vi.fn(),
}));

describe('StudentsPage Component', () => {
    const mockStudents = [
        { _id: '1', id: '1', mssv: '211101', fullName: 'Alice Johnson', classStr: 'IS01', status: 'Active', email: 'alice@ueh.edu.vn', phone: '0123456789' },
        { _id: '2', id: '2', mssv: '211102', fullName: 'Bob Smith', classStr: 'IS02', status: 'Inactive', email: 'bob@ueh.edu.vn', phone: '0987654321' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            user: { role: 'admin' },
            isAuthenticated: true,
        });
        // Mock the useStudents hook return value
        useStudents.mockReturnValue({
            students: mockStudents,
            loading: false,
            loadStudents: vi.fn(),
            addStudent: vi.fn().mockResolvedValue({ success: true }),
            updateStudent: vi.fn().mockResolvedValue({ success: true }),
            deleteStudent: vi.fn().mockResolvedValue({ success: true }),
        });
    });

    it('should render page title and buttons', async () => {
        render(
            <BrowserRouter>
                <StudentsPage />
            </BrowserRouter>
        );

        expect(screen.getByText(/student management/i)).toBeInTheDocument();
        expect(screen.getByText(/add new student/i)).toBeInTheDocument();
        expect(screen.getByText(/export to excel/i)).toBeInTheDocument();
    });

    it('should load and display students in the table', async () => {
        render(
            <BrowserRouter>
                <StudentsPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
            expect(screen.getByText('Bob Smith')).toBeInTheDocument();
            expect(screen.getByText('211101')).toBeInTheDocument();
            expect(screen.getByText('211102')).toBeInTheDocument();
        });
    });

    it('should display empty message when no students found', async () => {
        useStudents.mockReturnValue({
            students: [],
            loading: false,
            loadStudents: vi.fn(),
            addStudent: vi.fn(),
            updateStudent: vi.fn(),
            deleteStudent: vi.fn(),
        });

        render(
            <BrowserRouter>
                <StudentsPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/no students found matching your search criteria/i)).toBeInTheDocument();
        });
    });
});
