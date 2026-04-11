import { notification } from 'antd';
import {
    CheckCircleOutlined,
    InfoCircleOutlined,
    WarningOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';

class NotificationManager {
    constructor() {
        // Configure default notification settings
        notification.config({
            placement: 'topRight',
            duration: 4.5,
            maxCount: 3,
        });
    }

    success(message, description, options = {}) {
        notification.success({
            message,
            description,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            ...options,
        });
    }

    info(message, description, options = {}) {
        notification.info({
            message,
            description,
            icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
            ...options,
        });
    }

    warning(message, description, options = {}) {
        notification.warning({
            message,
            description,
            icon: <WarningOutlined style={{ color: '#faad14' }} />,
            ...options,
        });
    }

    error(message, description, options = {}) {
        notification.error({
            message,
            description,
            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
            ...options,
        });
    }

    // Custom notification with progress
    withProgress(config) {
        const key = `notification_${Date.now()}`;
        let progress = 0;
        const duration = config.duration || 4500;
        const interval = 50;
        const step = (interval / duration) * 100;

        notification.open({
            ...config,
            key,
            duration: 0, // Don't auto close
            description: (
                <div>
                    {config.description}
                    <div style={{ marginTop: 8 }}>
                        <div
                            style={{
                                height: 4,
                                background: '#f0f0f0',
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                id={`progress-${key}`}
                                style={{
                                    height: '100%',
                                    background: '#1890ff',
                                    width: '0%',
                                    transition: 'width 50ms linear',
                                }}
                            />
                        </div>
                    </div>
                </div>
            ),
        });

        const timer = setInterval(() => {
            progress += step;
            const progressBar = document.getElementById(`progress-${key}`);
            if (progressBar) {
                progressBar.style.width = `${Math.min(progress, 100)}%`;
            }

            if (progress >= 100) {
                clearInterval(timer);
                notification.close(key);
            }
        }, interval);
    }

    // Action notification
    withAction(message, description, actionText, onAction) {
        notification.open({
            message,
            description,
            btn: (
                <Button type="primary" size="small" onClick={() => {
                    onAction();
                    notification.destroy();
                }}>
                    {actionText}
                </Button>
            ),
            duration: 0, // Don't auto close
        });
    }
}

export default new NotificationManager();