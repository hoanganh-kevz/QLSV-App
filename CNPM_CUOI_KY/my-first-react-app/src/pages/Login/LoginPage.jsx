import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, Alert, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, CrownFilled } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api'; // We'll uncomment this when api is ready

const { Title, Text } = Typography;

// Yup Validation Schema
const schema = yup.object().shape({
    username: yup.string().required('Username is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    remember: yup.boolean(),
});

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            username: '',
            password: '',
            remember: false,
        }
    });

    const from = location.state?.from?.pathname || '/';

    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMsg('');
        try {
            // ** Mock API call **
            await new Promise(resolve => setTimeout(resolve, 800));

            if (data.username === 'admin' && data.password === '123456') {
                const mockUser = { id: 1, name: 'Admin User', role: 'admin' };
                const mockToken = 'mock-jwt-token-123';
                login(mockUser, mockToken, data.remember);
                navigate(from, { replace: true });
            } else {
                throw new Error('Invalid username or password. Try admin / 123456');
            }

        } catch (err) {
            setErrorMsg(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row style={{ minHeight: '100vh', background: '#f0f2f5' }}>

            {/* Left Column: Branding / Logo */}
            <Col xs={0} sm={0} md={12} lg={14} style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                padding: '2rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    {/* You can replace CrownFilled with an actual <img src="/logo.png" /> */}
                    <CrownFilled style={{ fontSize: '80px', marginBottom: '1rem', color: '#ffd700' }} />
                    <Title level={1} style={{ color: 'white', margin: 0 }}>PHB Logistics</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
                        Empowering the Future of Logistics & Technology
                    </Text>
                </div>
            </Col>

            {/* Right Column: Login Form */}
            <Col xs={24} sm={24} md={12} lg={10} style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem'
            }}>
                <Card style={{ width: '100%', maxWidth: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Title level={3}>Welcome Back</Title>
                        <Text type="secondary">Please login to access your account</Text>
                    </div>

                    {errorMsg && (
                        <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 24 }} />
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>

                        <div style={{ marginBottom: 16 }}>
                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        prefix={<UserOutlined />}
                                        placeholder="Username"
                                        size="large"
                                        status={errors.username ? 'error' : ''}
                                    />
                                )}
                            />
                            {errors.username && <Text type="danger" style={{ fontSize: 12 }}>{errors.username.message}</Text>}
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <Input.Password
                                        {...field}
                                        prefix={<LockOutlined />}
                                        placeholder="Password"
                                        size="large"
                                        status={errors.password ? 'error' : ''}
                                    />
                                )}
                            />
                            {errors.password && <Text type="danger" style={{ fontSize: 12 }}>{errors.password.message}</Text>}
                        </div>

                        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
                            <Controller
                                name="remember"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Checkbox checked={value} onChange={onChange}>Remember me</Checkbox>
                                )}
                            />
                            <a href="#">Forgot password?</a>
                        </div>

                        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                            Log in
                        </Button>

                    </form>
                </Card>
            </Col>
        </Row>
    );
};

export default LoginPage;
