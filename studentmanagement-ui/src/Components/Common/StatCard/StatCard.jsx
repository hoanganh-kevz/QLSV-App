import { Card, Statistic } from 'antd';

const StatCard = ({ title, value, icon, color, suffix, prefix }) => {
    return (
        <Card
            bordered={false}
            style={{
                borderLeft: `4px solid ${color}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
        >
            <Statistic
                title={title}
                value={value}
                prefix={icon}
                suffix={suffix}
                valueStyle={{ color: color, fontSize: '24px', fontWeight: 'bold' }}
            />
        </Card>
    );
};

export default StatCard;