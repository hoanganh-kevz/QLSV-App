import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Radio } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const StudentModal = ({ visible, onCancel, onSave, loading, studentData, classesList }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && studentData) {
            form.setFieldsValue({
                ...studentData,
                dateOfBirth: studentData.dateOfBirth ? dayjs(studentData.dateOfBirth) : null
            });
        } else if (visible && !studentData) {
            form.resetFields();
            form.setFieldsValue({ gender: 'Male', status: 'Active' });
        }
    }, [visible, studentData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Format date to ISO string for backend
            if (values.dateOfBirth) {
                values.dateOfBirth = values.dateOfBirth.format('YYYY-MM-DD');
            }
            onSave(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={studentData ? "Edit Student" : "Add New Student"}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            width={600}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="fullName"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter full name' }]}
                >
                    <Input placeholder="John Doe" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Please enter email' },
                        { type: 'email', message: 'Please enter a valid email' }
                    ]}
                >
                    <Input placeholder="john@example.com" />
                </Form.Item>
                <Form.Item name="phone" label="Phone">
                    <Input placeholder="+1234567890" />
                </Form.Item>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="dateOfBirth" label="Date of Birth" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="gender" label="Gender" style={{ flex: 1 }}>
                        <Radio.Group>
                            <Radio value="Male">Male</Radio>
                            <Radio value="Female">Female</Radio>
                            <Radio value="Other">Other</Radio>
                        </Radio.Group>
                    </Form.Item>
                </div>
                <Form.Item name="address" label="Address">
                    <Input.TextArea rows={2} placeholder="123 Main St" />
                </Form.Item>
                <Form.Item
                    name="classId"
                    label="Class"
                    rules={[{ required: true, message: 'Please select a class' }]}
                >
                    <Select placeholder="Select Class">
                        {classesList?.map(c => (
                            <Option key={c.classId || c.id} value={c.classId || c.id}>{c.className}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="status" label="Status">
                     <Select>
                        <Option value="Active">Active</Option>
                        <Option value="Graduated">Graduated</Option>
                        <Option value="Suspended">Suspended</Option>
                        <Option value="Dropped">Dropped Out</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StudentModal;
