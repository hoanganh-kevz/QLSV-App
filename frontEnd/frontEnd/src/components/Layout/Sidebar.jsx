import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  BookOutlined,
  FormOutlined,
  FileTextOutlined,
  TableOutlined,
  SolutionOutlined,
  PartitionOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from '../../hooks/useTranslation';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({ collapsed, mobileConfig }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole, hasExactRole } = usePermissions();
  const { t } = useTranslation();
  const [openKeys, setOpenKeys] = React.useState(
    location.pathname.startsWith('/grades') ? ['grades-group'] : []
  );

  React.useEffect(() => {
    if (location.pathname.startsWith('/grades')) {
      setOpenKeys(['grades-group']);
    }
  }, [location.pathname]);

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: t('nav.home'),
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('nav.dashboard'),
    },
    {
      key: '/students',
      icon: <TeamOutlined />,
      label: t('nav.students'),
    },
    {
      key: '/teachers',
      icon: <SolutionOutlined />,
      label: t('nav.teachers'),
    },
    {
      key: '/subjects',
      icon: <BookOutlined />,
      label: t('nav.subjects'),
    },
    {
      key: '/class-sections',
      icon: <PartitionOutlined />,
      label: 'Lớp học phần',
    },
    {
      key: 'grades-group',
      icon: <FormOutlined />,
      label: t('nav.grades'),
      children: [
        {
          key: '/grades',
          icon: <FormOutlined />,
          label: t('nav.grades.entry'),
        },
        {
          key: '/grades/transcript',
          icon: <FileTextOutlined />,
          label: t('nav.grades.transcript'),
        },
        {
          key: '/grades/sheet',
          icon: <TableOutlined />,
          label: t('nav.grades.sheet'),
        },
      ],
    },
    {
      key: '/schedule',
      icon: <TableOutlined />,
      label: 'Thời khóa biểu',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: t('nav.profile'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
    }
  ];

  // Filter items based on role
  let filteredItems = menuItems.filter(item => {
    // Basic role filtering for top-level items
    if (item.key === '/teachers' && !hasRole('admin')) return false;
    if (item.key === '/subjects' && !hasRole(['admin', 'teacher'])) return false;
    if (item.key === '/class-sections' && !hasRole(['admin', 'teacher'])) return false;
    if (item.key === '/students' && !hasRole(['admin', 'teacher'])) return false;
    if (item.key === '/schedule' && !hasExactRole(['teacher', 'student'])) return false;
    
    // Deeper filtering for nested groups (e.g., grades-group)
    if (item.key === 'grades-group') {
      // Find the group in menuItems and filter its children
      const originalGroup = menuItems.find(m => m.key === 'grades-group');
      if (originalGroup && originalGroup.children) {
        const filteredChildren = originalGroup.children.filter(child => {
          if (child.key === '/grades' && !hasRole(['admin', 'teacher'])) return false;
          if (child.key === '/grades/sheet' && !hasRole(['admin', 'teacher'])) return false;
          return true;
        });
        
        // If no children left, hide the parent too
        if (filteredChildren.length === 0) return false;
        
        // Update item with filtered children (cloning to avoid side effects if reused)
        item.children = filteredChildren;
      }
    }
    
    return true;
  });

  // Conditionally add Admin only routes
  if (hasRole('admin')) {
    const settingsIndex = filteredItems.findIndex(item => item.key === '/settings');
    filteredItems.splice(settingsIndex, 0, {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: t('nav.usermanagement'),
    }, {
      key: '/admin/classes',
      icon: <PartitionOutlined />,
      label: t('nav.classesmanagement') || 'System Hierarchy',
    }, {
      key: '/admin/terms',
      icon: <BookOutlined />,
      label: 'Quản lý Học kỳ',
    });
  }

  // Determine which keys are selected/opened based on current path
  const selectedKeys = [location.pathname];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      collapsedWidth={mobileConfig ? 0 : 80}
      className="premium-sidebar"
      width={240}
    >
      {/* Logo Area */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          {collapsed ? '📚' : '📚'}
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">{t('shell.system')}</span>
            <span className="sidebar-logo-sub">{t('shell.portal')}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Navigation Label */}
      {!collapsed && <div className="sidebar-section-label">{t('nav.navigation')}</div>}

      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        items={filteredItems}
        onClick={(info) => {
          if (info.key !== 'grades-group') {
            navigate(info.key);
          }
        }}
        className="sidebar-menu"
      />

      {/* Bottom Section */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <span style={{ fontSize: '20px' }}>🎓</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-color)' }}>UEH CNPM</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>v2.0 — 2024</div>
            </div>
          </div>
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;
