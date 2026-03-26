import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, notification, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../services/api';
import ClassModal from './ClassModal';

const { Search } = Input;

const ClassesPage = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [currentClass, setCurrentClass] = useState(null);

    const fetchClasses = async (search = '') => {
        setLoading(true);
        try {
            const response = await api.get('/classes', { params: { searchTerm: search } });
            const data = response.data?.data || response.data;
            setClasses(data.items || data);
        } catch (error) {
            notification.error({ message: 'Error', description: 'Failed to load classes.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/teachers');
            const data = response.data?.data || response.data;
            setTeachers(data.items || data);
        } catch (error) {
            console.error('Failed to load teachers');
        }
    }

    useEffect(() => { 
        fetchClasses(); 
        fetchTeachers();
    }, []);

    const handleAdd = () => {
        setCurrentClass(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setCurrentClass(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Class',
            content: 'Are you sure you want to delete this class?',
            onOk: async () => {
                try {
                    await api.delete(`/classes/${id}`);
                    notification.success({ message: 'Success', description: 'Class deleted successfully' });
                    fetchClasses(searchTerm);
                } catch (error) {
                    notification.error({ message: 'Error', description: 'Failed to delete class' });
                }
            }
        });
    };

    const handleSave = async (values) => {
        setModalLoading(true);
        try {
            if (currentClass) {
                const id = currentClass.id || currentClass.classId;
                await api.put(`/classes/${id}`, values);
                notification.success({ message: 'Success', description: 'Class updated' });
            } else {
                await api.post('/classes', values);
                notification.success({ message: 'Success', description: 'Class created' });
            }
            setIsModalVisible(false);
            fetchClasses(searchTerm);
        } catch (error) {
            notification.error({ message: 'Error', description: 'Failed to save class' });
        } finally {
            setModalLoading(false);
        }
    };

    const columns = [
        { title: 'Class Name', dataIndex: 'className', key: 'className' },
        { title: 'Grade', dataIndex: 'grade', key: 'grade' },
        { title: 'Academic Year', dataIndex: 'academicYear', key: 'academicYear' },
        { title: 'Teacher ID', dataIndex: 'teacherId', key: 'teacherId' },
        {
            title: 'Actions', key: 'actions', render: (_, record) => (
                <Space size="middle">
                    <Button type="default" shape="circle" icon={<EyeOutlined />} />
                    <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id || record.classId)} />
                </Space>
            )
        }
    ];

    return (
        <Card title="Class Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Class</Button>}>
            <Search placeholder="Search classes" allowClear onSearch={(v) => fetchClasses(v)} style={{ width: 300, marginBottom: 16 }} />
            <Table columns={columns} dataSource={classes} rowKey={(val) => val.id || val.classId} loading={loading} />
            <ClassModal 
                visible={isModalVisible} 
                onCancel={() => setIsModalVisible(false)} 
                onSave={handleSave} 
                loading={modalLoading} 
                classData={currentClass} 
                teachersList={teachers} 
            />
        </Card>
    );
};
export default ClassesPage;
