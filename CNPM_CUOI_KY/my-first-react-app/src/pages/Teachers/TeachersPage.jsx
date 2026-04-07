import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, notification, Modal, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Search } = Input;

const TeacherModal = ({ visible, onCancel, onSave, loading, teacherData }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && teacherData) {
            form.setFieldsValue(teacherData);
        } else if (visible && !teacherData) {
            form.resetFields();
        }
    }, [visible, teacherData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSave(values);
        } catch (error) {}
    };

    return (
        <Modal 
            title={teacherData ? "Edit Teacher" : "Add New Teacher"} 
            open={visible} 
            onOk={handleSubmit} 
            onCancel={onCancel} 
            confirmLoading={loading} 
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                <Form.Item name="department" label="Department"><Input /></Form.Item>
            </Form>
        </Modal>
    );
};

const TeachersPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/teachers');
            const data = response.data?.data || response.data;
            setTeachers(data.items || data);
        } catch (error) {
            notification.error({ message: 'Error', description: 'Failed to load teachers.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeachers(); }, []);

    const handleAdd = () => { setCurrentTeacher(null); setIsModalVisible(true); };
    const handleEdit = (record) => { setCurrentTeacher(record); setIsModalVisible(true); };
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Teacher',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await api.delete(`/teachers/${id}`);
                    notification.success({ message: 'Success' });
                    fetchTeachers();
                } catch { notification.error({ message: 'Error' }); }
            }
        });
    };

    const handleSave = async (values) => {
        setModalLoading(true);
        try {
            if (currentTeacher) {
                await api.put(`/teachers/${currentTeacher.id || currentTeacher.teacherId}`, values);
            } else {
                await api.post('/teachers', values);
            }
            notification.success({ message: 'Success' });
            setIsModalVisible(false);
            fetchTeachers();
        } catch {
            notification.error({ message: 'Error' });
        } finally { setModalLoading(false); }
    };

    const columns = [
        { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Department', dataIndex: 'department', key: 'department' },
        {
            title: 'Actions', key: 'actions', render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id || record.teacherId)} />
                </Space>
            )
        }
    ];

    return (
        <Card title="Teacher Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Teacher</Button>}>
            <Search placeholder="Search teachers" allowClear style={{ width: 300, marginBottom: 16 }} />
            <Table columns={columns} dataSource={teachers} rowKey={(val) => val.id || val.teacherId} loading={loading} />
            <TeacherModal 
                visible={isModalVisible} 
                onCancel={() => setIsModalVisible(false)} 
                onSave={handleSave} 
                loading={modalLoading} 
                teacherData={currentTeacher} 
            />
        </Card>
    );
};

export default TeachersPage;
