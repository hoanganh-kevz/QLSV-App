import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Tag, Button, Modal, Form, Rate, Input, Space, message, Spin, Empty, List, Avatar, Tooltip, Badge } from 'antd';
import { LikeOutlined, FormOutlined, CheckCircleOutlined, UserOutlined, ClockCircleOutlined, InfoCircleOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import teacherEvaluationService from '../../services/teacherEvaluationService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TeacherEvaluationPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const evalRes = await teacherEvaluationService.getMyEvaluations();
            
            if (user.role === 'student') {
                // Use the new UIFIED logic endpoint (Cohort + Manual)
                const eligibleRes = await teacherEvaluationService.getEligibleClasses();
                if (eligibleRes.success) setClasses(eligibleRes.data);
            }
            
            if (evalRes.success) setEvaluations(evalRes.data);
        } catch (error) {
            console.error('Fetch error:', error);
            message.error('Không thể tải dữ liệu đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        if (!selectedClass?._id) return;
        
        try {
            setSubmitting(true);
            const res = await teacherEvaluationService.submitEvaluation({
                classSectionId: selectedClass._id,
                ratings: values.ratings,
                comment: values.comment
            });
            
            if (res.success) {
                message.success('Cảm ơn bạn đã đóng góp ý kiến');
                setIsModalOpen(false);
                form.resetFields();
                fetchData();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Completed': return { color: 'success', text: 'Đã hoàn thành' };
            case 'Active': return { color: 'processing', text: 'Đang mở' };
            case 'Upcoming': return { color: 'default', text: 'Chưa diễn ra' };
            case 'Cancelled': return { color: 'error', text: 'Đã hủy' };
            default: return { color: 'default', text: status || 'Đang mở' };
        }
    };

    const evaluationCriteria = [
        { label: 'Tác phong sư phạm, sự nhiệt tình của giảng viên', name: 'professionalism' },
        { label: 'Nội dung bài giảng và tài liệu học tập', name: 'content' },
        { label: 'Sự hỗ trợ và tương tác với sinh viên', name: 'support' },
        { label: 'Công bằng trong kiểm tra, đánh giá', name: 'fairness' },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 32 }}>
                <Title level={2} className="premium-title">Đánh giá Giảng viên</Title>
                <Text className="premium-subtitle">Góp ý xây dựng môi trường học tập chất lượng hơn</Text>
            </div>

            {user.role === 'student' && (
                <div style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Title level={4} style={{ margin: 0 }}>
                            <FormOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                            Các học phần trong học kỳ
                        </Title>
                        <Tooltip title="Chỉ những học phần trạng thái 'Đã hoàn thành' mới có thể thực hiện đánh giá">
                            <InfoCircleOutlined style={{ color: 'var(--primary-color)', cursor: 'help' }} />
                        </Tooltip>
                    </div>
                    
                    <Card variant="borderless" className="glass-panel" style={{ borderRadius: 16 }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Spin size="large" />
                            </div>
                        ) : classes.length === 0 ? (
                            <Empty description="Bạn chưa được phân bổ vào lớp học phần nào trong học kỳ này" />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {classes.map((item) => {
                                    const statusCfg = getStatusConfig(item.status);
                                    const canEvaluate = (item.status === 'Completed' || item.status === 'Active') && !item.isEvaluated;
                                    
                                    return (
                                        <div
                                            key={item._id}
                                            className={item.isEvaluated ? 'evaluated-item' : ''}
                                            style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                padding: '16px', 
                                                borderBottom: '1px solid var(--border-color)',
                                                gap: '16px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                                <Badge dot={canEvaluate} offset={[-2, 38]} status="processing">
                                                    <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: 'var(--primary-color)' }} />
                                                </Badge>
                                                <div>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <Space>
                                                            <Text strong style={{ fontSize: '16px' }}>{item.subject?.name}</Text>
                                                            <Tag color={statusCfg.color} style={{ fontSize: '10px', borderRadius: 4 }}>{statusCfg.text}</Tag>
                                                        </Space>
                                                    </div>
                                                    <Space orientation="vertical" size={0}>
                                                        <Text type="secondary">Giảng viên: <Text strong>{item.teacher?.fullName || 'Chưa phân công'}</Text></Text>
                                                        <Space separator={<Text type="secondary" style={{ fontSize: '10px' }}>|</Text>}>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>Mã lớp: {item.code}</Text>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}><ClockCircleOutlined /> Tiết {item.schedule?.[0]?.startPeriod}-{item.schedule?.[0]?.endPeriod}</Text>
                                                        </Space>
                                                    </Space>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                {item.isEvaluated ? (
                                                    <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 6, padding: '4px 12px' }}>Đã đánh giá</Tag>
                                                ) : (item.status === 'Completed' || item.status === 'Active') ? (
                                                    <Button 
                                                        type="primary" 
                                                        icon={<FormOutlined />} 
                                                        onClick={() => {
                                                            setSelectedClass(item);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="premium-button"
                                                    >
                                                        Đánh giá ngay
                                                    </Button>
                                                ) : (
                                                    <Tooltip title={`Chỉ đánh giá khi môn học 'Đã hoàn thành' (Hiện tại: ${statusCfg.text})`}>
                                                        <Button 
                                                            disabled 
                                                            icon={<LockOutlined />}
                                                            style={{ borderRadius: 8 }}
                                                        >
                                                            Chưa khả dụng
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Received/History Evaluations */}
            <div>
                <Title level={4} style={{ marginBottom: 16 }}>
                    <LikeOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                    {user.role === 'teacher' ? 'Phản hồi & Đánh giá từ sinh viên' : 'Lịch sử đánh giá của bạn'}
                </Title>
                <Card variant="borderless" className="glass-panel" style={{ borderRadius: 16 }}>
                    <Table 
                        dataSource={evaluations} 
                        loading={loading}
                        rowKey="_id"
                        pagination={{ pageSize: 5, placement: 'bottomCenter' }}
                        className="premium-table"
                        columns={[
                            { 
                                title: 'Học phần', 
                                dataIndex: ['classSection', 'subject', 'name'], 
                                key: 'subject',
                                render: (name, record) => (
                                    <Space orientation="vertical" size={0}>
                                        <Text strong>{name}</Text>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>Mã: {record.classSection?.code}</Text>
                                    </Space>
                                )
                            },
                            {
                                title: user.role === 'teacher' ? 'Sinh viên' : 'Giảng viên',
                                key: 'userTarget',
                                hidden: user.role === 'admin',
                                render: (_, record) => (
                                    <Space size="middle">
                                        <Avatar 
                                            icon={<UserOutlined />} 
                                            style={{ backgroundColor: user.role === 'teacher' ? 'var(--secondary-color)' : 'var(--primary-color)' }} 
                                        />
                                        <Text>{user.role === 'teacher' ? (record.student?.fullName || '---') : (record.teacher?.fullName || '---')}</Text>
                                    </Space>
                                )
                            },
                            {
                                title: 'Sinh viên',
                                key: 'adminStudent',
                                hidden: user.role !== 'admin',
                                render: (_, record) => (
                                    <Space size="middle">
                                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#f56a00' }} />
                                        <Text>{record.student?.fullName || '---'}</Text>
                                    </Space>
                                )
                            },
                            {
                                title: 'Giảng viên',
                                key: 'adminTeacher',
                                hidden: user.role !== 'admin',
                                render: (_, record) => (
                                    <Space size="middle">
                                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#7265e6' }} />
                                        <Text>{record.teacher?.fullName || '---'}</Text>
                                    </Space>
                                )
                            },
                            { 
                                title: 'Đánh giá chi tiết', 
                                key: 'ratings',
                                width: 220,
                                render: (_, record) => {
                                    const r = record.ratings || {};
                                    const avg = ((r.professionalism || 0) + (r.content || 0) + (r.support || 0) + (r.fairness || 0)) / 4;
                                    return (
                                        <Tooltip title={
                                            <div style={{ fontSize: '12px', padding: '4px' }}>
                                                <div>Tác phong: {r.professionalism || 0}/5</div>
                                                <div>Nội dung: {r.content || 0}/5</div>
                                                <div>Tương tác: {r.support || 0}/5</div>
                                                <div>Công bằng: {r.fairness || 0}/5</div>
                                            </div>
                                        }>
                                            <Space orientation="vertical" size={0}>
                                                <Rate disabled defaultValue={avg} allowHalf style={{ fontSize: '14px' }} />
                                                <Text type="secondary" style={{ fontSize: '11px' }}>Trung bình: {avg.toFixed(1)}/5.0</Text>
                                            </Space>
                                        </Tooltip>
                                    );
                                }
                            },
                            { title: 'Nhận xét', dataIndex: 'comment', key: 'comment', ellipsis: true },
                            { title: 'Ngày gửi', dataIndex: 'createdAt', key: 'date', render: (d) => dayjs(d).format('DD/MM/YYYY') }
                        ]}
                    />
                </Card>
            </div>

            {/* Evaluation Modal */}
            <Modal
                title={
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                        <Title level={4} style={{ margin: 0 }}>Đánh giá Học phần</Title>
                        <Text type="secondary">{selectedClass?.subject?.name} — {selectedClass?.teacher?.fullName}</Text>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={600}
                centered
                className="premium-modal"
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        ratings: {
                            professionalism: 5,
                            content: 5,
                            support: 5,
                            fairness: 5
                        }
                    }}
                >
                    <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ display: 'block', marginBottom: 16 }}>Vui lòng đánh giá giảng viên trên các tiêu chí sau:</Text>
                        {evaluationCriteria.map(criterion => (
                            <Form.Item 
                                key={criterion.name}
                                name={['ratings', criterion.name]}
                                label={criterion.label}
                                rules={[{ required: true, message: 'Vui lòng đánh giá mục này' }]}
                            >
                                <Rate allowHalf style={{ color: '#fadb14' }} />
                            </Form.Item>
                        ))}
                    </div>

                    <Form.Item 
                        name="comment" 
                        label="Ý kiến đóng góp khác"
                        rules={[{ required: true, message: 'Vui lòng để lại nhận xét của bạn' }]}
                    >
                        <TextArea rows={4} placeholder="Hãy chia sẻ cảm nhận của bạn về học phần này..." showCount maxLength={500} />
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginTop: 32 }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
                            <Button type="primary" htmlType="submit" loading={submitting} icon={<CheckCircleOutlined />}>
                                Gửi đánh giá
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default TeacherEvaluationPage;
