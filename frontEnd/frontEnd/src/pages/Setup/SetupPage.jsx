import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Steps, Result, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, RocketOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { setupService } from '../../services/setupService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SetupPage = () => {
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        const res = await setupService.initializeSystem(values);
        if (res.success) {
            message.success('System initialized successfully!');
            setCurrent(2);
        } else {
            message.error(res.message);
        }
        setLoading(false);
    };

    const steps = [
        {
            title: 'Welcome',
            icon: <RocketOutlined />,
        },
        {
            title: 'Create Admin',
            icon: <UserOutlined />,
        },
        {
            title: 'Finished',
            icon: <CheckCircleOutlined />,
        },
    ];

    const renderContent = () => {
        if (current === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
                    <Title level={2}>Welcome to UEH System</Title>
                    <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '32px' }}>
                        This is a one-time setup to initialize your management portal.
                        You will create the primary administrator account.
                    </Text>
                    <Button type="primary" size="large" onClick={() => setCurrent(1)} style={{ borderRadius: '8px', height: '48px', padding: '0 40px' }}>
                        Get Started
                    </Button>
                </div>
            );
        }

        if (current === 1) {
            return (
                <div style={{ padding: '20px 0' }}>
                    <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>Configure Root Administrator</Title>
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter your name' }]}>
                            <Input prefix={<UserOutlined />} placeholder="John Doe" size="large" />
                        </Form.Item>
                        <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please enter username' }]}>
                            <Input prefix={<UserOutlined />} placeholder="admin_ueh" size="large" />
                        </Form.Item>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                            <Input prefix={<MailOutlined />} placeholder="admin@ueh.edu.vn" size="large" />
                        </Form.Item>
                        <Form.Item name="password" label="Master Password" rules={[{ required: true, min: 8 }]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="********" size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ marginTop: '16px', borderRadius: '8px' }}>
                            Initialize System
                        </Button>
                    </Form>
                </div>
            );
        }

        return (
            <Result
                status="success"
                title="System Ready!"
                subTitle="The root administrator has been created. You can now log in to the portal."
                extra={[
                    <Button type="primary" key="login" onClick={() => navigate('/login')} style={{ borderRadius: '8px' }}>
                        Go to Login
                    </Button>,
                ]}
            />
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #005A51 0%, #004b43 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Card className="glass-panel" style={{ width: '100%', maxWidth: '600px', borderRadius: '24px', border: 'none' }}>
                <Steps current={current} items={steps} style={{ marginBottom: '40px' }} />
                {renderContent()}
            </Card>
        </div>
    );
};

export default SetupPage;
