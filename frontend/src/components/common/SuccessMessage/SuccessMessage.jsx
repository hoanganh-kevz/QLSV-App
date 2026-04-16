import { message } from 'antd';

/**
 * Helper to show a success notification
 */
export const showSuccess = (content = "Operation successful!") => {
    message.success({
        content,
        duration: 3,
    });
};
