import React from 'react';
import { Typography, Row, Col, Card, Avatar } from 'antd';
import { UserOutlined, BookOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ActionCard = ({ title, icon, color, bgColor, path }) => {
    const navigate = useNavigate();
    return (
        <Card 
            hoverable 
            onClick={() => navigate(path)}
            bordered={false} 
            style={{ 
                borderRadius: 16, 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                height: '100%'
            }}
            bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}
        >
            <Avatar size={64} style={{ backgroundColor: bgColor, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 28 }}>{icon}</span>
            </Avatar>
            <Text strong style={{ fontSize: 16, color: '#374151' }}>{title}</Text>
        </Card>
    );
};

const HomePage = () => {
    return (
        <div style={{ padding: '0px 8px' }}>
            {/* Main Welcome Banner */}
            <div style={{
                backgroundColor: '#0A6C5B',
                borderRadius: 24,
                padding: '48px 40px',
                color: 'white',
                marginBottom: 32,
                boxShadow: '0 20px 25px -5px rgba(10, 108, 91, 0.2), 0 10px 10px -5px rgba(10, 108, 91, 0.1)'
            }}>
                <Title level={1} style={{ color: 'white', margin: '0 0 16px 0', fontSize: 36, fontWeight: 800 }}>
                    Chào mừng đến với Cổng thông tin UEH
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 18, display: 'block', maxWidth: 800, lineHeight: 1.6 }}>
                    Nền tảng mạnh mẽ để quản lý dữ liệu giáo dục của bạn một cách hiệu quả và an toàn.
                    Tối ưu hóa quá trình học tập và giảng dạy với các công cụ tiên tiến nhất.
                </Text>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ marginBottom: 20, color: '#111827', fontWeight: 700 }}>Thao tác nhanh</Title>
                <Row gutter={[24, 24]}>
                    <Col xs={12} sm={12} md={6}>
                        <ActionCard 
                            title="Sinh Viên" 
                            icon={<UserOutlined />} 
                            color="#2563eb" 
                            bgColor="#dbeafe" 
                            path="/students" 
                        />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <ActionCard 
                            title="Môn Học" 
                            icon={<BookOutlined />} 
                            color="#d97706" 
                            bgColor="#fef3c7" 
                            path="/subjects" 
                        />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <ActionCard 
                            title="Bảng Điều Khiển" 
                            icon={<DashboardOutlined />} 
                            color="#059669" 
                            bgColor="#d1fae5" 
                            path="/dashboard" 
                        />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <ActionCard 
                            title="Hồ sơ của tôi" 
                            icon={<UserOutlined />} 
                            color="#4b5563" 
                            bgColor="#f3f4f6" 
                            path="/profile" 
                        />
                    </Col>
                </Row>
            </div>

            {/* System Info */}
            <Row>
                <Col span={24}>
                    <Card title={<span style={{ fontWeight: 700, fontSize: 16 }}>Thông tin hệ thống</span>} bordered={false} style={{ borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            <Avatar size={48} style={{ backgroundColor: '#f3f4f6', color: '#6b7280', flexShrink: 0 }}>
                                <SettingOutlined style={{ fontSize: 24 }} />
                            </Avatar>
                            <div>
                                <Text style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.6, display: 'block' }}>
                                    Hệ thống này được thiết kế và phát triển dựa trên nền tảng .NET 8 (Backend) và React (Frontend).
                                    Nó cung cấp một giải pháp toàn diện cho việc quản lý thông tin sinh viên, lịch học, điểm số, và nhiều tính năng quản trị khác.
                                </Text>
                                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                                    Phiên bản: 2.0.0 | Cập nhật lần cuối: Hôm nay
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default HomePage;
