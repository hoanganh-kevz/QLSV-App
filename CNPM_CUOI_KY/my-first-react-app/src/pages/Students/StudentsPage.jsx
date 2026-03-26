import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, Tag, Tooltip, notification, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../services/api';
import StudentModal from './StudentModal';

const { Search } = Input;

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    
    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    const fetchStudents = async (page = 1, pageSize = 10, search = '') => {
        setLoading(true);
        try {
            const response = await api.get('/students', {
                params: {
                    'pageInfo.pageNumber': page,
                    'pageInfo.pageSize': pageSize,
                    searchTerm: search
                }
            });
            const data = response.data?.data || response.data;
            if (data.items) {
                setStudents(data.items);
                setPagination({ ...pagination, current: page, total: data.totalCount || 0 });
            } else if (Array.isArray(data)) {
                setStudents(data);
                setPagination({ ...pagination, total: data.length });
            }
        } catch (error) {
            notification.error({ message: 'Error', description: 'Failed to load students.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes');
            const data = response.data?.data || response.data;
            setClassesList(data.items || data);
        } catch (error) {
            console.error('Failed to fetch classes for dropdown');
        }
    };

    useEffect(() => {
        fetchStudents(pagination.current, pagination.pageSize, searchTerm);
        fetchClasses();
    }, []);

    const handleTableChange = (newPagination) => {
        fetchStudents(newPagination.current, newPagination.pageSize, searchTerm);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        fetchStudents(1, pagination.pageSize, value);
    };

    const handleAdd = () => {
        setCurrentStudent(null);
        setIsModalVisible(true);
    };

    const handleEdit = (student) => {
        setCurrentStudent(student);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Student',
            content: 'Are you sure you want to delete this student?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await api.delete(`/students/${id}`);
                    notification.success({ message: 'Success', description: 'Student deleted successfully' });
                    fetchStudents(pagination.current, pagination.pageSize, searchTerm);
                } catch (error) {
                    notification.error({ message: 'Error', description: 'Failed to delete student' });
                }
            }
        });
    };

    const handleSave = async (values) => {
        setModalLoading(true);
        try {
            if (currentStudent) {
                const id = currentStudent.id || currentStudent.studentId;
                await api.put(`/students/${id}`, values);
                notification.success({ message: 'Success', description: 'Student updated successfully' });
            } else {
                await api.post('/students', values);
                notification.success({ message: 'Success', description: 'Student created successfully' });
            }
            setIsModalVisible(false);
            fetchStudents(pagination.current, pagination.pageSize, searchTerm);
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || error.message;
            notification.error({ message: 'Error', description: typeof msg === 'string' ? msg : 'Failed to save student' });
        } finally {
            setModalLoading(false);
        }
    };

    const columns = [
        { title: 'Code', dataIndex: 'studentCode', key: 'studentCode', width: '10%' },
        { title: 'Full Name', dataIndex: 'fullName', key: 'fullName', sorter: (a, b) => a.fullName.localeCompare(b.fullName), width: '20%' },
        { title: 'Email', dataIndex: 'email', key: 'email', width: '20%' },
        { title: 'Class', dataIndex: 'className', key: 'class', width: '15%' },
        {
            title: 'Status', dataIndex: 'status', key: 'status', width: '15%', render: (status) => {
                const color = status === 'Active' ? 'green' : (status === 'Graduated' ? 'blue' : 'red');
                return <Tag color={color}>{status || 'Active'}</Tag>;
            }
        },
        {
            title: 'Actions', key: 'actions', width: '20%', render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details"><Button type="default" shape="circle" icon={<EyeOutlined />} /></Tooltip>
                    <Tooltip title="Edit"><Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} /></Tooltip>
                    <Tooltip title="Delete"><Button type="primary" danger shape="circle" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id || record.studentId)} /></Tooltip>
                </Space>
            )
        }
    ];

    return (
        <Card title="Student Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Student</Button>}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Search placeholder="Search by name, code or email" allowClear onSearch={handleSearch} style={{ width: 300 }} />
            </div>
            <Table
                columns={columns}
                dataSource={students}
                rowKey={(record) => record.id || record.studentId || record.studentCode}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                scroll={{ x: 800 }}
            />
            <StudentModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSave={handleSave}
                loading={modalLoading}
                studentData={currentStudent}
                classesList={classesList}
            />
        </Card>
    );
};

export default StudentsPage;
