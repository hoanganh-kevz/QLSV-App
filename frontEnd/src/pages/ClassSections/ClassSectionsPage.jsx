import React, { useState, useEffect, useMemo } from 'react';
import { Space, Button, Card, Row, Col, Typography, Tag, Statistic, Form, Input, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, CheckCircleOutlined, TeamOutlined, DesktopOutlined, PartitionOutlined } from '@ant-design/icons';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import DataTable from '../../components/common/DataTable/DataTable';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import { showConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { showSuccess } from '../../components/common/SuccessMessage/SuccessMessage';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import FormModal from '../../components/common/FormModal/FormModal';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';

import { classSectionService } from '../../services/classSectionService';
import { subjectService } from '../../services/subjectService';
import { termService } from '../../services/termService';
import { teacherService } from '../../services/teacherService';
import { systemService } from '../../services/systemService';
import ProtectedButton from '../../components/common/Authorization/ProtectedButton';

const { Title, Text } = Typography;
const { Option } = Select;

const createSchema = () => yup.object().shape({
    code: yup.string().required('Mã lớp học phần là bắt buộc').matches(/^[A-Z0-9_-]+$/, 'Mã không chứa khoảng trắng (VD: 26D2INF50901005)'),
    subject: yup.string().required('Môn học là bắt buộc'),
    term: yup.string().required('Học kỳ là bắt buộc'),
    teacher: yup.string().nullable(),
    maxStudents: yup.number().min(1, 'Sĩ số tối thiểu là 1').required('Sĩ số là bắt buộc'),
    status: yup.string().required('Trạng thái là bắt buộc'),
    targetClasses: yup.array().of(yup.string()).nullable(),
    schedule: yup.array().of(yup.object().shape({
        dayOfWeek: yup.number().required('Bắt buộc'),
        startPeriod: yup.number().min(1).max(18).required('Bắt buộc'),
        endPeriod: yup.number().min(1).max(18).required('Bắt buộc').test('is-greater', 'Phải >= tiết BĐ', function(value) {
            return value >= this.parent.startPeriod;
        }),
        room: yup.string().required('Bắt buộc')
    })).min(1, 'Phải có ít nhất 1 lịch học'),
    phase: yup.number().required(),
    teachingMethod: yup.string().required('Hình thức học là bắt buộc'),
    language: yup.string().required('Ngôn ngữ là bắt buộc')
});

const SectionFormModal = ({ open, initialData, onCancel, onSubmit, subjects, terms, teachers, classes }) => {
    const isEdit = !!initialData;
    const schema = createSchema();
    
    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            code: '', subject: undefined, term: undefined, teacher: undefined, maxStudents: 40, status: 'Active', targetClasses: [],
            schedule: [{ dayOfWeek: 2, startPeriod: 1, endPeriod: 3, room: 'TBA' }],
            phase: 0, teachingMethod: 'Tập trung', language: 'Tiếng Việt'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "schedule"
    });

    const watchSubjectId = watch('subject');
    
    // Lọc giảng viên theo khoa của môn học
    const filteredTeachers = React.useMemo(() => {
        if (!watchSubjectId) return teachers;
        const selectedSubject = subjects.find(s => s._id === watchSubjectId || s.id === watchSubjectId);
        if (!selectedSubject || !selectedSubject.faculty) return teachers;
        
        const facultyId = typeof selectedSubject.faculty === 'object' ? selectedSubject.faculty._id : selectedSubject.faculty;
        return teachers.filter(t => {
            const tFacId = typeof t.faculty === 'object' ? t.faculty?._id : t.faculty;
            return tFacId === facultyId;
        });
    }, [watchSubjectId, teachers, subjects]);

    useEffect(() => {
        if (open) {
            if (isEdit && initialData) {
                reset({
                    code: initialData.code,
                    subject: typeof initialData.subject === 'object' ? initialData.subject._id : initialData.subject,
                    term: typeof initialData.term === 'object' ? initialData.term._id : initialData.term,
                    teacher: initialData.teacher ? (typeof initialData.teacher === 'object' ? initialData.teacher._id : initialData.teacher) : undefined,
                    maxStudents: initialData.maxStudents,
                    maxStudents: initialData.maxStudents,
                    status: initialData.status,
                    targetClasses: initialData.targetClasses ? initialData.targetClasses.map(c => typeof c === 'object' ? c._id : c) : [],
                    schedule: initialData.schedule && initialData.schedule.length > 0 ? initialData.schedule : [{ dayOfWeek: 2, startPeriod: 1, endPeriod: 3, room: 'TBA' }],
                    phase: initialData.phase ?? 0,
                    teachingMethod: initialData.teachingMethod || 'Tập trung',
                    language: initialData.language || 'Tiếng Việt'
                });
            } else {
                reset({
                    code: '', subject: undefined, term: undefined, teacher: undefined, maxStudents: 40, status: 'Active', targetClasses: [],
                    schedule: [{ dayOfWeek: 2, startPeriod: 1, endPeriod: 3, room: 'TBA' }],
                    phase: 0, teachingMethod: 'Tập trung', language: 'Tiếng Việt'
                });
            }
        }
    }, [open, isEdit, initialData, reset]);

    const onFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <FormModal
            title={isEdit ? 'Chỉnh sửa Lớp học phần' : 'Mở Lớp học phần Mới'}
            open={open}
            onCancel={onCancel}
            onSubmit={handleSubmit(onFormSubmit)}
            width={700}
        >
            <Form layout="vertical">
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item label="Mã Lớp HP" required validateStatus={errors.code ? 'error' : ''} help={<ErrorMessage error={errors.code?.message} />}>
                            <Controller name="code" control={control} render={({ field }) => <Input {...field} placeholder="VD: 26D2INF50901005" style={{ textTransform: 'uppercase' }} disabled={isEdit} />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Môn học" required validateStatus={errors.subject ? 'error' : ''} help={<ErrorMessage error={errors.subject?.message} />}>
                            <Controller name="subject" control={control} render={({ field }) => (
                                <Select {...field} showSearch optionFilterProp="children" placeholder="Chọn môn học">
                                    {subjects.map(s => <Option key={s._id} value={s._id}>{s.code} - {s.name}</Option>)}
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Học kỳ" required validateStatus={errors.term ? 'error' : ''} help={<ErrorMessage error={errors.term?.message} />}>
                            <Controller name="term" control={control} render={({ field }) => (
                                <Select {...field} placeholder="Chọn học kỳ">
                                    {terms.map(t => <Option key={t._id} value={t._id}>{t.name}</Option>)}
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Giảng viên" validateStatus={errors.teacher ? 'error' : ''} help={<ErrorMessage error={errors.teacher?.message} />}>
                            <Controller name="teacher" control={control} render={({ field }) => (
                                <Select {...field} showSearch allowClear optionFilterProp="children" placeholder="Phân công giảng viên" disabled={!watchSubjectId}>
                                    {filteredTeachers.map(t => <Option key={t._id} value={t._id}>{t.fullName || 'Unknown'} ({t.teacherId})</Option>)}
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24}>
                        <Form.Item label="Chỉ định Lớp sinh hoạt (Tùy chọn)" validateStatus={errors.targetClasses ? 'error' : ''} help={<ErrorMessage error={errors.targetClasses?.message} />}>
                            <Controller name="targetClasses" control={control} render={({ field }) => (
                                <Select {...field} mode="multiple" showSearch allowClear optionFilterProp="children" placeholder="Chọn các lớp sinh hoạt sẽ học lớp học phần này">
                                    {classes.map(c => <Option key={c._id} value={c._id}>{c.code} - {c.name}</Option>)}
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item label="Sĩ số tối đa" required validateStatus={errors.maxStudents ? 'error' : ''} help={<ErrorMessage error={errors.maxStudents?.message} />}>
                            <Controller name="maxStudents" control={control} render={({ field }) => <InputNumber {...field} min={1} max={500} style={{ width: '100%' }} />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24}>
                        <div style={{ marginBottom: 8 }}><Text strong>Lịch học</Text></div>
                        {fields.map((field, index) => (
                            <Row gutter={8} key={field.id} style={{ marginBottom: 8, background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                <Col span={5}>
                                    <Controller name={`schedule.${index}.dayOfWeek`} control={control} render={({ field: f }) => (
                                        <Select {...f} style={{ width: '100%' }}>
                                            {[2,3,4,5,6,7,8].map(d => <Option key={d} value={d}>{d === 8 ? 'Chủ nhật' : `Thứ ${d}`}</Option>)}
                                        </Select>
                                    )} />
                                </Col>
                                <Col span={5}>
                                    <Controller name={`schedule.${index}.startPeriod`} control={control} render={({ field: f }) => (
                                        <InputNumber {...f} min={1} max={18} placeholder="Từ tiết" style={{ width: '100%' }} />
                                    )} />
                                </Col>
                                <Col span={5}>
                                    <Controller name={`schedule.${index}.endPeriod`} control={control} render={({ field: f }) => (
                                        <InputNumber {...f} min={1} max={18} placeholder="Đến tiết" style={{ width: '100%' }} />
                                    )} />
                                </Col>
                                <Col span={6}>
                                    <Controller name={`schedule.${index}.room`} control={control} render={({ field: f }) => (
                                        <Input {...f} placeholder="Phòng học" />
                                    )} />
                                </Col>
                                <Col span={3}>
                                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(index)} />
                                </Col>
                            </Row>
                        ))}
                        <Button type="dashed" onClick={() => append({ dayOfWeek: 2, startPeriod: 1, endPeriod: 3, room: 'TBA' })} block icon={<PlusOutlined />}>
                            Thêm buổi học
                        </Button>
                        {errors.schedule && <div style={{ color: '#ff4d4f', marginTop: 4 }}><ErrorMessage error={errors.schedule.message} /></div>}
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item label="Trạng thái" required validateStatus={errors.status ? 'error' : ''} help={<ErrorMessage error={errors.status?.message} />}>
                            <Controller name="status" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <Option value="Active">Đang mở (Active)</Option>
                                    <Option value="Completed">Đã kết thúc (Completed)</Option>
                                    <Option value="Cancelled">Đã hủy (Cancelled)</Option>
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item label="Đợt học" required>
                            <Controller name="phase" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <Option value={0}>Cả học kỳ</Option>
                                    <Option value={1}>Đợt 1 (Nửa đầu học kỳ)</Option>
                                    <Option value={2}>Đợt 2 (Nửa sau học kỳ)</Option>
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item label="Hình thức học" required validateStatus={errors.teachingMethod ? 'error' : ''} help={<ErrorMessage error={errors.teachingMethod?.message} />}>
                            <Controller name="teachingMethod" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <Option value="Tập trung">Tập trung (trực tiếp)</Option>
                                    <Option value="Trực tuyến">Trực tuyến (online)</Option>
                                    <Option value="Kết hợp">Kết hợp blended</Option>
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item label="Ngôn ngữ giảng dạy" required validateStatus={errors.language ? 'error' : ''} help={<ErrorMessage error={errors.language?.message} />}>
                            <Controller name="language" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <Option value="Tiếng Việt">Tiếng Việt</Option>
                                    <Option value="Tiếng Anh">Tiếng Anh</Option>
                                    <Option value="Tiếng Nhật">Tiếng Nhật</Option>
                                    <Option value="Tiếng Pháp">Tiếng Pháp</Option>
                                    <Option value="Khác">Khác</Option>
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </FormModal>
    );
};

const ClassSectionsPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allSections, setAllSections] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState(null);
    
    // Dependencies data
    const [subjects, setSubjects] = useState([]);
    const [terms, setTerms] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);

    const loadDependencies = async () => {
        const [subRes, termRes, teachRes, classRes] = await Promise.all([
            subjectService.getAllSubjects(),
            termService.getAllTerms(),
            teacherService.getAllTeachers(),
            systemService.getClasses()
        ]);
        if (subRes.success) setSubjects(subRes.data);
        if (termRes.success) {
            setTerms(termRes.data);
            const activeTerm = termRes.data.find(t => t.isDefault || t.status === 'Active');
            if (activeTerm) setSelectedTerm(activeTerm._id);
        }
        if (teachRes.success) setTeachers(teachRes.data);
        if (classRes.success) setClasses(classRes.data);
    };

    const loadData = async () => {
        setLoading(true);
        const res = await classSectionService.getAllSections();
        if (res.success) {
            setAllSections(res.data);
            setData(res.data);
        } else {
            showError(res.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadDependencies();
        loadData();
    }, []);

    useEffect(() => {
        let filtered = allSections;
        
        // Filter by Term
        if (selectedTerm) {
            filtered = filtered.filter(s => (typeof s.term === 'object' ? s.term._id : s.term) === selectedTerm);
        }

        // Search by text
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                (s.code && s.code.toLowerCase().includes(lowerTerm)) ||
                (s.subject?.name && s.subject.name.toLowerCase().includes(lowerTerm)) ||
                (s.term?.name && s.term.name.toLowerCase().includes(lowerTerm))
            );
        }
        setData(filtered);
    }, [searchTerm, allSections, selectedTerm]);

    const handleDelete = (record) => {
        showConfirmDialog({
            title: 'Hủy Lớp học phần',
            content: `Bạn có chắc chắn muốn xóa hệ thống phân lớp ${record.code} không?`,
            onConfirm: async () => {
                const res = await classSectionService.deleteSection(record._id || record.id);
                if (res.success) {
                    showSuccess('Xóa lớp học phần thành công');
                    loadData();
                } else {
                    showError(res.message);
                }
            }
        });
    };

    const handleSubmit = async (formData) => {
        if (selectedSection) {
            const res = await classSectionService.updateSection(selectedSection._id || selectedSection.id, formData);
            if (res.success) {
                showSuccess('Cập nhật lớp học phần thành công');
                setModalOpen(false);
                loadData();
            } else {
                showError(res.message);
            }
        } else {
            const res = await classSectionService.createSection(formData);
            if (res.success) {
                showSuccess('Mở lớp học phần mới thành công');
                setModalOpen(false);
                loadData();
            } else {
                showError(res.message);
            }
        }
    };

    const columns = [
        {
            title: 'Mã Lớp HP',
            dataIndex: 'code',
            key: 'code',
            width: 180,
            sorter: (a, b) => (a.code || '').localeCompare(b.code || ''),
            render: (text) => <Text strong style={{ color: 'var(--primary-color)' }}>{text}</Text>
        },
        {
            title: 'Môn học',
            dataIndex: 'subject',
            key: 'subject',
            render: (subject) => subject ? (
                <div>
                    <Text strong>{subject.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{subject.code} ({subject.credits} TC)</Text>
                </div>
            ) : <Text type="secondary">N/A</Text>,
            sorter: (a, b) => (a.subject?.name || '').localeCompare(b.subject?.name || '')
        },
        {
            title: 'Học kỳ',
            dataIndex: 'term',
            key: 'term',
            render: (term) => term ? <Tag style={{ borderRadius: '6px' }}>{term.code}</Tag> : <Text type="secondary">N/A</Text>,
            filters: terms.map(t => ({ text: t.code, value: t.code })),
            onFilter: (value, record) => record.term?.code === value
        },
        {
            title: 'Sĩ số (Max)',
            dataIndex: 'maxStudents',
            key: 'maxStudents',
            width: 110,
            align: 'center',
            render: (val) => <Text><TeamOutlined /> {val}</Text>
        },
        {
            title: 'Lịch học',
            key: 'schedule',
            width: 160,
            render: (_, record) => {
                if (!record.schedule || record.schedule.length === 0) return <Text type="secondary">Chưa có lịch</Text>;
                return (
                    <div>
                        {record.schedule.map((s, idx) => (
                            <div key={idx} style={{ fontSize: '13px', marginBottom: '8px' }}>
                                <Text strong style={{ color: 'var(--primary-color)' }}>{s.dayOfWeek === 8 ? 'C.Nhật' : `Thứ ${s.dayOfWeek}`}:</Text> T{s.startPeriod}-{s.endPeriod} <br/>
                                <Text type="secondary" style={{ fontSize: '12px' }}><DesktopOutlined style={{ marginRight: 4 }}/>{s.room}</Text>
                            </div>
                        ))}
                    </div>
                );
            }
        },
        {
            title: 'Đợt / Hình thức',
            key: 'phase',
            width: 160,
            render: (_, record) => {
                const phaseLabel = record.phase === 1 ? 'Đợt 1' : record.phase === 2 ? 'Đợt 2' : 'Cả kỳ';
                const phaseColor = record.phase === 1 ? '#6366f1' : record.phase === 2 ? '#f97316' : '#64748b';
                const methodColor = record.teachingMethod === 'Trực tuyến' ? '#3b82f6' : record.teachingMethod === 'Kết hợp' ? '#f59e0b' : '#10b981';
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Tag style={{ borderRadius: 6, borderColor: phaseColor, color: phaseColor, background: phaseColor + '15', fontWeight: 600, width: 'fit-content' }}>
                            {phaseLabel}
                        </Tag>
                        <Tag style={{ borderRadius: 6, borderColor: methodColor, color: methodColor, background: methodColor + '15', fontWeight: 500, width: 'fit-content' }}>
                            {record.teachingMethod || 'Tập trung'}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 11 }}>🌐 {record.language || 'Tiếng Việt'}</Text>
                    </div>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            render: (status) => {
                let color = '#d9d9d9';
                if (status === 'Active') color = '#10b981';
                else if (status === 'Cancelled') color = '#ef4444';
                else if (status === 'Completed') color = '#3b82f6';
                return <Tag color={color} style={{ borderRadius: '6px', fontWeight: 600 }}>{status?.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 90,
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <ProtectedButton role={['admin', 'manager']} action="hide" type="text" icon={<EditOutlined />} style={{ color: '#f59e0b' }} onClick={() => { setSelectedSection(record); setModalOpen(true); }} />
                    <ProtectedButton role="admin" action="hide" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    const stats = useMemo(() => {
        const termSections = selectedTerm 
            ? allSections.filter(s => (typeof s.term === 'object' ? s.term._id : s.term) === selectedTerm)
            : allSections;
            
        return {
            total: termSections.length,
            active: termSections.filter(s => s.status === 'Active').length,
            termActive: terms.filter(t => t.status === 'Active').length
        };
    }, [allSections, terms, selectedTerm]);

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={2} className="premium-title">Quản lý Lớp học phần</Title>
                    <Text className="premium-subtitle">Tổ chức các lớp học mở theo từng học kỳ</Text>
                </div>
                <Space>
                    <ProtectedButton
                        role={['admin', 'manager']}
                        action="hide"
                        type="primary"
                        className="premium-btn"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setSelectedSection(null);
                            setModalOpen(true);
                        }}
                    >
                        Mở Lớp Mới
                    </ProtectedButton>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title="Tổng số Lớp HP" value={stats.total} prefix={<PartitionOutlined />} valueStyle={{ color: 'var(--primary-color)', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title="Lớp đang diễn ra" value={stats.active} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title="Học kỳ đang mở" value={stats.termActive} prefix={<BookOutlined />} valueStyle={{ color: '#f59e0b', fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            <Card className="glass-panel" variant="borderless" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={6}>
                        <Select 
                            placeholder="Chọn học kỳ" 
                            style={{ width: '100%' }} 
                            size="large"
                            value={selectedTerm}
                            onChange={setSelectedTerm}
                            allowClear
                        >
                            {terms.map(t => <Option key={t._id} value={t._id}>{t.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} md={12}>
                        <SearchBar placeholder="Tìm theo mã lớp, tên môn..." onSearch={setSearchTerm} delay={400} />
                    </Col>
                </Row>
            </Card>

            <Card variant="borderless" className="glass-panel" style={{ padding: '0px' }}>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    rowKey="code"
                    emptyText="Chưa có lớp học phần nào được mở"
                    pagination={{ pageSize: 12, showTotal: (total) => `${total} mục` }}
                    className="premium-table"
                />
            </Card>

            <SectionFormModal 
                open={modalOpen} 
                initialData={selectedSection} 
                onCancel={() => { 
                    setModalOpen(false); 
                    setSelectedSection(null); 
                }} 
                onSubmit={handleSubmit}
                subjects={subjects}
                terms={terms}
                teachers={teachers}
                classes={classes}
            />
        </div>
    );
};

// Remove duplicate mock icon logic, already imported above

export default ClassSectionsPage;
