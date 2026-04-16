import React from 'react';
import { Row, Col, Card, Typography, Divider, Table, Tag, Progress, Alert, Empty } from 'antd';
import { 
    BookOutlined, 
    TeamOutlined, 
    BarChartOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import StatCard from '../../../components/common/StatCard/StatCard';
import PieChartCard from '../../../components/common/Charts/PieChartCard';
import BarChartCard from '../../../components/common/Charts/BarChartCard';

const { Title, Text } = Typography;

const TeacherDashboard = ({ data, loading }) => {
    // Nếu chưa có profile giảng viên thì thông báo
    if (!loading && data?.noProfile) {
        return (
            <Alert
                type="warning"
                showIcon
                message="Tài khoản chưa liên kết hồ sơ giảng viên"
                description="Vui lòng liên hệ quản trị viên để liên kết tài khoản với hồ sơ giảng viên trong hệ thống."
                style={{ margin: '24px 0' }}
            />
        );
    }

    // Cột bảng danh sách lớp học phần
    const classCols = [
        { title: 'Mã lớp HP', dataIndex: 'code', key: 'code', render: v => <Tag color="purple">{v}</Tag> },
        { title: 'Môn học', dataIndex: 'subjectName', key: 'subjectName' },
        { title: 'Học kỳ', dataIndex: 'termCode', key: 'termCode' },
        { 
            title: 'Sĩ số', 
            key: 'enrolled',
            render: (_, r) => `${r.enrolledCount} / ${r.maxStudents}` 
        },
        {
            title: 'Trạng thái', dataIndex: 'status', key: 'status',
            render: s => (
                <Tag color={s === 'Active' ? 'green' : s === 'Completed' ? 'blue' : 'red'}>{s}</Tag>
            )
        },
        {
            title: 'Hình thức', dataIndex: 'teachingMethod', key: 'teachingMethod',
            render: v => <Tag color="cyan">{v}</Tag>
        },
    ];

    // Cột bảng hiệu suất từng lớp
    const perfCols = [
        { title: 'Lớp HP', dataIndex: 'classCode', key: 'classCode', render: v => <Tag color="purple">{v}</Tag> },
        { title: 'Môn học', dataIndex: 'subjectName', key: 'subjectName' },
        { title: 'Học kỳ', dataIndex: 'termCode', key: 'termCode' },
        { title: 'Số SV đã nhập điểm', dataIndex: 'gradedCount', key: 'gradedCount' },
        { 
            title: 'Điểm trung bình', dataIndex: 'avgScore', key: 'avgScore',
            render: v => (
                <span style={{ fontWeight: 700, color: v >= 7 ? '#52c41a' : v >= 5 ? '#faad14' : '#ff4d4f' }}>
                    {v === 0 ? 'Chưa có' : v.toFixed(2)}
                </span>
            ),
            sorter: (a, b) => a.avgScore - b.avgScore,
        },
        {
            title: 'Tiến độ nhập điểm', key: 'progress',
            render: (_, r) => {
                const pct = r.enrolledCount > 0 ? Math.round((r.gradedCount / r.enrolledCount) * 100) : 0;
                return <Progress percent={pct} size="small" strokeColor={pct >= 80 ? '#52c41a' : '#faad14'} />;
            }
        }
    ];

    return (
        <div className="teacher-dashboard animate-fade-in">
            {/* --- STAT CARDS --- */}
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={8}>
                    <StatCard
                        title="Lớp HP đang phụ trách"
                        value={data?.metrics?.totalClasses ?? 0}
                        icon={<BookOutlined />}
                        color="#722ed1"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={8}>
                    <StatCard
                        title="Tổng sinh viên đang theo học"
                        value={data?.metrics?.totalStudents ?? 0}
                        icon={<TeamOutlined />}
                        color="#1890ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={8}>
                    <StatCard
                        title="Điểm TB chung (Hệ 10)"
                        value={data?.metrics?.avgGrade ?? 0}
                        precision={2}
                        icon={<BarChartOutlined />}
                        color={data?.metrics?.avgGrade >= 7 ? '#52c41a' : data?.metrics?.avgGrade >= 5 ? '#faad14' : '#ff4d4f'}
                        loading={loading}
                    />
                </Col>
            </Row>

            {/* --- CHARTS ROW --- */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                <Col xs={24} xl={16}>
                    <Card variant="borderless" className="glass-panel chart-card-wrapper">
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>Điểm trung bình từng lớp phụ trách</Title>
                            <Text type="secondary">So sánh điểm trung bình giữa các lớp học phần bạn đang dạy</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        {(data?.performanceByClass || []).length === 0 && !loading ? (
                            <Empty description="Chưa có dữ liệu điểm cho các lớp này" />
                        ) : (
                            <BarChartCard
                                data={(data?.performanceByClass || []).map(c => ({
                                    semester: c.classCode,
                                    avgScore: c.avgScore,
                                }))}
                                dataKeyX="semester"
                                dataKeyY="avgScore"
                                barColor="#722ed1"
                                loading={loading}
                                height={300}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} xl={8}>
                    <Card variant="borderless" className="glass-panel" style={{ height: '100%' }}>
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>Phổ điểm chữ (Toàn bộ lớp)</Title>
                            <Text type="secondary">Tổng hợp tất cả sinh viên trong các lớp bạn dạy</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        {(data?.gradeDistribution || []).length === 0 && !loading ? (
                            <Empty description="Chưa có dữ liệu điểm" />
                        ) : (
                            <PieChartCard
                                data={data?.gradeDistribution || []}
                                loading={loading}
                                height={260}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* --- BẢNG TIẾN ĐỘ NHẬP ĐIỂM TỪNG LỚP --- */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <Card variant="borderless" className="glass-panel">
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>Tiến độ nhập điểm từng lớp học phần</Title>
                            <Text type="secondary">Bạn đã nhập điểm cho bao nhiêu sinh viên trong mỗi lớp?</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        <Table
                            loading={loading}
                            dataSource={(data?.performanceByClass || []).map((r, i) => ({ ...r, key: i }))}
                            columns={perfCols}
                            pagination={{ pageSize: 5 }}
                            size="middle"
                            locale={{ emptyText: 'Chưa có lớp nào được phân công' }}
                            scroll={{ x: true }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* --- BẢNG DANH SÁCH LỚP HP --- */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <Card variant="borderless" className="glass-panel">
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>
                                <CheckCircleOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                                Danh sách lớp học phần đang phụ trách
                            </Title>
                            <Text type="secondary">Tất cả lớp học phần được giao cho bạn trong hệ thống</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        <Table
                            loading={loading}
                            dataSource={(data?.classSections || []).map((r, i) => ({ ...r, key: i }))}
                            columns={classCols}
                            pagination={{ pageSize: 8 }}
                            size="middle"
                            locale={{ emptyText: 'Chưa có lớp học phần nào được phân công' }}
                            scroll={{ x: true }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TeacherDashboard;
