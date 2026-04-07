import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content, Footer } = Layout;

const AppLayout = () => {
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

    return (
        <Layout style={{ minHeight: '100vh', width: '100%' }}>
            <Sidebar collapsed={collapsed} mobileConfig={mobileConfig} />

            <Layout style={{
                marginLeft: collapsed ? (mobileConfig ? 0 : 80) : 200,
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                width: `calc(100% - ${collapsed ? (mobileConfig ? 0 : 80) : 200}px)`
            }}>
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    mobileConfig={mobileConfig}
                />

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        background: '#fff',
                        borderRadius: '8px',
                        flex: 1,
                        overflowX: 'hidden'
                    }}
                >
                    <Outlet />
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    My First React App ©{new Date().getFullYear()} Created with Ant Design
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
