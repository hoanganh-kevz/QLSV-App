import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTranslation } from '../../hooks/useTranslation';

const { Content, Footer } = Layout;

const AppLayout = () => {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileConfig, setMobileConfig] = useState(false);

    // Handle responsiveness
    useEffect(() => {
        const handleResize = () => {
            setMobileConfig(window.innerWidth < 992);
            if (window.innerWidth < 992) {
                setCollapsed(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const siderWidth = mobileConfig ? 0 : (collapsed ? 80 : 240);

    return (
        <Layout style={{ minHeight: '100vh', width: '100%' }}>
            <Sidebar collapsed={collapsed} mobileConfig={mobileConfig} />

            {/* Mobile overlay backdrop */}
            {mobileConfig && !collapsed && (
                <div
                    onClick={() => setCollapsed(true)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.45)', zIndex: 99,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            <Layout style={{
                marginLeft: siderWidth,
                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                width: `calc(100% - ${siderWidth}px)`,
                background: 'var(--bg-color)'
            }}>
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    mobileConfig={mobileConfig}
                />

                <Content
                    style={{
                        margin: '24px',
                        padding: 0,
                        background: 'transparent',
                        flex: 1,
                        overflowX: 'hidden'
                    }}
                >
                    <Outlet />
                </Content>

                <Footer style={{
                    textAlign: 'center',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    padding: '16px 24px'
                }}>
                    {t('shell.footer')}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
