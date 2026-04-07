import React, { useState, useEffect } from 'react';
import { Layout, Button, Dropdown, Space, Avatar, Typography, Badge } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    LogoutOutlined,
    MoonOutlined,
    BellOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ collapsed, setCollapsed, mobileConfig }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenu = [
        {
            key: 'profile',
            label: 'Hồ sơ của tôi',
            icon: <UserOutlined />,
            onClick: () => navigate('/profile')
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
            danger: true
        },
    ];

    const displayRole = user?.role === 'Admin' ? 'QUẢN TRỊ VIÊN' 
                      : user?.role === 'Teacher' ? 'GIẢNG VIÊN' 
                      : user?.role === 'Student' ? 'SINH VIÊN' : '';

    return (
        <AntHeader
            style={{
                padding: '0 24px 0 16px',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 72,
                borderBottom: '1px solid #f0f0f0',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                width: '100%',
                lineHeight: 'initial'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '18px',
                        width: 40,
                        height: 40,
                        color: '#6b7280'
                    }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {!mobileConfig && (
                    <Text style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>
                        {currentTime}
                    </Text>
                )}

                <Button type="text" shape="circle" icon={<MoonOutlined style={{ fontSize: 18, color: '#6b7280' }} />} />
                
                <Badge count={3} size="small" offset={[-4, 4]}>
                    <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18, color: '#6b7280' }} />} />
                </Badge>

                <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow trigger={['click']}>
                    <Space style={{ cursor: 'pointer', paddingLeft: '8px' }}>
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0A6C5B', flexShrink: 0 }} />
                        {!mobileConfig && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Text strong style={{ fontSize: 13, lineHeight: 1.2, color: '#111827' }}>
                                    {user?.username || 'admin'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 10, lineHeight: 1.2, fontWeight: 700, letterSpacing: 0.5 }}>
                                    {displayRole}
                                </Text>
                            </div>
                        )}
                    </Space>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default Header;
