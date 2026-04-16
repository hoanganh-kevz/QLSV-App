import React, { useState, useEffect } from 'react';
import { Layout, Button, Dropdown, Space, Avatar, Badge, List, Typography, Divider, Empty } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    SunOutlined,
    MoonOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ collapsed, setCollapsed, mobileConfig }) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { settings } = useSettings();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const timeString = new Intl.DateTimeFormat(settings?.language === 'vi' ? 'vi-VN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: settings?.timezone === 'gmt7' ? 'Asia/Ho_Chi_Minh' : 'Europe/London'
    }).format(time);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenu = [
        {
            key: 'profile',
            label: t('nav.profile'),
            icon: <UserOutlined />,
            onClick: () => navigate('/profile')
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: t('nav.logout'),
            icon: <LogoutOutlined />,
            onClick: handleLogout,
            danger: true
        },
    ];

    const notificationMenu = (
        <div className="notification-dropdown">
            <div className="notification-header">
                <Text strong>{t('settings.notifications.title')}</Text>
                <Button 
                    type="link" 
                    size="small" 
                    icon={<CheckCircleOutlined />} 
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                >
                    {t('settings.notifications.markAllRead')}
                </Button>
            </div>
            <Divider style={{ margin: 0 }} />
            <List
                className="notification-list"
                itemLayout="horizontal"
                dataSource={notifications}
                style={{ maxHeight: '400px', overflowY: 'auto' }}
                locale={{ 
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('settings.notifications.none') || 'No notifications'} /> 
                }}
                renderItem={(item) => (
                    <List.Item 
                        className={`notification-item ${item.read ? 'read' : 'unread'}`}
                        onClick={() => markAsRead(item.id)}
                    >
                        <List.Item.Meta
                            avatar={<Badge dot={!item.read}><BellOutlined style={{ color: 'var(--primary-color)' }} /></Badge>}
                            title={<span style={{ fontWeight: item.read ? 400 : 600 }}>{item.title}</span>}
                            description={
                                <div>
                                    <div className="notification-desc">{item.description}</div>
                                    <div className="notification-time">{new Intl.RelativeTimeFormat(settings?.language === 'vi' ? 'vi' : 'en').format(-Math.round((Date.now() - new Date(item.time)) / 60000), 'minutes')}</div>
                                </div>
                            }
                        />
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<CloseOutlined style={{ fontSize: '12px', color: 'var(--text-secondary)' }} />} 
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(item.id);
                            }}
                            className="notification-delete-btn"
                        />
                    </List.Item>
                )}
            />
            {notifications.length > 0 && (
                <>
                    <Divider style={{ margin: 0 }} />
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={clearAll}>
                            {t('common.clearAll')}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <AntHeader className="premium-header">
            <div className="header-left">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    className="header-toggle-btn"
                />
            </div>

            <div className="header-right">
                <span style={{
                    fontWeight: 500,
                    color: 'var(--text-color)',
                    opacity: 0.8,
                    marginRight: '12px',
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    {timeString}
                </span>

                <Button
                    type="text"
                    icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                    onClick={toggleTheme}
                    className="header-icon-btn"
                />

                <Dropdown popupRender={() => notificationMenu} trigger={['click']} placement="bottomRight" arrow>
                    <Badge count={unreadCount} size="small" offset={[-4, 4]}>
                        <Button type="text" icon={<BellOutlined />} className="header-icon-btn" />
                    </Badge>
                </Dropdown>

                <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow trigger={['click']}>
                    <Space className="header-user-area">
                        <Avatar
                            src={user?.avatar || null}
                            icon={<UserOutlined />}
                            style={{
                                background: 'var(--brand-gradient)',
                                boxShadow: '0 2px 8px rgba(0, 90, 81, 0.4)'
                            }}
                        />
                        {!mobileConfig && (
                            <div className="header-user-info">
                                <span className="header-user-name">{user?.name || user?.username || t('common.user')}</span>
                                <span className="header-user-role" style={{ fontSize: '10px', marginTop: '-2px', opacity: 0.7 }}>
                                    {user?.role ? t(`users.role.${user.role}`).toUpperCase() : t('users.role.student').toUpperCase()}
                                </span>
                            </div>
                        )}
                    </Space>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default Header;
