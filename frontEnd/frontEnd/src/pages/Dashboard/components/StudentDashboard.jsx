import React from 'react';
import { Row, Col, Card, Typography, Divider, Table, Tag, Progress, Alert, Empty } from 'antd';
import { 
    TrophyOutlined, 
    CheckCircleOutlined, 
    BookOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import StatCard from '../../../components/common/StatCard/StatCard';
import BarChartCard from '../../../components/common/Charts/BarChartCard';

const { Title, Text } = Typography;

// Tính màu và nhãn dựa vào GPA 4.0
const getGpaInfo = (gpa) => {
    if (gpa >= 3.6) return { color: '#52c41a', label: 'Xuất sắc' };
    if (gpa >= 3.2) return { color: '#1890ff', label: 'Giỏi' };
    if (gpa >= 2.5) return { color: '#13c2c2', label: 'Khá' };
    if (gpa >= 2.0) return { color: '#faad14', label: 'Trung bình' };
    if (gpa >= 1.0) return { color: '#ff7a45', label: 'Yếu' };
    return { color: '#ff4d4f', label: 'Kém' };
};

const StudentDashboard = ({ data, loading }) => {
    // Nếu chưa có profile sinh viên
    if (!loading && data?.noProfile) {
        return (
            <Alert
                type="warning"
                showIcon
                message="Tài khoản chưa liên kết hồ sơ sinh viên"
                description="Vui lòng liên hệ quản trị viên để liên kết tài khoản với hồ sơ sinh viên trong hệ thống."
                style={{ margin: '24px 0' }}
            />
        );
    }

    const avgGpa = data?.metrics?.avgGpa ?? 0;
    const gpaPercent = Math.round((avgGpa / 4) * 100);
    const gpaInfo = getGpaInfo(avgGpa);

    // Cột bảng chi tiết điểm từng môn
    const gradeCols = [
        { title: 'Mã môn', dataIndex: 'subjectCode', key: 'subjectCode', render: v => <Tag>{v}</Tag> },
        { title: 'Tên môn học', dataIndex: 'subjectName', key: 'subjectName' },
        { title: 'Học kỳ', dataIndex: 'semester', key: 'semester' },
        { title: 'Tín chỉ', dataIndex: 'credits', key: 'credits', align: 'center' },
        { 
            title: 'Điểm tổng kết (10)', dataIndex: 'totalScore', key: 'totalScore',
            align: 'center',
            render: v => v != null
                ? <span style={{ fontWeight: 700, color: v >= 7 ? '#52c41a' : v >= 5 ? '#faad14' : '#ff4d4f' }}>{v.toFixed(1)}</span>
                : <Text type="secondary">—</Text>
        },
        { 
            title: 'GPA (4.0)', dataIndex: 'gpa4', key: 'gpa4',
            align: 'center',
            render: v => v != null ? v.toFixed(1) : <Text type="secondary">—</Text>
        },
        { 
            title: 'Xếp loại', dataIndex: 'letterGrade', key: 'letterGrade',
            align: 'center',
            render: v => {
                if (!v) return <Text type="secondary">—</Text>;
                const c = v === 'A+' || v === 'A' ? 'green' : v.startsWith('B') ? 'blue' : v.startsWith('C') ? 'orange' : v.startsWith('D') ? 'gold' : 'red';
                return <Tag color={c}>{v}</Tag>;
            }
        },
    ];

    const hasGrades = (data?.gradeDetails || []).length > 0;

    return (
        <div className="student-dashboard animate-fade-in">
            {/* Thông tin sinh viên */}
            {data?.studentInfo && (
                <Card variant="borderless" className="glass-panel" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #13c2c2 0%, #1890ff 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        <div>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Sinh viên</Text>
                            <Title level={3} style={{ color: '#fff', margin: 0 }}>{data.studentInfo.fullName}</Title>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: 24 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>MSSV</Text>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{data.studentInfo.mssv}</div>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: 24 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Lớp hành chính</Text>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{data.studentInfo.className}</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* --- STAT CARDS --- */}
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} xl={6}>
                    <StatCard
                        title="GPA tích lũy (Hệ 4.0)"
                        value={avgGpa}
                        precision={2}
                        icon={<TrophyOutlined />}
                        color={gpaInfo.color}
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <StatCard
                        title="Tổng tín chỉ tích lũy"
                        value={data?.metrics?.totalCredits ?? 0}
                        icon={<CheckCircleOutlined />}
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <StatCard
                        title="Môn đã qua"
                        value={data?.metrics?.passedCourses ?? 0}
                        icon={<BookOutlined />}
                        color="#1890ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <StatCard
                        title="Môn rớt / chưa đủ điều kiện"
                        value={data?.metrics?.failedCourses ?? 0}
                        icon={<CloseCircleOutlined />}
                        color="#ff4d4f"
                        loading={loading}
                    />
                </Col>
            </Row>

            {/* --- CHART + GPA METER --- */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                <Col xs={24} xl={16}>
                    <Card variant="borderless" className="glass-panel chart-card-wrapper" style={{ height: '100%' }}>
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>GPA từng học kỳ</Title>
                            <Text type="secondary">Biến động GPA (hệ 4.0) qua từng kỳ học đã hoàn thành</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        {(data?.performanceData || []).length === 0 && !loading ? (
                            <Empty description="Chưa có dữ liệu điểm để phân tích" />
                        ) : (
                            <BarChartCard
                                data={(data?.performanceData || []).map(p => ({
                                    semester: p.semester,
                                    avgScore: p.avgGpa,
                                }))}
                                dataKeyX="semester"
                                dataKeyY="avgScore"
                                barColor="#13c2c2"
                                loading={loading}
                                height={320}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} xl={8}>
                    <Card variant="borderless" className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>Thước đo GPA</Title>
                            <Text type="secondary">Vị trí học lực hiện tại của bạn</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <Progress
                                type="dashboard"
                                percent={gpaPercent}
                                format={() => (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: gpaInfo.color }}>{avgGpa.toFixed(2)}</div>
                                        <div style={{ fontSize: 11, color: '#999' }}>/ 4.00</div>
                                    </div>
                                )}
                                size={160}
                                strokeColor={gpaInfo.color}
                                strokeWidth={10}
                            />
                            <Tag color={gpaInfo.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                                {gpaInfo.label}
                            </Tag>
                            <div style={{ width: '100%', marginTop: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text type="secondary">Mục tiêu Giỏi</Text>
                                    <Text strong>GPA ≥ 3.20</Text>
                                </div>
                                <Progress 
                                    percent={Math.min(100, Math.round((avgGpa / 3.2) * 100))}
                                    showInfo={false}
                                    strokeColor={avgGpa >= 3.2 ? '#52c41a' : '#faad14'}
                                />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* --- BẢNG CHI TIẾT ĐIỂM TỪNG MÔN --- */}
            <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <Card variant="borderless" className="glass-panel">
                        <div className="card-header">
                            <Title level={4} style={{ margin: 0 }}>Bảng điểm chi tiết</Title>
                            <Text type="secondary">Điểm tổng kết từng môn học của bạn</Text>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        {!hasGrades && !loading ? (
                            <Empty description="Sinh viên này chưa có điểm số nào trong hệ thống" />
                        ) : (
                            <Table
                                loading={loading}
                                dataSource={(data?.gradeDetails || []).map((r, i) => ({ ...r, key: i }))}
                                columns={gradeCols}
                                pagination={{ pageSize: 10 }}
                                size="middle"
                                scroll={{ x: true }}
                                summary={pageData => {
                                    if (pageData.length === 0) return null;
                                    return (
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={3}><Text strong>Tổng / Trung bình</Text></Table.Summary.Cell>
                                            <Table.Summary.Cell index={3} align="center">
                                                <Text strong>{data?.metrics?.totalCredits ?? 0}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={4} align="center">—</Table.Summary.Cell>
                                            <Table.Summary.Cell index={5} align="center">
                                                <Text strong style={{ color: gpaInfo.color }}>{avgGpa.toFixed(2)}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={6} align="center">
                                                <Tag color={gpaInfo.color}>{gpaInfo.label}</Tag>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    );
                                }}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StudentDashboard;
