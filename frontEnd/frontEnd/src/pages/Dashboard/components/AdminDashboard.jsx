import React from 'react';
import { Row, Col, Card, Typography, Divider, Table, Tag, Empty } from 'antd';
import {
    UserOutlined,
    SolutionOutlined,
    BookOutlined,
    AppstoreOutlined,
    ReadOutlined,
    ScheduleOutlined,
} from '@ant-design/icons';
import StatCard from '../../../components/common/StatCard/StatCard';
import PieChartCard from '../../../components/common/Charts/PieChartCard';
import BarChartCard from '../../../components/common/Charts/BarChartCard';

const { Title, Text } = Typography;

const AdminDashboard = ({ data, loading }) => {
    // Cột bảng phân bổ sinh viên theo lớp
    const classCols = [
        { title: 'Lớp hành chính', dataIndex: 'name', key: 'name' },
        {
            title: 'Số sinh viên', dataIndex: 'value', key: 'value',
            render: v => <Tag color="blue">{v} SV</Tag>,
            sorter: (a, b) => b.value - a.value,
        }
    ];

    return (
        <div className="admin-dashboard animate-fade-in">
            {/* --- STAT CARDS --- */}
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} xl={8}>
                    <StatCard
                        title="Sinh viên đang học"
                        value={data?.metrics?.totalStudents ?? 0}
                        icon={<UserOutlined />}
                        color="#1890ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} xl={8}>
                    <StatCard
                        title="Giảng viên đang hoạt động"
                        value={data?.metrics?.totalTeachers ?? 0}
                        icon={<SolutionOutlined />}
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} xl={8}>
                    <StatCard
                        title="Lớp học phần đang mở"
                        value={data?.metrics?.totalClassSections ?? 0}
                        icon={<ScheduleOutlined />}
                        color="#722ed1"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} xl={8}>
                    <StatCard
                        title="Môn học"
                        value={data?.metrics?.totalSubjects ?? 0}
                        icon={<BookOutlined />}
                        color="#faad14"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} xl={8}>
                    <StatCard
                        title="Học kỳ"
                        value={data?.metrics?.totalTerms ?? 0}
                        icon={<ReadOutlined />}
                        color="#13c2c2"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} xl={8}>
                    {/* Tỷ lệ lớp học phần đang hoạt động */}
                    <StatCard
                        title="Lớp HP còn trống chỗ"
                        value={
                            data?.classSectionStatusDist?.find(d => d.name === 'Active')?.value ?? 0
                        }
                        icon={<AppstoreOutlined />}
                        color="#eb2f96"
                        loading={loading}
                    />
                </Col>
            </Row>

            {/* --- CHARTS ROW --- */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                {/* Biểu đồ lớp học phần theo học kỳ */}
                <Col xs={24} xl={16}>
                    <Card variant="borderless" className="glass-panel chart-card-wrapper">
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>Số lớp học phần mở theo học kỳ</Title>
                            <Text type="secondary">Tổng số lớp được mở tại mỗi học kỳ trong hệ thống</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        {(data?.classSectionsByTerm || []).length === 0 && !loading ? (
                            <Empty description="Chưa có dữ liệu học kỳ" />
                        ) : (
                            <BarChartCard
                                data={data?.classSectionsByTerm || []}
                                dataKeyX="term"
                                dataKeyY="count"
                                barColor="#1890ff"
                                loading={loading}
                                height={320}
                                yAxisName="Số lượng lớp"
                            />
                        )}
                    </Card>
                </Col>

                {/* Biểu đồ trạng thái lớp học phần */}
                <Col xs={24} xl={8}>
                    <Card variant="borderless" className="glass-panel" style={{ height: '100%' }}>
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>Trạng thái lớp học phần</Title>
                            <Text type="secondary">Phân bổ Active / Completed / Cancelled</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        {(data?.classSectionStatusDist || []).length === 0 && !loading ? (
                            <Empty description="Chưa có dữ liệu" />
                        ) : (
                            <PieChartCard
                                data={data?.classSectionStatusDist || []}
                                loading={loading}
                                height={280}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* --- BẢNG PHÂN BỔ SINH VIÊN THEO LỚP HÀNH CHÍNH --- */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <Card variant="borderless" className="glass-panel">
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>Top 10 lớp hành chính nhiều sinh viên nhất</Title>
                            <Text type="secondary">Giúp phát hiện lớp đang quá tải hoặc thiếu sinh viên</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        <Table
                            loading={loading}
                            dataSource={(data?.studentsByClass || []).map((r, i) => ({ ...r, key: i }))}
                            columns={classCols}
                            pagination={false}
                            size="small"
                            locale={{ emptyText: 'Chưa có dữ liệu lớp hành chính' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
