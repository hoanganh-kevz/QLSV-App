import React, { useState, useEffect, useMemo } from 'react';
import { Space, Button, Card, Row, Col, Typography, Tag, Statistic, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined, BookOutlined, CheckCircleOutlined, InfoCircleOutlined, TeamOutlined, SearchOutlined } from '@ant-design/icons';
import DataTable from '../../components/common/DataTable/DataTable';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import { showConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { showSuccess } from '../../components/common/SuccessMessage/SuccessMessage';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import AddSubjectModal from './components/AddSubjectModal';
import EditSubjectModal from './components/EditSubjectModal';
import ClassStudentsModal from './components/ClassStudentsModal';

import { subjectService } from '../../services/subjectService';
import { systemService } from '../../services/systemService';
import { exportService } from '../../services/exportService';
import ProtectedButton from '../../components/common/Authorization/ProtectedButton';
import { useTranslation } from '../../hooks/useTranslation';

const { Title, Text } = Typography;

const SubjectsPage = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allSubjects, setAllSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [studentsModalOpen, setStudentsModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const loadData = async () => {
        setLoading(true);
        const [subRes, facRes] = await Promise.all([
            subjectService.getAllSubjects(),
            systemService.getFaculties()
        ]);
        
        if (subRes.success) {
            setAllSubjects(subRes.data);
            setData(subRes.data);
        } else {
            showError(subRes.message);
        }

        if (facRes.success) setFaculties(facRes.data);

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            const filteredData = allSubjects.filter(s =>
                (s.name && s.name.toLowerCase().includes(lowerTerm)) ||
                (s.code && s.code.toLowerCase().includes(lowerTerm))
            );
            setData(filteredData);
        } else {
            setData(allSubjects);
        }
    }, [searchTerm, allSubjects]);

    const handleDelete = (record) => {
        showConfirmDialog({
            title: t('subjects.deleteTitle'),
            content: t('subjects.deleteConfirm').replace('{{name}}', record.name).replace('{{code}}', record.code),
            onConfirm: async () => {
                const res = await subjectService.deleteSubject(record._id || record.id);
                if (res.success) {
                    showSuccess(t('subjects.deleteSuccess').replace('{{name}}', record.name));
                    loadData();
                } else {
                    showError(res.message);
                }
            }
        });
    };

    const handleAddSubmit = async (newSubject) => {
        const res = await subjectService.createSubject(newSubject);
        if (res.success) {
            showSuccess(t('subjects.addSuccess'));
            setAddModalOpen(false);
            loadData();
        } else {
            showError(res.message);
        }
    };

    const handleEditSubmit = async (updatedSubject) => {
        const res = await subjectService.updateSubject(updatedSubject._id || updatedSubject.id, updatedSubject);
        if (res.success) {
            showSuccess(t('subjects.updateSuccess'));
            setEditModalOpen(false);
            loadData();
        } else {
            showError(res.message);
        }
    };

    const columns = [
        {
            title: t('subjects.code'),
            dataIndex: 'code',
            key: 'code',
            width: 120,
            sorter: (a, b) => (a.code || '').localeCompare(b.code || ''),
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: t('subjects.name'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: 'Khoa quản lý',
            dataIndex: 'faculty',
            key: 'faculty',
            render: (fac) => fac ? <Text>{fac.name}</Text> : <Text type="secondary">Chưa phân khoa</Text>,
            sorter: (a, b) => (a.faculty?.name || '').localeCompare(b.faculty?.name || ''),
        },
        {
            title: t('subjects.credits'),
            dataIndex: 'credits',
            key: 'credits',
            width: 100,
            align: 'center',
            sorter: (a, b) => a.credits - b.credits,
            render: (c) => <Tag color="blue">{c} {t('subjects.credits')}</Tag>
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                let color = status === 'Active' ? '#10b981' : '#ef4444';
                const statusLabel = status ? t(`students.status.${status.toLowerCase()}`) : status;
                return <Tag color={color} style={{ borderRadius: '6px', fontWeight: 600 }}>{statusLabel?.toUpperCase()}</Tag>;
            }
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: 120,
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <ProtectedButton role={['admin', 'manager']} action="hide" type="text" icon={<EditOutlined />} style={{ color: '#f59e0b' }} title={t('common.edit')} onClick={() => { setSelectedSubject(record); setEditModalOpen(true); }} />
                    <ProtectedButton role="admin" action="hide" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    const stats = useMemo(() => {
        return {
            total: allSubjects.length,
            active: allSubjects.filter(s => s.status === 'Active').length,
            totalCredits: allSubjects.reduce((acc, s) => acc + (s.credits || 0), 0)
        };
    }, [allSubjects]);

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={2} className="premium-title">{t('subjects.title')}</Title>
                    <Text className="premium-subtitle">{t('subjects.subtitle')}</Text>
                </div>
                <Space>
                    <Button
                        icon={<FileExcelOutlined />}
                        onClick={async () => {
                            const res = await exportService.exportToExcel(data, 'Subjects_List', 'Subjects');
                            if (res.success) showSuccess(t('grades.exportSuccess'));
                        }}
                        disabled={data.length === 0}
                        className="glass-panel"
                    >
                        {t('common.export')}
                    </Button>
                    <ProtectedButton
                        role={['admin', 'manager']}
                        action="hide"
                        type="primary"
                        className="premium-btn"
                        icon={<PlusOutlined />}
                        onClick={() => setAddModalOpen(true)}
                    >
                        {t('subjects.addTitle')}
                    </ProtectedButton>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('subjects.stats.total')} value={stats.total} prefix={<BookOutlined />} valueStyle={{ color: 'var(--primary-color)', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('subjects.stats.active')} value={stats.active} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('subjects.stats.credits')} value={stats.totalCredits} prefix={<InfoCircleOutlined />} valueStyle={{ color: '#3b82f6', fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            <Card className="glass-panel" variant="borderless" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12}>
                        <SearchBar placeholder={t('subjects.searchPlaceholder')} onSearch={setSearchTerm} delay={400} />
                    </Col>
                </Row>
            </Card>

            <Card variant="borderless" className="glass-panel" style={{ padding: '0px' }}>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    rowKey="id"
                    emptyText={t('subjects.noData')}
                    pagination={{ pageSize: 12, showTotal: (total) => `${total} ${t('subjects.stats.suffix')}` }}
                    className="premium-table"
                />
            </Card>

            <AddSubjectModal open={addModalOpen} onCancel={() => setAddModalOpen(false)} onSubmit={handleAddSubmit} faculties={faculties} />
            <EditSubjectModal open={editModalOpen} initialData={selectedSubject} onCancel={() => { setEditModalOpen(false); setSelectedSubject(null); }} onSubmit={handleEditSubmit} faculties={faculties} />
        </div>
    );
};

export default SubjectsPage;
