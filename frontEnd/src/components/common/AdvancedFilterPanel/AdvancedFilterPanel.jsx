import React from 'react';
import { Collapse, Button } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from '../../../hooks/useTranslation';

const { Panel } = Collapse;

const AdvancedFilterPanel = ({ onReset, children, ...props }) => {
    const { t } = useTranslation();
    return (
        <Collapse
            bordered={false}
            style={{ marginBottom: 24, borderRadius: '16px', background: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
            expandIcon={({ isActive }) => <FilterOutlined rotate={isActive ? 90 : 0} style={{ color: '#1890ff' }} />}
            items={[{
                key: '1',
                label: <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{t('common.advancedFilters')}</span>,
                extra: (
                    <Button
                        type="link"
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onReset) onReset();
                        }}
                    >
                        {t('common.resetAll')}
                    </Button>
                ),
                children: <div style={{ padding: '8px 0' }}>{children}</div>
            }]}
            {...props}
        />
    );
};

export default AdvancedFilterPanel;
