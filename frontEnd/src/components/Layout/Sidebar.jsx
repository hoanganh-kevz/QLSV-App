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
  PartitionOutlined,
  AppstoreAddOutlined,
  CheckSquareOutlined,
  DollarOutlined,
  NotificationOutlined,
  StarOutlined,
  CalendarOutlined,
  LikeOutlined,
  FileDoneOutlined
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
  // Helper to find parent keys for a given pathname
  const getAncestors = React.useCallback((path) => {
    const ancestors = [];
    if (path.startsWith('/grades')) {
      ancestors.push('academic-group', 'grades-group');
    } else if (['/schedule', '/exam-schedules', '/course-registrations', '/teacher-evaluations'].includes(path)) {
      ancestors.push('academic-group');
    } else if (['/attendances', '/training-points', '/petitions'].includes(path)) {
      ancestors.push('student-affairs-group');
    } else if (['/tuitions'].includes(path)) {
      ancestors.push('finance-group');
    } else if (['/students', '/teachers', '/subjects', '/class-sections', '/admin/users', '/admin/classes', '/admin/terms'].some(p => path.startsWith(p))) {
      ancestors.push('management-group');
    } else if (['/', '/dashboard', '/announcements'].includes(path)) {
      ancestors.push('system-group');
    } else if (['/profile', '/settings'].includes(path)) {
      ancestors.push('account-group');
    }
    return ancestors;
  }, []);

  const [openKeys, setOpenKeys] = React.useState(() => getAncestors(location.pathname));

  React.useEffect(() => {
    const ancestors = getAncestors(location.pathname);
    if (ancestors.length > 0) {
      setOpenKeys(prev => {
        // Merge with existing open keys to avoid closing manually opened sections
        const combined = new Set([...prev, ...ancestors]);
        return Array.from(combined);
      });
    }
  }, [location.pathname, getAncestors]);

  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const menuItems = [
    {
      key: 'system-group',
      icon: <HomeOutlined />,
      label: 'Hệ thống & Tin tức',
      children: [
        { key: '/', icon: <HomeOutlined />, label: t('nav.home') },
        { key: '/dashboard', icon: <DashboardOutlined />, label: t('nav.dashboard') },
        { key: '/announcements', icon: <NotificationOutlined />, label: 'Bảng tin' },
      ]
    },
    {
      key: 'academic-group',
      icon: <BookOutlined />,
      label: 'Học tập & Kết quả',
      children: [
        { key: '/schedule', icon: <TableOutlined />, label: 'Thời khóa biểu' },
        { key: '/exam-schedules', icon: <CalendarOutlined />, label: 'Lịch thi' },
        {
          key: 'grades-group',
          icon: <FormOutlined />,
          label: t('nav.grades'),
          children: [
            { key: '/grades', icon: <FormOutlined />, label: t('nav.grades.entry') },
            { key: '/grades/transcript', icon: <FileTextOutlined />, label: t('nav.grades.transcript') },
            { key: '/grades/sheet', icon: <TableOutlined />, label: t('nav.grades.sheet') },
          ]
        },
        { key: '/course-registrations', icon: <AppstoreAddOutlined />, label: 'Đăng ký học phần' },
        { key: '/teacher-evaluations', icon: <LikeOutlined />, label: 'Đánh giá giảng viên' },
      ]
    },
    {
      key: 'student-affairs-group',
      icon: <TeamOutlined />,
      label: 'Công tác Sinh viên',
      children: [
        { key: '/attendances', icon: <CheckSquareOutlined />, label: 'Điểm danh' },
        { key: '/training-points', icon: <StarOutlined />, label: 'Điểm rèn luyện' },
        { key: '/petitions', icon: <FileDoneOutlined />, label: 'Đơn từ sinh viên' },
      ]
    },
    {
      key: 'finance-group',
      icon: <DollarOutlined />,
      label: 'Tài chính',
      children: [
        { key: '/tuitions', icon: <DollarOutlined />, label: 'Học phí' },
      ]
    },
    {
      key: 'management-group',
      icon: <SolutionOutlined />,
      label: 'Quản lý (Admin)',
      children: [
        { key: '/students', icon: <TeamOutlined />, label: t('nav.students') },
        { key: '/teachers', icon: <SolutionOutlined />, label: t('nav.teachers') },
        { key: '/subjects', icon: <BookOutlined />, label: t('nav.subjects') },
        { key: '/class-sections', icon: <PartitionOutlined />, label: 'Lớp học phần' },
      ]
    },
    {
      key: 'account-group',
      icon: <UserOutlined />,
      label: 'Cá nhân & Cài đặt',
      children: [
        { key: '/profile', icon: <UserOutlined />, label: t('nav.profile') },
        { key: '/settings', icon: <SettingOutlined />, label: t('nav.settings') },
      ]
    }
  ];

  // Helper function to recursively filter menu items
  const filterMenuItems = (items) => {
    return items.map(item => {
      const newItem = { ...item };
      
      // If item has children, filter them first
      if (newItem.children) {
        newItem.children = filterMenuItems(newItem.children).filter(child => !!child);
        
        // If it's a structural group and has no visible children, hide the group
        if (newItem.children.length === 0) return null;
        return newItem;
      }

      // Specific Label Overrides for Teachers
      if (hasRole('teacher') && !hasRole('admin')) {
        if (newItem.key === 'management-group') {
          newItem.label = 'Quản lý Giảng dạy';
        }
        if (newItem.key === '/class-sections') {
          newItem.label = 'Lớp đang dạy';
          newItem.icon = <PartitionOutlined />;
        }
        if (newItem.key === '/teacher-evaluations') {
          newItem.label = 'Phản hồi từ sinh viên';
        }
      }

      // Role-based filtering for leaf items
      if (newItem.key === '/teachers' && !hasRole('admin')) return null;
      if (newItem.key === '/subjects' && !hasRole('admin')) return null;
      if (newItem.key === '/class-sections' && !hasRole(['admin', 'teacher'])) return null;
      if (newItem.key === '/students' && !hasRole('admin')) return null;
      if (newItem.key === '/grades' && !hasRole(['admin', 'teacher'])) return null;
      if (newItem.key === '/grades/sheet' && !hasRole(['admin', 'teacher'])) return null;

      // Personal Academic Pages (Students & Teachers only)
      if (newItem.key === '/schedule' && !hasExactRole(['teacher', 'student'])) return null;
      if (newItem.key === '/exam-schedules' && !hasExactRole(['student'])) return null;
      if (newItem.key === '/course-registrations' && !hasExactRole(['student'])) return null;
      if (newItem.key === '/teacher-evaluations' && !hasRole(['student', 'teacher'])) return null;
      
      // Student Affairs (Students & Teachers only)
      if (newItem.key === '/attendances' && !hasRole(['teacher', 'student'])) return null;
      if (newItem.key === '/training-points' && !hasExactRole(['student'])) return null;
      if (newItem.key === '/petitions' && !hasRole('admin') && !hasExactRole('student')) return null; // Teachers don't need petitions as per feedback
      
      // Finance (Students only)
      if (newItem.key === '/tuitions' && !hasExactRole(['student'])) return null;
      
      // Announcements (Everyone can see)
      if (newItem.key === '/announcements' && !hasRole(['admin', 'teacher', 'student'])) return null;
      
      return newItem;
    }).filter(item => !!item);
  };

  let filteredItems = filterMenuItems(menuItems);

  // Add Admin specific standalone routes into system group or management group if needed
  if (hasRole('admin')) {
    const mgmtGroup = filteredItems.find(item => item.key === 'management-group');
    if (mgmtGroup) {
      mgmtGroup.children.push(
        { key: '/admin/users', icon: <TeamOutlined />, label: t('nav.usermanagement') },
        { key: '/admin/classes', icon: <PartitionOutlined />, label: t('nav.classesmanagement') || 'Hệ thống Trường' },
        { key: '/admin/terms', icon: <BookOutlined />, label: 'Quản lý Học kỳ' }
      );
    }
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
