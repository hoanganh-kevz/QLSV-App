import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, notification, Modal, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import SubjectModal from './SubjectModal';

const { Search } = Input;

const SubjectsPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [currentSubject, setCurrentSubject] = useState(null);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await api.get('/subjects');
            const data = response.data?.data || response.data;
            setSubjects(data.items || data);
        } catch (error) {
            notification.error({ message: 'Error', description: 'Failed to load subjects.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchSubjects(); 
    }, []);

    const handleAdd = () => {
        setCurrentSubject(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setCurrentSubject(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Subject',
            content: 'Are you sure you want to delete this subject?',
            onOk: async () => {
                try {
                    await api.delete(`/subjects/${id}`);
                    notification.success({ message: 'Success', description: 'Subject deleted successfully' });
                    fetchSubjects();
                } catch (error) {
                    notification.error({ message: 'Error', description: 'Failed to delete subject' });
                }
            }
        });
    };

    const handleSave = async (values) => {
        setModalLoading(true);
        try {
            if (currentSubject) {
                const id = currentSubject.id || currentSubject.subjectId;
                await api.put(`/subjects/${id}`, values);
                notification.success({ message: 'Success', description: 'Subject updated' });
            } else {
                await api.post('/subjects', values);
                notification.success({ message: 'Success', description: 'Subject created' });
            }
            setIsModalVisible(false);
            fetchSubjects();
        } catch (error) {
            notification.error({ message: 'Error', description: 'Failed to save subject' });
        } finally {
            setModalLoading(false);
        }
    };

    const columns = [
        { title: 'Code', dataIndex: 'subjectCode', key: 'subjectCode' },
        { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName' },
        { title: 'Credits', dataIndex: 'credits', key: 'credits' },
        { 
            title: 'Type', dataIndex: 'type', key: 'type', 
            render: (type) => (
                <Tag color={type === 'Core' ? 'blue' : (type === 'Elective' ? 'green' : 'default')}>
                    {type}
                </Tag>
            )
        },
        {
            title: 'Actions', key: 'actions', render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id || record.subjectId)} />
                </Space>
            )
        }
    ];

    return (
        <Card title="Subject Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Subject</Button>}>
            <Search placeholder="Search subjects" allowClear style={{ width: 300, marginBottom: 16 }} />
            <Table columns={columns} dataSource={subjects} rowKey={(val) => val.id || val.subjectId} loading={loading} />
            <SubjectModal 
                visible={isModalVisible} 
                onCancel={() => setIsModalVisible(false)} 
                onSave={handleSave} 
                loading={modalLoading} 
                subjectData={currentSubject} 
            />
        </Card>
    );
};

export default SubjectsPage;
