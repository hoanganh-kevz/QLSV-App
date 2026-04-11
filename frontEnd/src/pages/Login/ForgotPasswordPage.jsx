import React, { useState } from 'react';
import { MailOutlined, LockOutlined, SafetyOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined, SmileOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Typography, Alert, message, Steps, Result } from 'antd';
import uehLogo from '../../assets/UEH.png';
import { forgotPassword, resetPassword } from '../../services/authService';

const { Title, Text, Link } = Typography;

// Unified Schema
const schema = yup.object().shape({
    email: yup.string().required('Vui lòng nhập Email').email('Email không hợp lệ'),
    otp: yup.string().when('$currentStep', {
        is: (val) => val >= 1,
        then: (s) => s.required('Vui lòng nhập mã OTP').length(6, 'Mã phải có 6 chữ số'),
        otherwise: (s) => s.notRequired(),
    }),
    password: yup.string().when('$currentStep', {
        is: (val) => val >= 1,
        then: (s) => s.required('Vui lòng nhập mật khẩu mới').min(8, 'Mật khẩu phải từ 8 ký tự'),
        otherwise: (s) => s.notRequired(),
    }),
    confirmPassword: yup.string().when('$currentStep', {
        is: (val) => val >= 1,
        then: (s) => s.required('Vui lòng xác nhận mật khẩu').oneOf([yup.ref('password')], 'Mật khẩu không khớp'),
        otherwise: (s) => s.notRequired(),
    }),
});

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0); // 0: Email, 1: OTP, 2: Success
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [persistedEmail, setPersistedEmail] = useState(''); // New state for persistence

    const { control, handleSubmit, watch, trigger, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        context: { currentStep },
        shouldUnregister: false,
        defaultValues: { email: '', otp: '', password: '', confirmPassword: '' }
    });

    const userEmail = watch('email') || persistedEmail;

    // Handle Logic
    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMsg('');
        const targetEmail = data.email || persistedEmail;
        
        try {
            if (currentStep === 0) {
                // Step 1: Send OTP
                const isEmailValid = await trigger('email');
                if (!isEmailValid) return;
                
                await forgotPassword(targetEmail);
                setPersistedEmail(targetEmail); 
                message.success('Mã OTP đã được gửi đến email của bạn');
                setCurrentStep(1);
            } else if (currentStep === 1) {
                // Step 2: Reset Password
                if (!targetEmail) {
                    throw new Error('Không tìm thấy Email. Vui lòng quay lại bước 1.');
                }

                await resetPassword({
                    email: targetEmail,
                    otp: data.otp,
                    password: data.password
                });
                setCurrentStep(2); 
            }
        } catch (err) {
            const serverMsg = err.response?.data?.message;
            setErrorMsg(serverMsg || err.message || 'Đã có lỗi xảy ra. Hãy chắc chắn bạn đã nhập đúng mã OTP mới nhất.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Outfit, sans-serif' }}>
            {/* LEFT BRANDING */}
            <div className="animated-gradient-bg" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem', position: 'relative', overflow: 'hidden' }}>
                <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div className="glass-panel" style={{ padding: '32px 48px', borderRadius: '24px', display: 'inline-block', marginBottom: '2rem' }}>
                        <img src={uehLogo} alt="UEH Logo" style={{ width: '220px' }} />
                    </div>
                    <Title level={1} style={{ color: 'white', margin: '0 0 16px', fontWeight: 700, fontSize: '3rem' }}>
                        {currentStep === 0 ? 'Khôi phục tài khoản' : currentStep === 1 ? 'Xác thực bảo mật' : 'Hoàn tất cấu hình'}
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem' }}>
                        {currentStep === 0 ? 'Hệ thống sẽ gửi mã xác nhận đến email của bạn.' : currentStep === 1 ? `Mã 6 chữ số đã được gửi tới ${userEmail}` : 'Tài khoản của bạn đã sẵn sàng sử dụng.'}
                    </Text>
                </div>
            </div>

            {/* RIGHT FORM */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#ffffff' }}>
                <div className="animate-scale-in" style={{ width: '100%', maxWidth: 460, padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <Steps current={currentStep} size="small" items={[{ title: 'Email' }, { title: 'Xác thực' }, { title: 'Hoàn tất' }]} />
                    </div>

                    {currentStep !== 2 && (
                        <>
                            <Title level={2} style={{ fontWeight: 800, marginBottom: 8 }}>{currentStep === 0 ? 'Quên mật khẩu?' : 'Nhập mã xác nhận'}</Title>
                            <Text style={{ color: '#6b7280', display: 'block', marginBottom: 24 }}>
                                {currentStep === 0 ? 'Vui lòng cung cấp email đăng ký để tiếp tục.' : 'Vui lòng kiểm tra email và nhập mã OTP 6 số.'}
                            </Text>
                        </>
                    )}

                    {errorMsg && <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 20 }} />}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Always keep email in DOM but hide it in steps 2 and 3 */}
                        <div style={{ display: currentStep === 0 ? 'block' : 'none' }} className="animate-fade-in-up">
                            <div style={{ marginBottom: 24 }}>
                                <Text style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>Email đăng ký</Text>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input 
                                            {...field} 
                                            size="large" 
                                            prefix={<MailOutlined />} 
                                            placeholder="example@ueh.edu.vn" 
                                            style={{ borderRadius: 10, height: 48 }}
                                        />
                                    )}
                                />
                                {errors.email && <Text type="danger">{errors.email.message}</Text>}
                            </div>
                            <Button type="primary" htmlType="submit" block loading={loading} className="premium-btn" icon={<ArrowRightOutlined />} iconPosition="end">Tiếp tục</Button>
                        </div>

                        {currentStep === 1 && (
                            <div className="animate-fade-in-up">
                                <div style={{ marginBottom: 20 }}>
                                    <Text style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>Mã OTP (6 số)</Text>
                                    <Controller
                                        name="otp"
                                        control={control}
                                        render={({ field }) => (
                                            <Input 
                                                {...field} 
                                                size="large" 
                                                prefix={<SafetyOutlined />} 
                                                placeholder="123456" 
                                                maxLength={6}
                                                style={{ borderRadius: 10, height: 48 }}
                                                autoFocus
                                            />
                                        )}
                                    />
                                    {errors.otp && <Text type="danger">{errors.otp.message}</Text>}
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <Text style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>Mật khẩu mới</Text>
                                    <Controller
                                        name="password"
                                        control={control}
                                        render={({ field }) => (
                                            <Input.Password 
                                                {...field} 
                                                size="large" 
                                                prefix={<LockOutlined />} 
                                                placeholder="Nhập ít nhất 8 ký tự" 
                                                style={{ borderRadius: 10, height: 48 }}
                                            />
                                        )}
                                    />
                                    {errors.password && <Text type="danger">{errors.password.message}</Text>}
                                </div>

                                <div style={{ marginBottom: 28 }}>
                                    <Text style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>Xác nhận mật khẩu</Text>
                                    <Controller
                                        name="confirmPassword"
                                        control={control}
                                        render={({ field }) => (
                                            <Input.Password 
                                                {...field} 
                                                size="large" 
                                                prefix={<CheckCircleOutlined />} 
                                                placeholder="Nhập lại mật khẩu" 
                                                style={{ borderRadius: 10, height: 48 }}
                                            />
                                        )}
                                    />
                                    {errors.confirmPassword && <Text type="danger">{errors.confirmPassword.message}</Text>}
                                </div>

                                <Button type="primary" htmlType="submit" block loading={loading} className="premium-btn">Cập nhật mật khẩu</Button>
                                
                                <div style={{ textAlign: 'center', marginTop: 16 }}>
                                    <Link onClick={() => setCurrentStep(0)} style={{ color: '#6b7280' }}>Sai Email? Nhấn để đổi</Link>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="animate-scale-in">
                                <Result
                                    icon={<SmileOutlined style={{ color: '#005A51' }} />}
                                    title="Khôi phục thành công!"
                                    subTitle="Mật khẩu của bạn đã được cập nhật chính xác trên hệ thống. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới này."
                                    extra={[
                                        <Button 
                                            type="primary" 
                                            key="login" 
                                            className="premium-btn" 
                                            style={{ width: '200px' }}
                                            onClick={() => navigate('/login')}
                                        >
                                            Đăng nhập ngay
                                        </Button>
                                    ]}
                                />
                            </div>
                        )}
                    </form>

                    {currentStep !== 2 && (
                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <Link onClick={() => navigate('/login')} style={{ color: '#005A51', fontWeight: 600 }}>
                                <ArrowLeftOutlined /> Quay lại đăng nhập
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
