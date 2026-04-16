import { message } from 'antd';

/**
 * Helper to show an error notification
 */
export const showError = (content = "An error occurred. Please try again.") => {
    message.error({
        content,
        duration: 3,
    });
};

export const showSuccess = (content = "Action completed successfully.") => {
    message.success({
        content,
        duration: 3,
    });
};

export const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
        <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '4px' }}>
            {error}
        </div>
    );
};
