import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing Role-Based Access Control (RBAC)
 */
export const usePermissions = () => {
    const { user, isAuthenticated } = useAuth();

    // Default to 'guest' if no user
    const currentRole = user?.role || 'guest';

    /**
     * Check if user has specific role
     * @param {string|string[]} roles - Single role or array of allowed roles
     * @returns {boolean}
     */
    const hasRole = (roles) => {
        if (!isAuthenticated) return false;
        if (!roles) return true; // If no roles required, allow

        const roleArray = Array.isArray(roles) ? roles : [roles];
        
        // Admin usually has access to everything
        if (currentRole === 'admin') return true;

        return roleArray.includes(currentRole);
    };

    /**
     * Check if user has EXACT role (no admin override)
     * Use this when a feature is strictly for specific roles only (e.g., teacher/student)
     * @param {string|string[]} roles - Single role or array of allowed roles
     * @returns {boolean}
     */
    const hasExactRole = (roles) => {
        if (!isAuthenticated) return false;
        if (!roles) return true;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(currentRole);
    };

    /**
     * Check if user is an admin
     * @returns {boolean}
     */
    const isAdmin = () => currentRole === 'admin';

    /**
     * Check if user owns a specific resource
     * @param {string} resourceUserId - ID of the resource owner
     * @returns {boolean}
     */
    const isOwner = (resourceUserId) => {
        if (!isAuthenticated || !user) return false;
        return user._id === resourceUserId || user.id === resourceUserId;
    };

    /**
     * Complex permission check: Role OR Ownership
     * @param {string|string[]} roles - Allowed roles
     * @param {string} [resourceUserId] - ID of resource owner (optional)
     * @returns {boolean}
     */
    const canAccess = (roles, resourceUserId = null) => {
        if (hasRole(roles)) return true;
        if (resourceUserId && isOwner(resourceUserId)) return true;
        return false;
    };

    return {
        role: currentRole,
        hasRole,
        hasExactRole,
        isAdmin,
        isOwner,
        canAccess
    };
};
