import axios from 'axios';

// Backend API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Skip redirect for auth endpoints (login/register/google) — let the component handle it
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/google');
      
      if (!isAuthRoute) {
        // Handle unauthorized error for protected routes (e.g., token expired)
        console.warn("Unauthorized access detected (401), clearing token.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Force redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
