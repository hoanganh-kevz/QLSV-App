import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Typography, Select, Tag, Space, Row, Col, Avatar, Statistic, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, EyeOutlined, TeamOutlined, CheckCircleOutlined, CoffeeOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import DataTable from '../../components/common/DataTable/DataTable';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import { showConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { showSuccess } from '../../components/common/SuccessMessage/SuccessMessage';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import { teacherService } from '../../services/teacherService';
import { systemService } from '../../services/systemService';
import AddTeacherModal from './components/AddTeacherModal';
import EditTeacherModal from './components/EditTeacherModal';
import TeacherDetailModal from './components/TeacherDetailModal';
import ProtectedButton from '../../components/common/Authorization/ProtectedButton';
import { useTranslation } from '../../hooks/useTranslation';
import BulkImportModal from '../../components/common/BulkImportModal/BulkImportModal';

const { Title, Text } = Typography;
const { Option } = Select;

const TeachersPage = () => {
    const { t } = useTranslation();
    const [allTeachers, setAllTeachers] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    
    const teacherTemplate = {
        teacherId: 'GV001',
        fullName: 'Nguyễn Văn B',
        email: 'nvb@ueh.edu.vn',
        phone: '0987654321',
        college: 'College ID',
        faculty: 'Faculty ID',
        specialization: 'Software Engineering',
        gender: 'Male',
        status: 'Active'
    };

    const [colleges, setColleges] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [collegeFilter, setCollegeFilter] = useState('All');
    const [facultyFilter, setFacultyFilter] = useState('All');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [teacherRes, deptRes] = await Promise.all([
                teacherService.getAllTeachers(),
                systemService.getColleges()
            ]);

            if (teacherRes.success) {
                const mapped = teacherRes.data.map(t => ({ ...t, id: t._id, key: t._id }));
                setAllTeachers(mapped);
            } else {
                showError(teacherRes.message);
            }

            if (deptRes.success) {
                setColleges(deptRes.data);
            }
        } catch (error) {
            showError(t('common.errorLoad') || 'Failed to load data');
        }
        setLoading(false);
    }, [t]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        let filtered = allTeachers;
        if (collegeFilter !== 'All') {
            filtered = filtered.filter(t => t.college?._id === collegeFilter || t.college === collegeFilter);
        }
        if (facultyFilter !== 'All') {
            filtered = filtered.filter(t => t.faculty?._id === facultyFilter || t.faculty === facultyFilter);
        }
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                (t.fullName && t.fullName.toLowerCase().includes(lower)) ||
                (t.teacherId && t.teacherId.toLowerCase().includes(lower)) ||
                (t.email && t.email.toLowerCase().includes(lower))
            );
        }
        setData(filtered);
    }, [searchTerm, collegeFilter, facultyFilter, allTeachers]);

    const handleDelete = useCallback((record) => {
        showConfirmDialog({
            title: t('teachers.deleteTitle'),
            content: t('teachers.deleteConfirm').replace('{{name}}', record.fullName).replace('{{id}}', record.teacherId),
            onConfirm: async () => {
                const res = await teacherService.deleteTeacher(record.id);
                if (res.success) {
                    showSuccess(t('teachers.deleteSuccess').replace('{{name}}', record.fullName));
                    loadData();
                } else {
                    showError(res.message);
                }
            }
        });
    }, [loadData, t]);

    const handleAddSubmit = useCallback(async (newTeacher) => {
        const res = await teacherService.createTeacher(newTeacher);
        if (res.success) {
            showSuccess(t('teachers.addSuccess'));
            setAddModalOpen(false);
            loadData();
        } else {
            showError(res.message);
        }
    }, [loadData, t]);

    const handleEditSubmit = useCallback(async (updated) => {
        const res = await teacherService.updateTeacher(updated.id, updated);
        if (res.success) {
            showSuccess(t('teachers.updateSuccess'));
            setEditModalOpen(false);
            loadData();
        } else {
            showError(res.message);
        }
    }, [loadData, t]);

    const handleBulkImport = useCallback(async (data) => {
        const res = await teacherService.bulkImport(data);
        if (res.success) {
            loadData();
        }
        return res;
    }, [loadData]);

    const columns = useMemo(() => [
        {
            title: t('common.avatar'), dataIndex: 'avatar', key: 'avatar', width: 80,
            render: (_, record) => <Avatar size="large" icon={<UserOutlined />} src={record.avatarUrl} style={{ border: '2px solid var(--border-color)' }} />,
        },
        {
            title: t('teachers.teacherId'), dataIndex: 'teacherId', key: 'teacherId', width: 120,
            sorter: (a, b) => (a.teacherId || '').localeCompare(b.teacherId || ''),
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: t('teachers.fullName'), dataIndex: 'fullName', key: 'fullName',
            sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
        },
        {
            title: "Trường thành viên",
            key: 'college',
            render: (_, record) => <Tag style={{ borderRadius: '6px' }}>{record.college?.name || record.college || 'N/A'}</Tag>
        },
        {
            title: "Khoa trực thuộc",
            key: 'faculty',
            render: (_, record) => <Tag style={{ borderRadius: '6px' }} color="cyan">{record.faculty?.name || record.faculty || 'N/A'}</Tag>
        },
        { title: t('teachers.email'), dataIndex: 'email', key: 'email' },
        {
            title: t('common.status'), dataIndex: 'status', key: 'status', width: 120,
            render: (status) => {
                const colors = { 'Active': '#10b981', 'Inactive': '#ef4444', 'On Leave': '#f59e0b' };
                const statusKey = status === 'Active' ? 'active' : status === 'Inactive' ? 'inactive' : 'onLeave';
                return (
                    <Tag color={colors[status] || 'blue'} style={{ borderRadius: '6px', fontWeight: 600 }}>
                        {(t(`teachers.status.${statusKey}`) || status).toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: t('common.actions'), key: 'actions', width: 120, align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button type="text" icon={<EyeOutlined />} style={{ color: 'var(--primary-color)' }} onClick={() => { setSelectedTeacher(record); setDetailModalOpen(true); }} />
                    <ProtectedButton role="admin" type="text" icon={<EditOutlined />} style={{ color: '#f59e0b' }} onClick={() => { setSelectedTeacher(record); setEditModalOpen(true); }} />
                    <ProtectedButton role="admin" action="hide" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ], [handleDelete, t]);

    const stats = useMemo(() => {
        return {
            total: allTeachers.length,
            active: allTeachers.filter(t => t.status === 'Active').length,
            onLeave: allTeachers.filter(t => t.status === 'On Leave').length
        };
    }, [allTeachers]);

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={2} className="premium-title">{t('teachers.title')}</Title>
                    <Text className="premium-subtitle">{t('teachers.subtitle')}</Text>
                </div>
                <Space>
                    <ProtectedButton 
                        role="admin" 
                        icon={<UploadOutlined />} 
                        onClick={() => setImportModalOpen(true)}
                        className="glass-panel"
                    >
                        Import Danh Sách
                    </ProtectedButton>
                    <ProtectedButton 
                        role="admin" 
                        type="primary" 
                        className="premium-btn" 
                        icon={<PlusOutlined />} 
                        onClick={() => setAddModalOpen(true)}
                    >
                        {t('teachers.addTitle')}
                    </ProtectedButton>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('teachers.stats.total')} value={stats.total} prefix={<TeamOutlined />} valueStyle={{ color: 'var(--primary-color)', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('teachers.stats.teaching')} value={stats.active} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('teachers.stats.onLeave')} value={stats.onLeave} prefix={<CoffeeOutlined />} valueStyle={{ color: '#f59e0b', fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            <Card className="glass-panel" variant="borderless" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={10}>
                        <SearchBar placeholder={t('common.searchPlaceholder')} onSearch={setSearchTerm} delay={400} />
                    </Col>
                    <Col xs={24} md={7}>
                        <Select value={collegeFilter} style={{ width: '100%' }} size="large" onChange={(val) => { setCollegeFilter(val); setFacultyFilter('All'); }} placeholder="Trường">
                            <Option value="All">Tất cả Trường</Option>
                            {colleges.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} md={7}>
                        <Select value={facultyFilter} style={{ width: '100%' }} size="large" onChange={setFacultyFilter} placeholder="Khoa trực thuộc">
                            <Option value="All">Tất cả Khoa</Option>
                            {allTeachers
                                .reduce((acc, current) => {
                                    if (current.faculty && !acc.find(item => item._id === current.faculty._id)) acc.push(current.faculty);
                                    return acc;
                                }, [])
                                .filter(f => collegeFilter === 'All' || f.college === collegeFilter || (f.college?._id === collegeFilter))
                                .map(f => <Option key={f._id} value={f._id}>{f.name}</Option>)
                            }
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card variant="borderless" className="glass-panel" style={{ padding: '0px' }}>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    rowKey="id"
                    emptyText={t('common.noData')}
                    pagination={{ pageSize: 12, showTotal: (total) => `${total} ${t('teachers.stats.suffix')}` }}
                    className="premium-table"
                />
            </Card>

            <AddTeacherModal open={addModalOpen} onCancel={() => setAddModalOpen(false)} onSubmit={handleAddSubmit} />
            <EditTeacherModal open={editModalOpen} initialData={selectedTeacher} onCancel={() => { setEditModalOpen(false); setSelectedTeacher(null); }} onSubmit={handleEditSubmit} />
            <TeacherDetailModal open={detailModalOpen} teacherData={selectedTeacher} onCancel={() => { setDetailModalOpen(false); setSelectedTeacher(null); }} />
            <BulkImportModal
                open={importModalOpen}
                onCancel={() => setImportModalOpen(false)}
                onImport={handleBulkImport}
                templateData={teacherTemplate}
                title="Nhập danh sách Giảng Viên"
                fileName="Teachers"
            />
        </div>
    );
};

export default TeachersPage;
