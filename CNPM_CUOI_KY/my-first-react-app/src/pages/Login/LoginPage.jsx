import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Row, Col, Divider } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, GoogleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { Title, Text } = Typography;

// Yup Validation Schema
const schema = yup.object().shape({
    username: yup.string().required('Username is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
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
            const response = await api.post('/auth/login', {
                username: data.username,
                password: data.password
            });

            const { token, username, fullName, role, email } = response.data;
            const userObj = { username, name: fullName, role, email };
            
            // In the mockup, there is no remember me checkbox, so default to false
            login(userObj, token, false);
            navigate(from, { replace: true });
            
        } catch (err) {
            const serverMsg = err.response?.data?.message || err.response?.data || err.message;
            setErrorMsg(typeof serverMsg === 'string' ? serverMsg : 'Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Left Column: Branding / Logo (Dark Green Background) */}
            <Col xs={0} sm={0} md={12} lg={13} style={{
                backgroundColor: '#0A6C5B',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                padding: '2rem'
            }}>
                <div style={{ textAlign: 'center', maxWidth: 450 }}>
                    {/* UEH Rounded Logo Box */}
                    <div style={{
                        background: 'white',
                        borderRadius: 24,
                        padding: '16px 36px',
                        display: 'inline-flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '40px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }}>
                        <h1 style={{ color: '#0A6C5B', fontSize: 64, fontWeight: 900, margin: 0, lineHeight: 1, letterSpacing: -2 }}>UEH</h1>
                        <h3 style={{ color: '#E87722', fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: 1, marginTop: 4 }}>UNIVERSITY</h3>
                    </div>
                    
                    <Title level={1} style={{ color: 'white', fontWeight: 800, fontSize: 48, margin: '0 0 24px 0', lineHeight: 1.2 }}>
                        Empower your<br />future
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, lineHeight: 1.6, display: 'block' }}>
                        The most advanced student management system.<br />
                        Join thousands of UEH students today.
                    </Text>
                </div>
            </Col>

            {/* Right Column: Login Form (White Background) */}
            <Col xs={24} sm={24} md={12} lg={11} style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                backgroundColor: '#ffffff'
            }}>
                <div style={{ width: '100%', maxWidth: 420 }}>
                    <div style={{ marginBottom: 40 }}>
                        <Title level={2} style={{ fontWeight: 800, fontSize: 36, margin: 0, color: '#111827' }}>Welcome back</Title>
                        <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 8, display: 'block' }}>
                            Please enter your details to sign in.
                        </Text>
                    </div>

                    {errorMsg && (
                        <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 24 }} />
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text strong style={{ fontSize: 14 }}>Username</Text>
                            </div>
                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Enter your username"
                                        size="large"
                                        style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                                        status={errors.username ? 'error' : ''}
                                    />
                                )}
                            />
                            {errors.username && <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>{errors.username.message}</Text>}
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <Text strong style={{ fontSize: 14 }}>Password</Text>
                                <a href="#" style={{ fontSize: 13, color: '#0A6C5B', fontWeight: 600 }}>Forgot password?</a>
                            </div>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <Input.Password
                                        {...field}
                                        placeholder="Enter your password"
                                        size="large"
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                                        status={errors.password ? 'error' : ''}
                                    />
                                )}
                            />
                            {errors.password && <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>{errors.password.message}</Text>}
                        </div>

                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            size="large" 
                            block 
                            loading={loading}
                            style={{ 
                                boxShadow: '0 4px 14px 0 rgba(10, 108, 91, 0.39)',
                                fontSize: 16
                            }}
                        >
                            Sign In &rarr;
                        </Button>

                        <Divider style={{ color: '#9ca3af', fontSize: 13, margin: '24px 0' }}>Or continue with</Divider>

                        <Button 
                            size="large" 
                            block 
                            icon={<GoogleOutlined style={{ color: '#EA4335' }} />}
                            style={{ 
                                fontWeight: 500,
                                color: '#374151',
                                borderColor: '#e5e7eb',
                                backgroundColor: '#ffffff'
                            }}
                        >
                            Or sign in with
                        </Button>

                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <Text style={{ color: '#6b7280' }}>
                                Don't have an account? <a href="#" style={{ color: '#0A6C5B', fontWeight: 700 }}>Sign up for free</a>
                            </Text>
                        </div>

                    </form>
                </div>
            </Col>
        </Row>
    );
};

export default LoginPage;
