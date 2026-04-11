import React, { useState } from 'react';
import { UserOutlined, LockOutlined, MailOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Typography, Alert, message } from 'antd';
import uehLogo from '../../assets/UEH.png';
import { loginUser, registerUser, googleLogin as googleLoginApi } from '../../services/authService';
import { useTranslation } from '../../hooks/useTranslation';

import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const PremiumGoogleButton = ({ isLoginMode, onSuccess, onError }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                }).then(res => res.json());
                onSuccess(userInfo);
            } catch (err) {
                onError(err);
            } finally {
                setIsLoading(false);
            }
        },
        onError: onError
    });

    return (
        <Button
            size="large"
            block
            loading={isLoading}
            onClick={() => login()}
            style={{
                height: '52px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#374151',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
            }}
        >
            <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
            </svg>
            {isLoginMode ? t('auth.orSignWith') : t('auth.orSignWith')}
        </Button>
    );
};

const { Title, Text, Link } = Typography;

// ==========================================
// 1. BỘ LUẬT YUP
// ==========================================
const schema = yup.object().shape({
    username: yup.string().required('Username is required'),
    password: yup.string().min(8, 'Must be at least 8 characters with letter and number, no special or non-ASCII characters.').required('Password is required'),

    email: yup.string().when('$isLoginMode', {
        is: false,
        then: (schema) => schema.required('Email is required').email('Invalid email address'),
        otherwise: (schema) => schema.notRequired(),
    }),

    confirmPassword: yup.string().when('$isLoginMode', {
        is: false,
        then: (schema) => schema.required('Confirm your password').oneOf([yup.ref('password')], 'Passwords do not match'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

// ==========================================
// 2. COMPONENT CHÍNH
// ==========================================
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);

    const from = location.state?.from?.pathname || '/';

    const handleGoogleSuccess = async (userInfo) => {
        try {
            setLoading(true);
            // Call backend Google login API
            const data = await googleLoginApi(userInfo);
            const userData = {
                _id: data._id,
                email: data.email,
                username: data.username,
                name: data.name,
                avatar: data.avatar,
                role: data.role,
            };
            login(userData, data.token, false);
            message.success(`Chào mừng ${data.name || data.username} quay lại!`);
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 1000);
        } catch (error) {
            console.log("Lỗi xử lý Google Login:", error);
            message.error(error.response?.data?.message || "Đăng nhập Google thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        context: { isLoginMode },
        defaultValues: {
            username: '',
            password: '',
            email: '',
            confirmPassword: '',
        }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMsg('');
        try {
            if (isLoginMode) {
                // Call backend login API
                const res = await loginUser({
                    username: data.username,
                    password: data.password,
                });
                const userData = {
                    _id: res._id,
                    username: res.username,
                    email: res.email,
                    name: res.name,
                    role: res.role,
                    avatar: res.avatar,
                    phone: res.phone,
                    preferences: res.preferences,
                };
                login(userData, res.token, false);
                message.success('Đăng nhập thành công!');
                navigate(from, { replace: true });
            } else {
                // Call backend register API
                await registerUser({
                    username: data.username,
                    email: data.email,
                    password: data.password,
                });
                message.success({
                    content: 'Đăng ký thành công! Vui lòng đăng nhập lại.',
                    style: { marginTop: '5vh', fontFamily: 'Outfit' }
                }, 3);
                reset();
                setIsLoginMode(true);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Thao tác thất bại';
            setErrorMsg(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Outfit, sans-serif' }}>
            {/* CỘT TRÁI - BRANDING & ABSTRACT BACKGROUND */}
            <div
                className="animated-gradient-bg"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '4rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '40vw',
                    height: '40vw',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%',
                    animation: 'float 8s ease-in-out infinite'
                }} />

                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '50vw',
                    height: '50vw',
                    background: 'radial-gradient(circle, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%',
                    animation: 'float 12s ease-in-out infinite reverse'
                }} />

                <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 480 }}>
                    <div className="glass-panel" style={{
                        padding: '32px 48px',
                        borderRadius: '24px',
                        display: 'inline-block',
                        marginBottom: '2rem',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <img
                            src={uehLogo}
                            alt="UEH Logo"
                            style={{ width: '220px', display: 'block', filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))' }}
                        />
                    </div>

                    <Title level={1} style={{ color: 'white', margin: '0 0 16px', fontWeight: 700, fontSize: '3.5rem', lineHeight: 1.1, letterSpacing: '-1px' }}>
                        {t('auth.empower')}
                    </Title>

                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', fontWeight: 300, lineHeight: 1.6, display: 'block' }}>
                        {t('auth.footerDesc')}
                    </Text>
                </div>
            </div>

            {/* CỘT PHẢI - AUTHENTICATION FORM */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#ffffff',
                position: 'relative'
            }}>
                <div className="animate-scale-in" style={{ width: '100%', maxWidth: 440, padding: '2rem' }}>

                    <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                        <Title level={2} style={{ fontWeight: 800, color: '#111827', margin: 0, fontSize: '2.5rem', letterSpacing: '-0.5px' }}>
                            {isLoginMode ? t('auth.welcomeBack') : t('auth.createAccount')}
                        </Title>
                        <Text style={{ color: '#6b7280', fontSize: '1.1rem', marginTop: '0.5rem', display: 'block' }}>
                            {isLoginMode
                                ? t('auth.signInDesc')
                                : t('auth.signUpDesc')}
                        </Text>
                    </div>

                    {errorMsg && (
                        <div className="animate-fade-in-up">
                            <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 24, borderRadius: 12, border: 'none', background: '#fef2f2', color: '#991b1b' }} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>

                        <div className="animate-fade-in-up delay-100" style={{ marginBottom: 20 }}>
                            <Text style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>{t('common.username')}</Text>
                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => (
                                    <div className="premium-input">
                                        <Input
                                            {...field}
                                            prefix={<UserOutlined style={{ color: '#9ca3af', marginRight: 8 }} />}
                                            placeholder="Enter your username"
                                            size="large"
                                            status={errors.username ? 'error' : ''}
                                        />
                                    </div>
                                )}
                            />
                            {errors.username && <Text type="danger" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>{errors.username.message}</Text>}
                        </div>

                        {!isLoginMode && (
                            <div className="animate-fade-in-up delay-200" style={{ marginBottom: 20 }}>
                                <Text style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>{t('auth.emailAddress')}</Text>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="premium-input">
                                            <Input
                                                {...field}
                                                prefix={<MailOutlined style={{ color: '#9ca3af', marginRight: 8 }} />}
                                                placeholder="Enter your email"
                                                size="large"
                                                status={errors.email ? 'error' : ''}
                                            />
                                        </div>
                                    )}
                                />
                                {errors.email && <Text type="danger" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>{errors.email.message}</Text>}
                            </div>
                        )}

                        <div className={`animate-fade-in-up ${isLoginMode ? 'delay-200' : 'delay-300'}`} style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontWeight: 500, color: '#374151' }}>{t('common.password')}</Text>
                                {isLoginMode && (
                                <Link onClick={() => navigate('/forgot-password')} style={{ color: '#005A51', fontSize: 13, fontWeight: 500 }}>
                                    {t('auth.forgotPassword')}
                                </Link>
                                )}
                            </div>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <div className="premium-input">
                                        <Input.Password
                                            {...field}
                                            prefix={<LockOutlined style={{ color: '#9ca3af', marginRight: 8 }} />}
                                            placeholder="Enter your password"
                                            size="large"
                                            status={errors.password ? 'error' : ''}
                                        />
                                    </div>
                                )}
                            />
                            {errors.password && <Text type="danger" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>{errors.password.message}</Text>}
                        </div>

                        {!isLoginMode && (
                            <div className="animate-fade-in-up delay-400" style={{ marginBottom: 28 }}>
                                <Text style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>{t('auth.confirmPassword')}</Text>
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="premium-input">
                                            <Input.Password
                                                {...field}
                                                prefix={<LockOutlined style={{ color: '#9ca3af', marginRight: 8 }} />}
                                                placeholder="Confirm your password"
                                                size="large"
                                                status={errors.confirmPassword ? 'error' : ''}
                                            />
                                        </div>
                                    )}
                                />
                                {errors.confirmPassword && <Text type="danger" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>{errors.confirmPassword.message}</Text>}
                            </div>
                        )}

                        <div className={`animate-fade-in-up ${isLoginMode ? 'delay-300' : 'delay-400'}`}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                className="premium-btn"
                                icon={!loading && <ArrowRightOutlined />}
                                iconPosition="end"
                                style={{ marginTop: isLoginMode ? 12 : 0 }}
                            >
                                {isLoginMode ? t('auth.signIn') : t('auth.signUp')}
                            </Button>
                        </div>

                        {/* ======= COPY ĐOẠN NÀY DÁN VÀO ======= */}
                        <div className={`animate-fade-in-up ${isLoginMode ? 'delay-350' : 'delay-450'}`} style={{ marginTop: 24, marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                                <Text style={{ padding: '0 12px', color: '#6b7280', fontSize: 13, fontWeight: 500 }}>{t('auth.orContinue')}</Text>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <GoogleOAuthProvider clientId={(import.meta && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || '123'}>
                                    <PremiumGoogleButton
                                        isLoginMode={isLoginMode}
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => message.error('Đăng nhập Google thất bại')}
                                    />
                                </GoogleOAuthProvider>
                            </div>
                        </div>
                        {/* ==================================== */}

                        <div className={`animate-fade-in-up ${isLoginMode ? 'delay-400' : 'delay-400'}`} style={{ textAlign: 'center', marginTop: 32 }}>
                            <Text style={{ color: '#6b7280', fontSize: 15 }}>
                                {isLoginMode ? t('auth.noAccount') : t('auth.hasAccount')}
                            </Text>
                            <Link
                                onClick={() => { setIsLoginMode(!isLoginMode); setErrorMsg(''); reset(); }}
                                style={{ color: '#005A51', fontWeight: 600, fontSize: 15 }}
                            >
                                {isLoginMode ? t('auth.signUpLink') : t('auth.loginLink')}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;