import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddStudentModal from './AddStudentModal';

describe('AddStudentModal Component', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock matchMedia for Ant Design Modals
        if (!window.matchMedia) {
            window.matchMedia = vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));
        }
    });

    it('should show validation errors for empty required fields', async () => {
        render(
            <AddStudentModal
                open={true}
                onCancel={mockOnCancel}
                onSubmit={mockOnSubmit}
            />
        );

        // Submit empty form (Find the submit button in the modal footer)
        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        expect(await screen.findByText(/student id is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/phone is required/i)).toBeInTheDocument();
    });

    it('should call onSubmit with form data when valid', async () => {
        render(
            <AddStudentModal
                open={true}
                onCancel={mockOnCancel}
                onSubmit={mockOnSubmit}
            />
        );

        // Fill in the form
        fireEvent.change(screen.getByPlaceholderText(/e.g. 31211020001/i), { target: { value: '211103' } });
        fireEvent.change(screen.getByPlaceholderText(/enter full name/i), { target: { value: 'Charlie Brown' } });
        fireEvent.change(screen.getByPlaceholderText(/email address/i), { target: { value: 'charlie@ueh.edu.vn' } });
        fireEvent.change(screen.getByPlaceholderText(/10-digit phone/i), { target: { value: '0123456788' } });

        fireEvent.change(screen.getByPlaceholderText(/enter address/i), { target: { value: '123 Main St' } });

        // Modal confirm button
        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        // Wait for validation and submission
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
            const submittedData = mockOnSubmit.mock.calls[0][0];
            expect(submittedData.mssv).toBe('211103');
            expect(submittedData.fullName).toBe('Charlie Brown');
        });
    });
});
