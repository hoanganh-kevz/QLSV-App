import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import api from './api';

describe('axios api instance', () => {
    let originalLocation;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        
        // Mock window.location
        originalLocation = window.location;
        delete window.location;
        window.location = { href: '' };
    });

    afterEach(() => {
        window.location = originalLocation;
    });

    it('should add Authorization header if token exists', async () => {
        localStorage.setItem('token', 'fake-jwt-token');
        
        // Mock the adapter to avoid real network call and intercept request config
        let interceptedConfig;
        api.defaults.adapter = (config) => {
            interceptedConfig = config;
            return Promise.resolve({ data: {}, status: 200, config });
        };

        await api.get('/test');
        expect(interceptedConfig.headers['Authorization']).toBe('Bearer fake-jwt-token');
    });

    it('should not add Authorization header if token does not exist', async () => {
        let interceptedConfig;
        api.defaults.adapter = (config) => {
            interceptedConfig = config;
            return Promise.resolve({ data: {}, status: 200, config });
        };

        await api.get('/test');
        expect(interceptedConfig.headers['Authorization']).toBeUndefined();
    });

    it('should handle 401 response on protected routes by clearing token and redirecting', async () => {
        localStorage.setItem('token', 'expired-token');
        localStorage.setItem('user', JSON.stringify({ name: 'test' }));

        api.defaults.adapter = () => {
            return Promise.reject({
                response: { status: 401 },
                config: { url: '/protected-route' }
            });
        };

        try {
            await api.get('/protected-route');
        } catch (e) {
            expect(e.response.status).toBe(401);
        }

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(window.location.href).toBe('/login');
    });

    it('should not redirect on 401 response for auth routes', async () => {
        localStorage.setItem('token', 'some-token');

        api.defaults.adapter = () => {
            return Promise.reject({
                response: { status: 401 },
                config: { url: '/auth/login' }
            });
        };

        try {
            await api.post('/auth/login');
        } catch (e) {
            expect(e.response.status).toBe(401);
        }

        expect(localStorage.getItem('token')).toBe('some-token'); // Should not clear
        expect(window.location.href).toBe(''); // Should not redirect
    });
});
