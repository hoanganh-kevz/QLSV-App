import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const { confirm } = Modal;

/**
 * Helper to show a confirmation dialog
 */
export const showConfirmDialog = ({ title, content, onConfirm, okText = 'Yes', cancelText = 'No', okType = 'danger' }) => {
    confirm({
        title: title,
        icon: <ExclamationCircleFilled />,
        content: content,
        okText: okText,
        okType: okType,
        cancelText: cancelText,
        onOk() {
            if (onConfirm) {
                return onConfirm(); // can return a promise to keep loading state
            }
        },
        onCancel() {
            // Do nothing
        },
    });
};
