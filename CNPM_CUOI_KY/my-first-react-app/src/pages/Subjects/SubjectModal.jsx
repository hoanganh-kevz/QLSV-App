import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';

const { Option } = Select;

const SubjectModal = ({ visible, onCancel, onSave, loading, subjectData }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && subjectData) {
            form.setFieldsValue(subjectData);
        } else if (visible && !subjectData) {
            form.resetFields();
            form.setFieldsValue({ credits: 3, type: 'Core' });
        }
    }, [visible, subjectData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSave(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={subjectData ? "Edit Subject" : "Add New Subject"}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="subjectCode"
                    label="Subject Code"
                    rules={[{ required: true, message: 'Please enter subject code' }]}
                >
                    <Input placeholder="e.g. IT001" />
                </Form.Item>
                <Form.Item
                    name="subjectName"
                    label="Subject Name"
                    rules={[{ required: true, message: 'Please enter subject name' }]}
                >
                    <Input placeholder="e.g. Introduction to Programming" />
                </Form.Item>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="credits" label="Credits" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <InputNumber min={1} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="type" label="Type" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <Select>
                            <Option value="Core">Core</Option>
                            <Option value="Elective">Elective</Option>
                            <Option value="Language">Language</Option>
                        </Select>
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default SubjectModal;
