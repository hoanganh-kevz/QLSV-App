import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { message as antMessage } from 'antd';
import { 
    BellOutlined, 
    CheckCircleOutlined, 
    InfoCircleOutlined, 
    WarningOutlined, 
    CloseCircleOutlined 
} from '@ant-design/icons';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    // Initial mock notifications
    const [notifications, setNotifications] = useState(() => {
        const stored = localStorage.getItem('notifications');
        if (stored) return JSON.parse(stored);
        
        return [
            {
                id: 1,
                title: 'Công bố bảng điểm môn học',
                description: 'Bảng điểm môn Cơ sở dữ liệu của lớp CNPM01 vừa được giảng viên cập nhật chính thức.',
                time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
                read: false,
                type: 'success'
            },
            {
                id: 2,
                title: 'Hồ sơ cá nhân được cập nhật',
                description: 'Thông tin số điện thoại của bạn đã được thay đổi thành công trên hệ thống.',
                time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                read: false,
                type: 'info'
            },
            {
                id: 3,
                title: 'Thông báo sao lưu hệ thống',
                description: 'Hệ thống đã thực hiện sao lưu định kỳ cơ sở dữ liệu UEH thành công.',
                time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
                read: true,
                type: 'success'
            },
            {
                id: 4,
                title: 'Chào mừng học kỳ mới',
                description: 'Cổng thông tin đào tạo UEH hân hạnh chào đón bạn quay lại học kỳ 2 năm 2024.',
                time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                read: true,
                type: 'info'
            }
        ];
    });

    // Save to localStorage when changed
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            time: new Date().toISOString(),
            read: false,
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev]);
        
        // Also show a toast
        antMessage.info({
            content: newNotification.title,
            icon: <BellOutlined style={{ color: 'var(--primary-color)' }} />
        });
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const deleteNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
