import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

/**
 * Reusable Full Page or Component Loading Spinner
 * @param {boolean} fullScreen - Absolute center on screen
 * @param {string} tip - Text to display below spinner
 */
const LoadingSpinner = ({ fullScreen = false, tip = "Loading..." }) => {
    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 9999
            }}>
                <Spin indicator={antIcon} tip={tip} size="large" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin indicator={antIcon} tip={tip} />
        </div>
    );
};

export default LoadingSpinner;
