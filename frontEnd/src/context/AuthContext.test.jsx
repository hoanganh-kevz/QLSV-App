import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';

// Wrap hook in Provider
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext and useAuth', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should initialize with default unauthenticated state', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
    });

    it('should login user and set localStorage correctly', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        const mockUser = { id: 1, name: 'Test User' };
        const mockToken = 'mock-jwt-token';

        act(() => {
            result.current.login(mockUser, mockToken);
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.token).toBe(mockToken);

        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
    });

    it('should clear state and localStorage on logout', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // First login
        act(() => {
            result.current.login({ id: 1 }, 'mock-token');
        });

        // Then logout
        act(() => {
            result.current.logout();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('should update user data correctly', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        act(() => {
            result.current.login({ id: 1, name: 'Initial', role: 'admin' }, 'mock-token');
        });

        act(() => {
            result.current.updateUser({ name: 'Updated' });
        });

        expect(result.current.user).toEqual({ id: 1, name: 'Updated', role: 'admin' });
        expect(JSON.parse(localStorage.getItem('user'))).toEqual({ id: 1, name: 'Updated', role: 'admin' });
    });
});
