import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Space, Button, Card, Row, Col, Select, Typography, Tag, Avatar, Slider, DatePicker, Statistic, Divider, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, FileExcelOutlined, TeamOutlined, CheckCircleOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import DataTable from '../../components/common/DataTable/DataTable';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import { showConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { exportService } from '../../services/exportService';
import { showSuccess } from '../../components/common/SuccessMessage/SuccessMessage';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import AddStudentModal from './components/AddStudentModal';
import EditStudentModal from './components/EditStudentModal';
import StudentDetailModal from './components/StudentDetailModal';
import AdvancedFilterPanel from '../../components/common/AdvancedFilterPanel/AdvancedFilterPanel';
import ProtectedButton from '../../components/common/Authorization/ProtectedButton';
import BulkImportModal from '../../components/common/BulkImportModal/BulkImportModal';

import { useStudents } from '../../hooks/useStudents';
import { useTranslation } from '../../hooks/useTranslation';
import { systemService } from '../../services/systemService';
import { studentService } from '../../services/studentService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const StudentsPage = () => {
    const { t } = useTranslation();
    const { students = [], loading, loadStudents, addStudent, updateStudent, deleteStudent } = useStudents();
    const [exportLoading, setExportLoading] = useState(false);

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const studentTemplate = {
        mssv: '31201020000',
        fullName: 'Nguyễn Văn A',
        email: 'nva@st.ueh.edu.vn',
        phone: '0123456789',
        class: 'Class ID (ObjectId)',
        dob: '2000-01-01',
        gender: 'Male',
        address: 'Hồ Chí Minh',
        status: 'Active'
    };

    const searchParams = new URL(window.location.href).searchParams;
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [collegeFilter, setCollegeFilter] = useState(searchParams.get('college') || 'All');
    const [facultyFilter, setFacultyFilter] = useState(searchParams.get('faculty') || 'All');
    const [batchFilter, setBatchFilter] = useState(searchParams.get('batch') || 'All');
    const [classFilter, setClassFilter] = useState(searchParams.get('class') || 'All');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');

    const [colleges, setColleges] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [classes, setClasses] = useState([]);
    const [availableBatches, setAvailableBatches] = useState([]);

    const [gpaRange, setGpaRange] = useState([
        parseFloat(searchParams.get('minGpa')) || 0,
        parseFloat(searchParams.get('maxGpa')) || 4.0
    ]);
    const [dateRange, setDateRange] = useState(null);

    const [data, setData] = useState([]);

    useEffect(() => {
        if (!Array.isArray(students)) return;

        let filteredData = [...students];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filteredData = filteredData.filter(s =>
                (s.fullName && s.fullName.toLowerCase().includes(lowerTerm)) ||
                (s.mssv && s.mssv.includes(lowerTerm)) ||
                (s.class?.name && s.class.name.toLowerCase().includes(lowerTerm))
            );
        }

        if (collegeFilter !== 'All') {
            filteredData = filteredData.filter(s => {
                const colId = s.class?.major?.faculty?.college?._id || s.class?.major?.faculty?.college;
                return colId === collegeFilter;
            });
        }

        if (facultyFilter !== 'All') {
            filteredData = filteredData.filter(s => {
                const facId = s.class?.major?.faculty?._id || s.class?.major?.faculty;
                return facId === facultyFilter;
            });
        }

        if (classFilter !== 'All') {
            filteredData = filteredData.filter(s => {
                const clsId = s.class?._id || s.class;
                return clsId === classFilter;
            });
        }

        if (statusFilter !== 'All') {
            filteredData = filteredData.filter(s => s.status === statusFilter);
        }

        if (batchFilter !== 'All') {
            filteredData = filteredData.filter(s => s.class?.batch === batchFilter);
        }

        setData(filteredData);
    }, [searchTerm, collegeFilter, facultyFilter, classFilter, statusFilter, batchFilter, gpaRange, dateRange, students]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [deptRes, configRes] = await Promise.all([
                    systemService.getColleges(),
                    systemService.getConfig()
                ]);
                if (deptRes.success) setColleges(deptRes.data || []);
                if (configRes.success && configRes.data) {
                    setAvailableBatches(configRes.data.BATCHES || []);
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchFaculties = async () => {
            if (collegeFilter === 'All') {
                setFaculties([]);
                return;
            }
            const res = await systemService.getFaculties({ collegeId: collegeFilter });
            if (res.success) setFaculties(res.data || []);
        };
        fetchFaculties();
    }, [collegeFilter]);

    useEffect(() => {
        const fetchClasses = async () => {
            const res = await systemService.getClasses();
            if (res.success) {
                let filtered = res.data;
                if (facultyFilter !== 'All') {
                    filtered = filtered.filter(c => c.major?.faculty?._id === facultyFilter || c.major?.faculty === facultyFilter);
                }
                setClasses(filtered || []);
            }
        };
        fetchClasses();
    }, [facultyFilter]);

    useEffect(() => {
        const urlParams = new URLSearchParams();
        if (searchTerm) urlParams.set('search', searchTerm);
        if (collegeFilter !== 'All') urlParams.set('college', collegeFilter);
        if (facultyFilter !== 'All') urlParams.set('faculty', facultyFilter);
        if (classFilter !== 'All') urlParams.set('class', classFilter);
        if (statusFilter !== 'All') urlParams.set('status', statusFilter);
        if (batchFilter !== 'All') urlParams.set('batch', batchFilter);
        if (gpaRange[0] > 0 || gpaRange[1] < 4.0) {
            urlParams.set('minGpa', gpaRange[0]);
            urlParams.set('maxGpa', gpaRange[1]);
        }
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        if (window.location.search !== `?${urlParams.toString()}`) {
            window.history.replaceState(null, '', newUrl);
        }
    }, [searchTerm, collegeFilter, facultyFilter, classFilter, statusFilter, batchFilter, gpaRange, dateRange]);

    const handleDelete = useCallback((record) => {
        if (!record) return;
        showConfirmDialog({
            title: t('students.deleteTitle'),
            content: (t('students.deleteConfirm') || '').replace('{{name}}', record.fullName || '').replace('{{mssv}}', record.mssv || ''),
            onConfirm: async () => {
                const res = await deleteStudent(record.id || record._id);
                if (res.success) {
                    showSuccess(t('students.deleteSuccess').replace('{{name}}', record.fullName));
                }
            }
        });
    }, [deleteStudent, t]);

    const handleAddSubmit = useCallback(async (newStudent) => {
        const res = await addStudent(newStudent);
        if (res.success) {
            showSuccess(t('students.addSuccess'));
            setAddModalOpen(false);
        }
    }, [addStudent, t]);

    const handleEditSubmit = useCallback(async (updatedStudent) => {
        const res = await updateStudent(updatedStudent.id || updatedStudent._id, updatedStudent);
        if (res.success) {
            showSuccess(t('students.updateSuccess'));
            setEditModalOpen(false);
        }
    }, [updateStudent, t]);

    const handleBulkImport = useCallback(async (data) => {
        const res = await studentService.bulkImportStudents(data);
        if (res.success) {
            loadStudents();
        }
        return res;
    }, [loadStudents]);

    const columns = useMemo(() => [
        {
            title: t('common.avatar') || 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: (_, record) => <Avatar size="large" icon={<UserOutlined />} src={record.avatarUrl} style={{ border: '2px solid var(--border-color)' }} />
        },
        {
            title: t('students.mssv'),
            dataIndex: 'mssv',
            key: 'mssv',
            width: 120,
            sorter: (a, b) => (a.mssv || '').localeCompare(b.mssv || ''),
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: t('students.fullName'),
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
        },
        {
            title: t('students.class'),
            dataIndex: 'class',
            key: 'class',
            render: (cls) => <Tag color="blue" style={{ borderRadius: '6px' }}>{cls?.name || cls || '-'}</Tag>
        },
        {
            title: t('students.col.batch'),
            key: 'batch',
            width: 100,
            render: (_, record) => record.class?.batch || '-'
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                let color = status === 'Active' ? '#10b981' : status === 'Inactive' ? '#ef4444' : '#3b82f6';
                const statusLabel = status ? t(`students.status.${status.toLowerCase()}`) : status;
                return <Tag color={color} style={{ borderRadius: '6px', fontWeight: 600 }}>{statusLabel}</Tag>;
            }
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: 150,
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button type="text" icon={<EyeOutlined />} style={{ color: 'var(--primary-color)' }} title={t('common.viewDetails')} onClick={() => { setSelectedStudent(record); setDetailModalOpen(true); }} />
                    <ProtectedButton role={['admin', 'manager']} action="hide" type="text" icon={<EditOutlined />} style={{ color: '#f59e0b' }} title={t('common.edit')} onClick={() => { setSelectedStudent(record); setEditModalOpen(true); }} />
                    <ProtectedButton role="admin" action="hide" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} title={t('common.delete')} />
                </Space>
            ),
        },
    ], [handleDelete, t]);

    const stats = useMemo(() => {
        return {
            total: (data || []).length,
            active: (data || []).filter(s => s.status === 'Active').length,
            inactive: (data || []).filter(s => s.status === 'Inactive').length
        };
    }, [data]);

    const handleExport = useCallback(async () => {
        if (!data || data.length === 0) return;
        setExportLoading(true);
        const exportData = data.map((s, i) => ({
            'No.': i + 1,
            'MSSV': s.mssv,
            'Full Name': s.fullName,
            'Class': s.class?.name || s.class,
            'Email': s.email,
            'Phone': s.phone,
            'DOB': s.dob ? new Date(s.dob).toLocaleDateString() : '',
            'Gender': s.gender,
            'Address': s.address,
            'Status': s.status
        }));
        const res = await exportService.exportToExcel(exportData, 'Students_List', 'Students');
        if (res.success) showSuccess(t('students.exportSuccess'));
        else showError(res.message);
        setExportLoading(false);
    }, [data, t]);

    if (loading && students.length === 0) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" description={t('common.loading') || "Loading students..."} /></div>;
    }

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={2} className="premium-title">{t('students.title')}</Title>
                    <Text className="premium-subtitle">{t('students.subtitle')}</Text>
                </div>
                <Space>
                    <Button 
                        icon={<FileExcelOutlined />} 
                        onClick={handleExport} 
                        disabled={!data || data.length === 0} 
                        loading={exportLoading} 
                        className="glass-panel"
                    >
                        {t('common.export')}
                    </Button>
                    <ProtectedButton
                        role={['admin', 'manager']}
                        action="hide"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setAddModalOpen(true)}
                        className="premium-btn"
                    >
                        {t('students.addTitle')}
                    </ProtectedButton>
                    <ProtectedButton
                        role={['admin', 'manager']}
                        action="hide"
                        icon={<UploadOutlined />}
                        onClick={() => setImportModalOpen(true)}
                        className="glass-panel"
                    >
                        Import Danh Sách
                    </ProtectedButton>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('students.stats.total')} value={stats.total} prefix={<TeamOutlined />} valueStyle={{ color: 'var(--primary-color)', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('students.stats.active')} value={stats.active} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#10b981', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('students.stats.inactive')} value={stats.inactive} prefix={<StopOutlined />} valueStyle={{ color: '#ef4444', fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            <Card className="glass-panel" variant="borderless" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 24]} align="middle">
                    <Col xs={24} lg={8}>
                        <SearchBar placeholder={t('students.searchPlaceholder')} onSearch={setSearchTerm} delay={500} />
                    </Col>
                    <Col xs={24} md={8} lg={5}>
                        <div style={{ position: 'relative' }}>
                             <Select 
                                value={collegeFilter} 
                                style={{ width: '100%' }} 
                                size="large" 
                                onChange={(val) => { setCollegeFilter(val); setFacultyFilter('All'); setClassFilter('All'); }}
                                placeholder={t('common.allDepts')}
                            >
                                <Option value="All">{t('common.allDepts')}</Option>
                                {(colleges || []).map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                            </Select>
                        </div>
                    </Col>
                    <Col xs={24} md={8} lg={5}>
                        <Select 
                            value={facultyFilter} 
                            style={{ width: '100%' }} 
                            size="large" 
                            disabled={collegeFilter === 'All'} 
                            onChange={(val) => { setFacultyFilter(val); setClassFilter('All'); }}
                            placeholder="Khoa trực thuộc"
                        >
                            <Option value="All">Tất cả Khoa</Option>
                            {(faculties || []).map(f => <Option key={f._id} value={f._id}>{f.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} md={8} lg={6}>
                        <Select 
                            value={classFilter} 
                            style={{ width: '100%' }} 
                            size="large" 
                            disabled={facultyFilter === 'All'} 
                            onChange={setClassFilter}
                            placeholder={t('common.allClasses') || 'All Classes'}
                        >
                            <Option value="All">{t('common.allClasses') || 'All Classes'}</Option>
                            {(classes || []).map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                        </Select>
                    </Col>
                </Row>
                
                <Divider style={{ margin: '24px 0' }} />
                
                <AdvancedFilterPanel onReset={() => { setClassFilter('All'); setStatusFilter('All'); setGpaRange([0, 4.0]); setDateRange(null); }}>
                    <Row gutter={[32, 16]}>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 16, fontWeight: 600 }}>{t('students.gpaRange')}</div>
                            <Slider range step={0.1} min={0} max={4.0} value={gpaRange} onChange={setGpaRange} marks={{ 0: '0', 2.0: '2.0', 4.0: '4.0' }} />
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 8, fontWeight: 600 }}>{t('students.enrollDate')}</div>
                            <RangePicker value={dateRange} onChange={setDateRange} style={{ width: '100%' }} size="large" />
                        </Col>
                    </Row>
                </AdvancedFilterPanel>
            </Card>

            <Card variant="borderless" className="glass-panel" style={{ padding: '0px' }}>
                <DataTable
                    columns={columns}
                    data={data || []}
                    loading={loading}
                    rowKey="id"
                    emptyText={t('students.noDataMatching')}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} ${t('nav.students')}` }}
                    className="premium-table"
                />
            </Card>

            <AddStudentModal open={addModalOpen} onCancel={() => setAddModalOpen(false)} onSubmit={handleAddSubmit} />
            <EditStudentModal open={editModalOpen} initialData={selectedStudent} onCancel={() => { setEditModalOpen(false); setSelectedStudent(null); }} onSubmit={handleEditSubmit} />
            <StudentDetailModal open={detailModalOpen} studentData={selectedStudent} onCancel={() => { setDetailModalOpen(false); setSelectedStudent(null); }} />
            <BulkImportModal
                open={importModalOpen}
                onCancel={() => setImportModalOpen(false)}
                onImport={handleBulkImport}
                templateData={studentTemplate}
                title="Nhập danh sách Sinh Viên"
                fileName="Students"
            />
        </div>
    );
};

export default StudentsPage;
