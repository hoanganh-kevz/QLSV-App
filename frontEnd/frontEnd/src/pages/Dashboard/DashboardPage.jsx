import React, { useState, useEffect } from 'react';
import { Typography, Button, Space, Spin, Result } from 'antd';
import { 
    BarChartOutlined,
    BellOutlined,
    RocketOutlined,
    CrownOutlined,
    SolutionOutlined,
    BookOutlined,
} from '@ant-design/icons';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import './DashboardPage.css';

const { Title, Text } = Typography;

// Thông tin tiêu đề cho từng vai trò
const ROLE_CONFIG = {
    admin: {
        icon: <CrownOutlined style={{ color: '#1890ff' }} />,
        title: 'Bảng điều khiển Quản trị',
        subtitle: 'Tổng quan toàn hệ thống — Sinh viên, Giảng viên, Lớp học phần',
        color: '#1890ff'
    },
    manager: {
        icon: <CrownOutlined style={{ color: '#1890ff' }} />,
        title: 'Bảng điều khiển Quản lý',
        subtitle: 'Tổng quan toàn hệ thống — Sinh viên, Giảng viên, Lớp học phần',
        color: '#1890ff'
    },
    teacher: {
        icon: <SolutionOutlined style={{ color: '#722ed1' }} />,
        title: 'Bảng điều khiển Giảng viên',
        subtitle: 'Theo dõi lớp học phần, tiến độ nhập điểm và kết quả sinh viên của bạn',
        color: '#722ed1'
    },
    student: {
        icon: <BookOutlined style={{ color: '#13c2c2' }} />,
        title: 'Bảng điều khiển Sinh viên',
        subtitle: 'Theo dõi kết quả học tập cá nhân, GPA và bảng điểm của bạn',
        color: '#13c2c2'
    },
};

const DashboardPage = () => {
    const { user } = useAuth();
    const role = user?.role || 'admin';
    const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.admin;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await dashboardService.getDashboardStats();
                if (response.success) {
                    setData(response.data);
                } else {
                    setError(response.message || 'Không thể tải dữ liệu dashboard');
                }
            } catch (err) {
                console.error('Dashboard error:', err);
                setError('Lỗi kết nối server. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [role]);

    const renderDashboard = () => {
        // Đang tải lần đầu
        if (loading && !data) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <Spin size="large" description="Đang tải dữ liệu..." />
                </div>
            );
        }

        if (error) {
            return (
                <Result
                    status="error"
                    title="Lỗi tải dữ liệu"
                    subTitle={error}
                    extra={[
                        <Button key="retry" type="primary" onClick={() => window.location.reload()}>
                            Thử lại
                        </Button>
                    ]}
                />
            );
        }

        if (role === 'admin' || role === 'manager') {
            return <AdminDashboard data={data} loading={loading} />;
        }
        if (role === 'teacher') {
            return <TeacherDashboard data={data} loading={loading} />;
        }
        if (role === 'student') {
            return <StudentDashboard data={data} loading={loading} />;
        }

        // Role không hợp lệ
        return (
            <Result
                status="403"
                title="Không có quyền truy cập"
                subTitle="Vai trò người dùng của bạn không được nhận dạng."
            />
        );
    };

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={1} className="premium-title">
                        {roleConfig.icon}{'  '}
                        {roleConfig.title}
                    </Title>
                    <Text className="premium-subtitle">{roleConfig.subtitle}</Text>
                </div>
                <Space>
                    <Button icon={<BellOutlined />} className="glass-panel" shape="circle" />
                    <Button
                        type="primary"
                        icon={<BarChartOutlined />}
                        className="premium-btn"
                        style={{ background: roleConfig.color, borderColor: roleConfig.color }}
                    >
                        Xuất báo cáo
                    </Button>
                </Space>
            </div>

            {renderDashboard()}
        </div>
    );
};

export default DashboardPage;
