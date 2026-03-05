import { Card } from 'antd';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const BarChartCard = ({ title, data, dataKey, xKey = 'name', color = '#8884d8' }) => {
    return (
        <Card title={title} bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={dataKey} fill={color} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default BarChartCard;