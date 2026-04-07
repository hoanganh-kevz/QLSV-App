import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';

/**
 * Enhanced ProtectedRoute that checks both authentication and role-based permissions
 * 
 * @param {string|string[]} [roles] - Optional role or array of roles allowed to access this route
 * @param {string} [redirectTo="/"] - Path to redirect unauthorized users
 */
const ProtectedRoute = ({ roles, redirectTo = "/", children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const { hasRole } = usePermissions();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>; // Could use Ant Design Spin here
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check if roles are provided
    if (roles && !hasRole(roles)) {
        console.warn(`Access denied. User lacks required roles: ${roles}`);
        // Redirect to a fallback page (e.g., home or explicit 403 page)
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default ProtectedRoute;
