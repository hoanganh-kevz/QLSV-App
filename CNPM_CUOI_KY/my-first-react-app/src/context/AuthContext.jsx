import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initial check config
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            if (token) {
                try {
                    // Normally we would verify the token with backend here
                    // e.g., const res = await api.get('/user/me');
                    // setUser(res.data);

                    // Mock successful verification
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Token verification failed", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [token]);

    const login = (userData, authToken, rememberMe = false) => {
        setUser(userData);
        setToken(authToken);
        setIsAuthenticated(true);

        // Store in localStorage
        if (rememberMe) {
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
        }
        // Alternatively, using sessionStorage for not-remember-me is possible, 
        // but we'll stick to a simple localStorage implementation for now
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
