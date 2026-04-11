import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';
import { useTranslation } from '../../../hooks/useTranslation';
import './StatCard.css';

const StatCard = ({ title, value, prefix, suffix, precision = 0, valueStyle, loading, icon, color }) => {
    const { t } = useTranslation();
    if (loading) {
        return (
            <Card className="stat-card glass-panel" variant="borderless">
                <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
        );
    }

    return (
        <Card className="stat-card glass-panel" variant="borderless">
            <div className="stat-card-content">
                <div className="stat-card-info">
                    <Statistic
                        title={<span className="stat-card-title">{title}</span>}
                        value={value}
                        precision={precision}
                        styles={{ content: { ...valueStyle, fontSize: '28px', fontWeight: '800' } }}
                        prefix={prefix}
                        suffix={suffix}
                    />
                </div>
                {icon && (
                    <div className="stat-card-icon-wrapper" style={{ backgroundColor: `${color}15`, color: color }}>
                        {icon}
                    </div>
                )}
            </div>

        </Card>
    );
};

export default StatCard;
