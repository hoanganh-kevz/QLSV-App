import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePermissions } from './usePermissions';
import { useAuth } from '../context/AuthContext';

// Mock the useAuth hook
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('usePermissions', () => {
    it('should return guest role if no user', () => {
        useAuth.mockReturnValue({ user: null, isAuthenticated: false });
        const { result } = renderHook(() => usePermissions());
        
        expect(result.current.role).toBe('guest');
        expect(result.current.isAdmin()).toBe(false);
    });

    it('should identify admin role and grant access', () => {
        useAuth.mockReturnValue({ user: { role: 'admin' }, isAuthenticated: true });
        const { result } = renderHook(() => usePermissions());
        
        expect(result.current.role).toBe('admin');
        expect(result.current.isAdmin()).toBe(true);
        // Admins have all roles implicitly according to the logic
        expect(result.current.hasRole('user')).toBe(true);
    });

    it('should check specific roles correctly', () => {
        useAuth.mockReturnValue({ user: { role: 'manager' }, isAuthenticated: true });
        const { result } = renderHook(() => usePermissions());
        
        expect(result.current.role).toBe('manager');
        expect(result.current.isAdmin()).toBe(false);
        expect(result.current.hasRole('manager')).toBe(true);
        expect(result.current.hasRole(['admin', 'manager'])).toBe(true);
        expect(result.current.hasRole('user')).toBe(false);
    });

    it('should correctly identify owner', () => {
        useAuth.mockReturnValue({ user: { _id: '123' }, isAuthenticated: true });
        const { result } = renderHook(() => usePermissions());
        
        expect(result.current.isOwner('123')).toBe(true);
        expect(result.current.isOwner('456')).toBe(false);
    });
});
