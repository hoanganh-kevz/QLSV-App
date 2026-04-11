import React from 'react';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../../../hooks/useTranslation';

const BarChartCard = ({ title, data, dataKeyX, dataKeyY, barColor = '#1890ff', loading, yAxisName }) => {
    const { t } = useTranslation();
    return (
        <Card
            title={title}
            variant="borderless"
            loading={loading}
            style={{ height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}
        >
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey={dataKeyX} />
                        <YAxis />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar name={yAxisName || t('dashboard.avgScore')} dataKey={dataKeyY} fill={barColor} radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BarChartCard;
