import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Row, Col, Typography, Avatar, Upload, Spin } from 'antd';
import { UserOutlined, UploadOutlined, MailOutlined, PhoneOutlined, SolutionOutlined } from '@ant-design/icons';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { showSuccess } from '../../components/common/SuccessMessage/SuccessMessage';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import confetti from 'canvas-confetti';
import { useTranslation } from '../../hooks/useTranslation';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const { t } = useTranslation();
    const { updateUser } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            const res = await profileService.getProfile();
            if (res.success) {
                setProfile(res.data);
                form.setFieldsValue({
                    name: res.data.name,
                    email: res.data.email,
                    phone: res.data.phone,
                    avatar: res.data.avatar,
                });
            } else {
                showError(res.message);
            }
            setLoading(false);
        };
        loadProfile();
    }, [form]);

    const handleUpdateProfile = async (values) => {
        setSaving(true);
        const res = await profileService.updateProfile(values);
        if (res.success) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            showSuccess(res.message);
            setProfile(res.data); // Use full data from backend response
            updateUser(res.data); // Update global context with full data from backend
        } else {
            showError(res.message);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', background: 'var(--bg-color)', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-color)' }}>{t('profile.title')}</Title>
                <Text style={{ color: 'var(--text-color)', opacity: 0.65 }}>{t('settings.personal.title')}</Text>
            </div>

            <Row gutter={[24, 24]}>
                {/* Profile Summary Card */}
                <Col xs={24} lg={8}>
                    <Card className="glass-panel" bordered={false} style={{ textAlign: 'center', height: '100%' }}>
                        <Avatar
                            size={120}
                            icon={<UserOutlined />}
                            src={profile?.avatar}
                            style={{ marginBottom: 16, background: 'var(--brand-gradient)' }}
                        />
                        <Title level={4} style={{ margin: 0, color: 'var(--text-color)' }}>{profile?.name}</Title>
                        <Text style={{ display: 'block', marginBottom: 16, color: 'var(--text-color)', opacity: 0.65 }}>{profile?.role?.toUpperCase()}</Text>

                        <div style={{ marginTop: 32, textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                            <div style={{ marginBottom: 12 }}>
                                <MailOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                                <Text style={{ color: 'var(--text-color)', opacity: 0.65 }}>Email:</Text> <br />
                                <Text strong style={{ color: 'var(--text-color)', marginLeft: 24 }}>{profile?.email}</Text>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <PhoneOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                                <Text style={{ color: 'var(--text-color)', opacity: 0.65 }}>{t('profile.phone')}:</Text> <br />
                                <Text strong style={{ color: 'var(--text-color)', marginLeft: 24 }}>{profile?.phone || t('profile.notSet')}</Text>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <SolutionOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                                <Text style={{ color: 'var(--text-color)', opacity: 0.65 }}>{t('common.status')}:</Text> <br />
                                <Text strong style={{ color: '#52c41a', marginLeft: 24 }}>{t('students.status.active')}</Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Edit Form Card */}
                <Col xs={24} lg={16}>
                    <Card className="glass-panel" bordered={false} title={t('settings.personal.title')} style={{ minHeight: '100%' }}>
                        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item label={t('profile.fullName')} name="name" rules={[{ required: true, message: t('profile.nameRequired') }]}>
                                        <Input size="large" placeholder={t('profile.fullName')} prefix={<UserOutlined style={{ opacity: 0.45 }} />} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label={t('profile.email')} name="email">
                                        <Input size="large" disabled prefix={<MailOutlined style={{ opacity: 0.45 }} />} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label={t('profile.phone')} name="phone">
                                        <Input size="large" placeholder={t('profile.phone')} prefix={<PhoneOutlined style={{ opacity: 0.45 }} />} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label={t('profile.avatarUrl') || "URL Ảnh đại diện"} name="avatar">
                                        <Input size="large" placeholder="https://example.com/avatar.jpg" prefix={<UploadOutlined style={{ opacity: 0.45 }} />} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <div style={{ marginTop: 24 }}>
                                <Button type="primary" htmlType="submit" size="large" loading={saving} style={{ padding: '0 40px', borderRadius: '10px' }}>
                                    {t('profile.save')}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;
