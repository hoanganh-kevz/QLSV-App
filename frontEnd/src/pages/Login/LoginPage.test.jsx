import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuth } from '../../context/AuthContext';

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// Mock services
vi.mock('../../services/authService', () => ({
    loginUser: vi.fn(),
    registerUser: vi.fn(),
    googleLogin: vi.fn(),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: {} }),
    };
});

// Mock the Google Login container
vi.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
    useGoogleLogin: vi.fn(() => vi.fn()),
}));

describe('LoginPage Component', () => {
    const mockLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
        });
    });

    it('should render login form elements', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /arrow-rightsign in/i })).toBeInTheDocument();
    });

    it('should display validation errors when submitting empty form', async () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        const submitButton = screen.getByRole('button', { name: /arrow-rightsign in/i });
        fireEvent.click(submitButton);

        expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });
});
