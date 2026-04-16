import React from 'react';
import { Row, Col, Card, Typography, Button } from 'antd';
import { UserOutlined, DashboardOutlined, SettingOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../context/ThemeContext';
import './HomePage.css';

const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
    const { t } = useTranslation();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <div className="home-hero">
                <div className="hero-content">
                    <Title className="hero-title" style={{ color: '#fff' }}>{t('home.welcome')}</Title>
                    <Paragraph className="hero-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        {t('home.subtitle')}
                    </Paragraph>
                </div>
            </div>

            <div className="quick-actions-container">
                <Title level={3} style={{ marginBottom: 24, fontWeight: 700 }}>{t('home.quickActions')}</Title>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="action-card" hoverable bordered={false} onClick={() => navigate('/students')}>
                            <div className="action-icon" style={{ backgroundColor: isDarkMode ? 'rgba(24, 144, 255, 0.15)' : '#e6f7ff', color: '#1890ff', boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(24,144,255,0.2)' }}>
                                <TeamOutlined />
                            </div>
                            <Title level={4}>{t('nav.students')}</Title>
                            <Text type="secondary" style={{ fontSize: '15px' }}>{t('home.manageStudents')}</Text>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="action-card" hoverable bordered={false} onClick={() => navigate('/subjects')}>
                            <div className="action-icon" style={{ backgroundColor: isDarkMode ? 'rgba(250, 140, 22, 0.15)' : '#fff7e6', color: '#fa8c16', boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(250,140,22,0.2)' }}>
                                <BookOutlined />
                            </div>
                            <Title level={4}>{t('nav.subjects')}</Title>
                            <Text type="secondary" style={{ fontSize: '15px' }}>{t('home.manageSubjects')}</Text>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="action-card" hoverable bordered={false} onClick={() => navigate('/dashboard')}>
                            <div className="action-icon" style={{ backgroundColor: isDarkMode ? 'rgba(82, 196, 26, 0.15)' : '#f6ffed', color: '#52c41a', boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(82,196,26,0.2)' }}>
                                <DashboardOutlined />
                            </div>
                            <Title level={4}>{t('nav.dashboard')}</Title>
                            <Text type="secondary" style={{ fontSize: '15px' }}>{t('home.analyzeMetrics')}</Text>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="action-card" hoverable bordered={false} onClick={() => navigate('/profile')}>
                            <div className="action-icon" style={{ backgroundColor: isDarkMode ? 'rgba(0, 90, 81, 0.2)' : 'rgba(0, 90, 81, 0.1)', color: 'var(--primary-color)', boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(0, 90, 81, 0.2)' }}>
                                <UserOutlined />
                            </div>
                            <Title level={4}>{t('nav.profile')}</Title>
                            <Text type="secondary" style={{ fontSize: '15px' }}>{t('home.manageProfile')}</Text>
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className="recent-activity-container" style={{ marginTop: '40px' }}>
                <Card title={t('home.systemInfo')}>
                    <Paragraph>
                        {t('home.systemDesc')}
                    </Paragraph>
                </Card>
            </div>
        </div>
    );
};

export default HomePage;
