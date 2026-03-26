import React, { useMemo } from 'react';
import { Layout, Menu, Typography, Avatar } from 'antd';
import { 
  HomeOutlined,
  DashboardOutlined, 
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  BookOutlined,
  SolutionOutlined,
  ReadOutlined,
  TableOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = ({ collapsed, mobileConfig }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Retrieve current user object (has .role attached)

  const menuItems = useMemo(() => {
    const role = user?.role?.toLowerCase() || '';
    
    // Core menus available to everyone in some capacity
    let items = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: 'Trang Chủ',
      },
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Bảng Điều Khiển',
      }
    ];

    if (role === 'admin') {
      items.push(
        {
           key: '/students',
           icon: <UserOutlined />,
           label: 'Sinh Viên',
        },
        {
           key: '/teachers',
           icon: <SolutionOutlined />,
           label: 'Giảng Viên',
        },
        {
          key: '/subjects',
          icon: <BookOutlined />,
          label: 'Môn Học',
        },
        {
          key: '/grades',
          icon: <TableOutlined />,
          label: 'Điểm Số',
          children: [
              { key: '/grade-overview', label: 'Tổng Quan' }
          ]
        },
        {
          key: '/profile',
          icon: <UserOutlined />,
          label: 'Hồ sơ của tôi',
        },
        {
          key: '/users',
          icon: <TeamOutlined />,
          label: 'Quản lý người dùng',
        },
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: 'Cài đặt',
        }
      );
    } 

    return items;
  }, [user]);

  return (
    <Sider
      theme="light"
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      width={260}
      collapsedWidth={mobileConfig ? 0 : 80}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        transition: 'all 0.2s',
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Sidebar Header / Logo */}
      <div style={{
          height: '80px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
        <Avatar shape="square" size={40} style={{ backgroundColor: '#0A6C5B', flexShrink: 0 }}>
            <AppstoreOutlined style={{ color: 'white' }} />
        </Avatar>
        {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text strong style={{ fontSize: 16, lineHeight: 1.2 }}>Hệ thống UEH</Text>
                <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.2 }}>Cổng quản lý</Text>
            </div>
        )}
      </div>

      {!collapsed && (
          <div style={{ padding: '0 24px 8px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>
              Điều hướng
          </div>
      )}

      {/* Navigation Menu */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 'none', padding: '0 12px' }}
        />
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
          <div style={{ padding: '24px 16px', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  padding: '12px',
                  borderRadius: 12,
                  border: '1px solid #f0f0f0'
              }}>
                <Avatar shape="square" size={32} src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ fontSize: 13, lineHeight: 1.2 }}>UEH CNPM</Text>
                    <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.2 }}>v2.0 — 2024</Text>
                </div>
              </div>
          </div>
      )}

      {/* Custom Global Styles for Menu specific to mockup */}
      <style>{`
        .ant-menu-light .ant-menu-item-selected {
            background-color: #0A6C5B !important;
            color: #ffffff !important;
            border-radius: 8px !important;
            font-weight: 500;
        }
        .ant-menu-light .ant-menu-item-selected .ant-menu-item-icon {
            color: #ffffff !important;
        }
        .ant-menu-inline .ant-menu-item {
            margin-bottom: 4px !important;
            border-radius: 8px !important;
        }
        .ant-menu-light .ant-menu-item:hover:not(.ant-menu-item-selected) {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
        }
      `}</style>
    </Sider>
  );
};

export default Sidebar;
