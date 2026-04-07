import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { setupService } from '../services/setupService';
import api from '../services/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [setupRequired, setSetupRequired] = useState(false);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const login = (userData, authToken, rememberMe = false) => {
        setUser(userData);
        setToken(authToken);
        setIsAuthenticated(true);

        // Always persist to localStorage so session survives navigation/refresh
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const updateUser = useCallback((userData) => {
        setUser(prev => {
            const newUser = { ...prev, ...userData };
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
        });
    }, []);

    // Initial check config
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            try {
                // Check setup status
                const setupRes = await setupService.getSetupStatus();
                if (setupRes.success && setupRes.setupRequired) {
                    setSetupRequired(true);
                }

                if (token) {
                    // Try to fetch fresh user data first
                    try {
                        const response = await api.get('/auth/me'); // Direct use of the base api instance
                        if (response.data) {
                            setUser(response.data);
                            localStorage.setItem('user', JSON.stringify(response.data));
                        }
                    } catch (error) {
                        console.error("Failed to fetch fresh user data, falling back to localStorage", error);
                        const storedUser = localStorage.getItem('user');
                        if (storedUser) {
                            setUser(JSON.parse(storedUser));
                        }
                    }
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Auth initialization failed", error);
            }
            setIsLoading(false);
        };

        initAuth();
    }, [token]);

    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        setupRequired,
        setSetupRequired
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
