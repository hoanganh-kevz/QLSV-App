import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';

const { Option } = Select;

const ClassModal = ({ visible, onCancel, onSave, loading, classData, teachersList }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && classData) {
            form.setFieldsValue(classData);
        } else if (visible && !classData) {
            form.resetFields();
            form.setFieldsValue({ academicYear: '2024-2025', grade: 10 });
        }
    }, [visible, classData, form]);

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
            title={classData ? "Edit Class" : "Add New Class"}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="className"
                    label="Class Name"
                    rules={[{ required: true, message: 'Please enter class name' }]}
                >
                    <Input placeholder="e.g. 10A1" />
                </Form.Item>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="grade" label="Grade" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <InputNumber min={1} max={12} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="academicYear" label="Academic Year" style={{ flex: 1 }} rules={[{ required: true }]}>
                        <Input placeholder="2024-2025" />
                    </Form.Item>
                </div>
                <Form.Item
                    name="teacherId"
                    label="Homeroom Teacher"
                >
                    <Select placeholder="Select Teacher" allowClear>
                        {teachersList?.map(t => (
                            <Option key={t.id || t.teacherId} value={t.id || t.teacherId}>{t.fullName}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ClassModal;
