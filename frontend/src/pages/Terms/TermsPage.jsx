import React, { useState, useEffect, useMemo } from 'react';
import { Space, Button, Card, Row, Col, Typography, Tag, Statistic, Form, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined, BookOutlined, CheckCircleOutlined, CalendarOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';

import DataTable from '../../components/common/DataTable/DataTable';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import { showConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { showSuccess } from '../../components/common/SuccessMessage/SuccessMessage';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import FormModal from '../../components/common/FormModal/FormModal';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';

import { termService } from '../../services/termService';
import { exportService } from '../../services/exportService';
import ProtectedButton from '../../components/common/Authorization/ProtectedButton';
import { useTranslation } from '../../hooks/useTranslation';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const createSchema = () => yup.object().shape({
    code: yup.string().required('Mã học kỳ là bắt buộc').matches(/^[A-Z0-9-]+$/, 'Mã không chứa khoảng trắng (VD: HK1-2024)'),
    name: yup.string().required('Tên học kỳ là bắt buộc'),
    dates: yup.array().of(yup.date()).min(2, 'Vui lòng chọn ngày bắt đầu và kết thúc').required('Thời gian là bắt buộc'),
    status: yup.string().required('Trạng thái là bắt buộc'),
});

const TermFormModal = ({ open, initialData, onCancel, onSubmit }) => {
    const isEdit = !!initialData;
    const schema = createSchema();
    
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            code: '', name: '', dates: null, status: 'Upcoming'
        }
    });

    useEffect(() => {
        if (open) {
            if (isEdit && initialData) {
                reset({
                    code: initialData.code,
                    name: initialData.name,
                    dates: [dayjs(initialData.startDate), dayjs(initialData.endDate)],
                    status: initialData.status
                });
            } else {
                reset({
                    code: '', name: '', dates: null, status: 'Upcoming'
                });
            }
        }
    }, [open, isEdit, initialData, reset]);

    const onFormSubmit = (data) => {
        const payload = {
            ...data,
            startDate: data.dates[0].toISOString(),
            endDate: data.dates[1].toISOString(),
        };
        delete payload.dates;
        onSubmit(payload);
    };

    return (
        <FormModal
            title={isEdit ? 'Chỉnh sửa Học kỳ' : 'Thêm Học kỳ/Năm học Mới'}
            open={open}
            onCancel={onCancel}
            onSubmit={handleSubmit(onFormSubmit)}
            width={600}
        >
            <Form layout="vertical">
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item label="Mã Học kỳ" required validateStatus={errors.code ? 'error' : ''} help={<ErrorMessage error={errors.code?.message} />}>
                            <Controller name="code" control={control} render={({ field }) => <Input {...field} placeholder="VD: HK1-2024" style={{ textTransform: 'uppercase' }} disabled={isEdit} />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Tên Học kỳ" required validateStatus={errors.name ? 'error' : ''} help={<ErrorMessage error={errors.name?.message} />}>
                            <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="VD: Học kỳ 1 Năm học 2024-2025" />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item label="Thời gian thực hiện" required validateStatus={errors.dates ? 'error' : ''} help={<ErrorMessage error={errors.dates?.message} />}>
                            <Controller name="dates" control={control} render={({ field }) => (
                                <RangePicker {...field} style={{ width: '100%' }} format="DD/MM/YYYY" />
                            )} />
                        </Form.Item>
                    </Col>
                    <Col xs={24}>
                        <Form.Item label="Trạng thái" required validateStatus={errors.status ? 'error' : ''} help={<ErrorMessage error={errors.status?.message} />}>
                            <Controller name="status" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <Option value="Upcoming">Sắp tới (Upcoming)</Option>
                                    <Option value="Active">Đang diễn ra (Active)</Option>
                                    <Option value="Locked">Đã khóa điểm (Locked)</Option>
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </FormModal>
    );
};

const TermsPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allTerms, setAllTerms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState(null);

    const loadData = async () => {
        setLoading(true);
        const res = await termService.getAllTerms();
        if (res.success) {
            setAllTerms(res.data);
            setData(res.data);
        } else {
            showError(res.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            const filteredData = allTerms.filter(t =>
                (t.name && t.name.toLowerCase().includes(lowerTerm)) ||
                (t.code && t.code.toLowerCase().includes(lowerTerm))
            );
            setData(filteredData);
        } else {
            setData(allTerms);
        }
    }, [searchTerm, allTerms]);

    const handleDelete = (record) => {
        showConfirmDialog({
            title: 'Xóa học kỳ',
            content: `Bạn có chắc chắn muốn xóa học kỳ ${record.code} không? Thao tác này có thể ảnh hưởng đến lịch sử học tập.`,
            onConfirm: async () => {
                const res = await termService.deleteTerm(record._id || record.id);
                if (res.success) {
                    showSuccess('Xóa học kỳ thành công');
                    loadData();
                } else {
                    showError(res.message);
                }
            }
        });
    };

    const handleSubmit = async (formData) => {
        if (selectedTerm) {
            const res = await termService.updateTerm(selectedTerm._id || selectedTerm.id, formData);
            if (res.success) {
                showSuccess('Cập nhật học kỳ thành công');
                setModalOpen(false);
                loadData();
            } else {
                showError(res.message);
            }
        } else {
            const res = await termService.createTerm(formData);
            if (res.success) {
                showSuccess('Thêm học kỳ thành công');
                setModalOpen(false);
                loadData();
            } else {
                showError(res.message);
            }
        }
    };

    const columns = [
        {
            title: 'Mã Học kỳ',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            sorter: (a, b) => (a.code || '').localeCompare(b.code || ''),
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Tên Học kỳ',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: 'Bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 120,
            render: (text) => dayjs(text).format('DD/MM/YYYY')
        },
        {
            title: 'Kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 120,
            render: (text) => {
                const isPast = dayjs(text).isBefore(dayjs());
                return <Text type={isPast ? 'secondary' : 'warning'} strong={!isPast}>{dayjs(text).format('DD/MM/YYYY')}</Text>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status) => {
                let color = '#d9d9d9';
                let label = status;
                if (status === 'Active') {
                    color = '#10b981';
                    label = 'Đang diễn ra';
                } else if (status === 'Upcoming') {
                    color = '#3b82f6';
                    label = 'Sắp tới';
                } else if (status === 'Locked') {
                    color = '#ef4444';
                    label = 'Đã khóa điểm';
                }
                return <Tag color={color} style={{ borderRadius: '6px', fontWeight: 600 }}>{label.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <ProtectedButton role={['admin']} action="hide" type="text" icon={<EditOutlined />} style={{ color: '#f59e0b' }} title="Chỉnh sửa" onClick={() => { setSelectedTerm(record); setModalOpen(true); }} />
                    <ProtectedButton role="admin" action="hide" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    const stats = useMemo(() => {
        return {
            total: allTerms.length,
            active: allTerms.filter(t => t.status === 'Active').length,
            locked: allTerms.filter(t => t.status === 'Locked').length
        };
    }, [allTerms]);

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={2} className="premium-title">Quản lý Học kỳ</Title>
                    <Text className="premium-subtitle">Quản lý thời gian đào tạo và trạng thái nhập điểm</Text>
                </div>
                <Space>
                    <ProtectedButton
                        role={['admin']}
                        action="hide"
                        type="primary"
                        className="premium-btn"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setSelectedTerm(null);
                            setModalOpen(true);
                        }}
                    >
                        Thêm Học kỳ Mới
                    </ProtectedButton>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title="Tổng số học kỳ" value={stats.total} prefix={<BookOutlined />} valueStyle={{ color: 'var(--primary-color)', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title="Học kỳ đang mở" value={stats.active} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#10b981', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title="Học kỳ khóa điểm" value={stats.locked} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#ef4444', fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            <Card className="glass-panel" variant="borderless" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12}>
                        <SearchBar placeholder="Tìm kiếm theo mã, tên học kỳ..." onSearch={setSearchTerm} delay={400} />
                    </Col>
                </Row>
            </Card>

            <Card variant="borderless" className="glass-panel" style={{ padding: '0px' }}>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    rowKey="code"
                    emptyText="Không có dữ liệu học kỳ"
                    pagination={{ pageSize: 12, showTotal: (total) => `${total} mục` }}
                    className="premium-table"
                />
            </Card>

            <TermFormModal 
                open={modalOpen} 
                initialData={selectedTerm} 
                onCancel={() => { 
                    setModalOpen(false); 
                    setSelectedTerm(null); 
                }} 
                onSubmit={handleSubmit} 
            />
        </div>
    );
};

export default TermsPage;
