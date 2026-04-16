import React, { useState } from 'react';
import { Typography, Switch, Select, Button, message, Form, Input, Divider } from 'antd';
import {
    UserOutlined,
    LockOutlined,
    BellOutlined,
    BgColorsOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    LaptopOutlined,
    GlobalOutlined,
    KeyOutlined
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { profileService } from '../../services/profileService';
import './SettingsPage.css';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingsPage = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { user } = useAuth();
    const { pendingSettings, updatePendingSetting, saveSettings } = useSettings();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [securityLoading, setSecurityLoading] = useState(false);
    const [passwordForm] = Form.useForm();

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await saveSettings();
            if (res.success) {
                message.success({ 
                    content: t('common.saveSuccess') || 'Cập nhật cài đặt thành công', 
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> 
                });
            } else {
                message.error(res.message || 'Lỗi khi lưu cài đặt');
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi hệ thống');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values) => {
        setSecurityLoading(true);
        try {
            const res = await profileService.changePassword(values);
            if (res.success) {
                message.success({ 
                    content: t('settings.password.success') || 'Đổi mật khẩu thành công', 
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> 
                });
                passwordForm.resetFields();
            } else {
                message.error(res.message || 'Lỗi khi đổi mật khẩu');
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi khi kết nối máy chủ');
        } finally {
            setSecurityLoading(false);
        }
    };

    const tabs = [
        { id: 'general', icon: <GlobalOutlined />, label: t('settings.general') },
        { id: 'appearance', icon: <BgColorsOutlined />, label: t('settings.appearance') },
        { id: 'notifications', icon: <BellOutlined />, label: t('settings.notifications') },
        { id: 'security', icon: <LockOutlined />, label: t('settings.security') },
    ];

    const SettingRow = ({ title, description, control, isLast }) => (
        <div className={`settings-row ${isLast ? 'last' : ''}`}>
            <div className="settings-row-info">
                <Text className="settings-row-title">{title}</Text>
                <Text className="settings-row-desc">{description}</Text>
            </div>
            <div className="settings-row-control">
                {control}
            </div>
        </div>
    );

    const SaveFooter = () => (
        <div className="settings-footer" style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <Button type="primary" className="premium-btn" loading={loading} onClick={handleSave} size="large" style={{ padding: '0 40px' }}>
                {t('common.save')}
            </Button>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="settings-pane animate-fade-in-up">
                        <div className="settings-pane-header">
                            <Title level={3} className="settings-pane-title">{t('settings.general.title')}</Title>
                            <Text className="settings-pane-subtitle">{t('settings.general.subtitle')}</Text>
                        </div>

                        <div className="settings-section">
                            <h4 className="settings-section-title">{t('settings.system.title')}</h4>
                            <div className="settings-card">
                                <SettingRow
                                    title={t('settings.language')}
                                    description={t('settings.language.desc')}
                                    control={
                                        <Select value={pendingSettings.language} onChange={(v) => updatePendingSetting('language', v)} style={{ width: 160 }} size="large">
                                            <Option value="en"><GlobalOutlined /> English (US)</Option>
                                            <Option value="vi"><GlobalOutlined /> Tiếng Việt</Option>
                                        </Select>
                                    }
                                />
                                <SettingRow
                                    title={t('settings.timezone')}
                                    description={t('settings.timezone.desc')}
                                    isLast={true}
                                    control={
                                        <Select value={pendingSettings.timezone} onChange={(v) => updatePendingSetting('timezone', v)} style={{ width: 160 }} size="large">
                                            <Option value="gmt7">GMT+07:00</Option>
                                            <Option value="gmt0">GMT+00:00</Option>
                                        </Select>
                                    }
                                />
                            </div>
                        </div>
                        <SaveFooter />
                    </div>
                );
            case 'appearance':
                return (
                    <div className="settings-pane animate-fade-in-up">
                        <div className="settings-pane-header">
                            <Title level={3} className="settings-pane-title">{t('settings.appearance.title')}</Title>
                            <Text className="settings-pane-subtitle">{t('settings.appearance.subtitle')}</Text>
                        </div>

                        <div className="settings-section">
                            <h4 className="settings-section-title">{t('settings.appearance.title')}</h4>
                            <div className="settings-card">
                                <SettingRow
                                    title={t('settings.darkMode')}
                                    description={t('settings.darkMode.desc')}
                                    control={<Switch checked={isDarkMode} onChange={toggleTheme} className="premium-switch" />}
                                />
                                <SettingRow
                                    title={t('settings.compactMode')}
                                    description={t('settings.compactMode.desc')}
                                    isLast={true}
                                    control={<Switch checked={pendingSettings.compactMode} onChange={(v) => updatePendingSetting('compactMode', v)} className="premium-switch" />}
                                />
                            </div>
                        </div>
                        <SaveFooter />
                    </div>
                );
            case 'notifications':
                return (
                    <div className="settings-pane animate-fade-in-up">
                        <div className="settings-pane-header">
                            <Title level={3} className="settings-pane-title">{t('settings.notifications.title')}</Title>
                            <Text className="settings-pane-subtitle">{t('settings.notifications.subtitle')}</Text>
                        </div>

                        <div className="settings-section">
                            <h4 className="settings-section-title">{t('settings.communication.title')}</h4>
                            <div className="settings-card">
                                <SettingRow
                                    title={t('settings.emailNotifications')}
                                    description={t('settings.emailNotifications.desc')}
                                    control={<Switch checked={pendingSettings.notifications?.email} onChange={(v) => updatePendingSetting('notifications.email', v)} className="premium-switch" />}
                                />
                                <SettingRow
                                    title={t('settings.pushNotifications')}
                                    description={t('settings.pushNotifications.desc')}
                                    control={<Switch checked={pendingSettings.notifications?.push} onChange={(v) => updatePendingSetting('notifications.push', v)} className="premium-switch" />}
                                />
                                <SettingRow
                                    title={t('settings.weeklyReport')}
                                    description={t('settings.weeklyReport.desc')}
                                    isLast={true}
                                    control={<Switch checked={pendingSettings.notifications?.weeklyReport} onChange={(v) => updatePendingSetting('notifications.weeklyReport', v)} className="premium-switch" />}
                                />
                            </div>
                        </div>
                        <SaveFooter />
                    </div>
                );
            case 'security':
                return (
                    <div className="settings-pane animate-fade-in-up">
                        <div className="settings-pane-header">
                            <Title level={3} className="settings-pane-title">{t('settings.security.title')}</Title>
                            <Text className="settings-pane-subtitle">{t('settings.security.subtitle')}</Text>
                        </div>

                        <div className="settings-section">
                            <h4 className="settings-section-title">{t('settings.auth.title')}</h4>
                            <div className="settings-card">
                                <SettingRow
                                    title={t('settings.2fa')}
                                    description={t('settings.2fa.desc')}
                                    control={
                                        <Switch
                                            checked={pendingSettings.twoFactorEnabled}
                                            onChange={(v) => updatePendingSetting('twoFactorEnabled', v)}
                                            className="premium-switch"
                                            checkedChildren={t('common.on') || "On"}
                                            unCheckedChildren={t('common.off') || "Off"}
                                        />
                                    }
                                />
                                <SettingRow
                                    title={t('settings.sessions.title')}
                                    description={t('settings.sessions.desc')}
                                    isLast={true}
                                    control={<Button className="premium-btn-outline" onClick={() => message.info(t('settings.sessions.none'))}>{t('settings.sessions.view')}</Button>}
                                />
                            </div>
                        </div>

                        <div className="settings-section" style={{ marginTop: '24px' }}>
                            <h4 className="settings-section-title">{t('settings.password.title')}</h4>
                            <div className="settings-card" style={{ padding: '24px' }}>
                                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                                    <Form.Item 
                                        label={t('settings.password.current')} 
                                        name="currentPassword"
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                                    >
                                        <Input.Password size="large" prefix={<KeyOutlined style={{ opacity: 0.45 }} />} />
                                    </Form.Item>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                label={t('settings.password.new')} 
                                                name="newPassword"
                                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 8, message: 'Tối thiểu 8 ký tự' }]}
                                            >
                                                <Input.Password size="large" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                label={t('profile.confirmPassword')} 
                                                name="confirmPassword"
                                                dependencies={['newPassword']}
                                                rules={[
                                                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (!value || getFieldValue('newPassword') === value) {
                                                                return Promise.resolve();
                                                            }
                                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                                        },
                                                    }),
                                                ]}
                                            >
                                                <Input.Password size="large" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Button
                                        type="primary"
                                        className="premium-btn"
                                        size="large"
                                        htmlType="submit"
                                        loading={securityLoading}
                                        icon={<SafetyCertificateOutlined />}
                                    >
                                        {t('settings.password.update')}
                                    </Button>
                                </Form>
                            </div>
                        </div>
                        <SaveFooter />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="settings-page-wrapper">
            <div className="settings-container glass-panel">
                <div className="settings-sidebar">
                    <div className="settings-sidebar-header">
                        <Title level={4} style={{ margin: 0, color: 'var(--text-color)' }}>{t('settings.title')}</Title>
                    </div>
                    <ul className="settings-nav">
                        {tabs.map(tab => (
                            <li
                                key={tab.id}
                                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="settings-nav-icon">{tab.icon}</span>
                                <span className="settings-nav-label">{tab.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="settings-content-area">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
