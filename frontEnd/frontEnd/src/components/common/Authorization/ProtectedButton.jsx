import React from 'react';
import { Button, Tooltip } from 'antd';
import { usePermissions } from '../../../hooks/usePermissions';

/**
 * A Button that is either disabled or hidden if the user lacks permissions.
 * 
 * @param {string|string[]} role - Allowed role(s)
 * @param {string} [ownerId] - Optional ID to check ownership
 * @param {string} [action="disable"] - What to do if unauthorized: "disable" or "hide"
 * @param {string} [unauthorizedTooltip] - Tooltip message if disabled (default: 'You lack permissions to perform this action')
 */
const ProtectedButton = ({
    role,
    ownerId,
    action = 'disable',
    unauthorizedTooltip = 'You lack permissions to perform this action',
    children,
    ...buttonProps
}) => {
    const { canAccess } = usePermissions();
    const isAuthorized = canAccess(role, ownerId);

    if (isAuthorized) {
        return <Button {...buttonProps}>{children}</Button>;
    }

    if (action === 'hide') {
        return null;
    }

    // Default: Disable the button and add a tooltip
    return (
        <Tooltip title={unauthorizedTooltip}>
            <span>
                <Button {...buttonProps} disabled style={{ ...buttonProps.style, opacity: 0.6 }}>
                    {children}
                </Button>
            </span>
        </Tooltip>
    );
};

export default ProtectedButton;
