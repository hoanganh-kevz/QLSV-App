import React from 'react';
import { usePermissions } from '../../../hooks/usePermissions';

/**
 * Wrapper component that conditionally renders its children
 * based on the user's role.
 * 
 * @param {string|string[]} role - Allowed role(s)
 * @param {string} [ownerId] - Optional ID to check ownership
 * @param {ReactNode} [fallback] - Optional UI to show if unauthorized
 */
const Can = ({ role, ownerId, fallback = null, children }) => {
    const { canAccess } = usePermissions();

    if (canAccess(role, ownerId)) {
        return <>{children}</>;
    }

    return fallback ? <>{fallback}</> : null;
};

export default Can;
