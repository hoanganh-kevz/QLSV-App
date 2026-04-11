import React from 'react';
import { Card } from 'antd';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../../../hooks/useTranslation';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#eb2f96'];

const PieChartCard = ({ title, data, loading }) => {
    const { t } = useTranslation();

    // Translate labels if possible
    const translatedData = data?.map(item => ({
        ...item,
        name: t(`grades.${item.name}`) !== `grades.${item.name}` ? t(`grades.${item.name}`) : item.name
    }));

    return (
        <Card
            title={title}
            bordered={false}
            loading={loading}
            styles={{ body: { padding: '24px 0 0 0' } }}
            style={{ height: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}
        >
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
                    <PieChart>
                        <Pie
                            data={translatedData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {translatedData && translatedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default PieChartCard;
