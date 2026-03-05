import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, message } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    BookOutlined,
    SolutionOutlined,
} from '@ant-design/icons';
import { dashboardService } from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/Loading/LoadingSpinner';

const { Title } = Typography;

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalClasses: 0,
        totalSubjects: 0,
        totalTeachers: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getStats();
            setStats({
                totalStudents: data.totalStudents || 0,
                totalClasses: data.totalClasses || 0,
                totalSubjects: data.totalSubjects || 0,
                totalTeachers: data.totalTeachers || 0,
            });
        } catch (error) {
            message.error('Không thể tải thống kê');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const statCards = [
        {
            title: 'Tổng sinh viên',
            value: stats.totalStudents,
            icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
            color: '#1890ff',
        },
        {
            title: 'Tổng lớp học',
            value: stats.totalClasses,
            icon: <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
            color: '#52c41a',
        },
        {
            title: 'Tổng môn học',
            value: stats.totalSubjects,
            icon: <BookOutlined style={{ fontSize: 24, color: '#faad14' }} />,
            color: '#faad14',
        },
        {
            title: 'Tổng giảng viên',
            value: stats.totalTeachers,
            icon: <SolutionOutlined style={{ fontSize: 24, color: '#f5222d' }} />,
            color: '#f5222d',
        },
    ];

    return (
        <div>
            <Title level={3}>Dashboard</Title>

            <Row gutter={[16, 16]}>
                {statCards.map((stat, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card
                            bordered={false}
                            style={{
                                borderLeft: `4px solid ${stat.color}`,
                            }}
                        >
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.icon}
                                valueStyle={{ color: stat.color }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Biểu đồ thống kê">
                        <p style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                            Biểu đồ sẽ được hiển thị ở đây (Tuần 3)
                        </p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;