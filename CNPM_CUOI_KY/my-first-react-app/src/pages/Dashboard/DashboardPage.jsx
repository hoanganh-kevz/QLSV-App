import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Alert } from 'antd';
import { UserOutlined, TeamOutlined, SolutionOutlined, InfoCircleOutlined, BookOutlined } from '@ant-design/icons';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';

const { Title, Text } = Typography;

const StatCard = ({ title, value, icon, color }) => (
    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>{title}</Text>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
            <span style={{ color: color, fontSize: 24, marginRight: 8, display: 'flex' }}>
                {icon}
            </span>
            <Title level={2} style={{ margin: 0, color: color, fontWeight: 700 }}>{value}</Title>
        </div>
    </Card>
);

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'];

const DashboardPage = () => {
    const [stats, setStats] = useState({ totalStudents: 0, totalClasses: 0, totalSubjects: 0, totalTeachers: 0, avgGpa: 0 });
    const [gradeData, setGradeData] = useState([]);
    const [classPerf, setClassPerf] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, gradeRes, perfRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/grade-distribution'),
                    api.get('/dashboard/class-performance')
                ]);

                setStats(statsRes.data?.data || statsRes.data);
                
                const gData = gradeRes.data?.data || gradeRes.data;
                const formattedGrades = Object.entries(gData).map(([name, value]) => ({ name, value }));
                setGradeData(formattedGrades);

                setClassPerf(perfRes.data?.data || perfRes.data);

            } catch (err) {
                console.error("Failed to load dashboard data", err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    if (error) return <Alert type="error" message={error} style={{ marginBottom: 20 }} />;

    return (
        <div style={{ padding: '0px 8px' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 28, color: '#111827' }}>Tổng Quan</Title>
                <Text type="secondary" style={{ fontSize: 14 }}>Chào mừng trở lại. Dưới đây là hoạt động hôm nay.</Text>
            </div>
            
            <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="Sinh Viên" 
                        value={stats.totalStudents || 81} 
                        icon={<UserOutlined />} 
                        color="#1890ff" 
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="Giảng Viên" 
                        value={stats.totalTeachers || 1} 
                        icon={<SolutionOutlined />} 
                        color="#52c41a" 
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="Khoảng điểm GPA" 
                        value={(stats.avgGpa || 0).toFixed(2)} 
                        icon={<BookOutlined />} 
                        color="#faad14" 
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard 
                        title="Điểm Số" 
                        value={stats.totalSubjects || 0} 
                        icon={<InfoCircleOutlined />} 
                        color="#ff4d4f" 
                    />
                </Col>
            </Row>

            <Row gutter={[20, 20]}>
                <Col xs={24} lg={16}>
                    <Card 
                        title={<span style={{ fontWeight: 700, fontSize: 16 }}>Kết Quả Học Tập Theo Học Kỳ</span>} 
                        bordered={false} 
                        style={{ height: '100%', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                    >
                        {classPerf.length > 0 ? (
                             <ResponsiveContainer width="100%" height={320}>
                                 <BarChart data={classPerf} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                     <XAxis dataKey="className" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                     <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                     <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                     <Legend iconType="square" wrapperStyle={{ paddingTop: 20 }} />
                                     <Bar dataKey="averageGpa" name="Điểm trung bình" fill="#1890ff" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                 </BarChart>
                             </ResponsiveContainer>
                        ) : (
                             <div style={{ display: 'flex', flexDirection: 'column', height: 320, justifyContent: 'center', alignItems: 'center' }}>
                                 <div style={{ width: '100%', height: 200, border: '1px dashed #d9d9d9', borderBottom: '1px solid #d9d9d9', position: 'relative' }}>
                                     <div style={{ position: 'absolute', bottom: -25, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
                                         <div style={{ width: 12, height: 12, backgroundColor: '#1890ff', marginRight: 8, borderRadius: 2 }}></div>
                                         <Text style={{ fontSize: 12, color: '#666' }}>Điểm trung bình</Text>
                                     </div>
                                 </div>
                             </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card 
                        title={<span style={{ fontWeight: 700, fontSize: 16 }}>Phân Bổ Xếp Loại</span>} 
                        bordered={false} 
                        style={{ height: '100%', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                    >
                        {gradeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie data={gradeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {gradeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 320, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ width: 250, height: 250, border: '1px solid #f0f0f0', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                     <Text type="secondary">Chưa có dữ liệu</Text>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
