import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Select, Input, Button, Space, Typography, Divider,
    Tag, Radio, InputNumber, Alert, Popconfirm, message
} from 'antd';
import {
    EditOutlined, CalendarOutlined, VideoCameraOutlined,
    StopOutlined, FileTextOutlined, DeleteOutlined, UndoOutlined
} from '@ant-design/icons';
import { teacherService } from '../../services/teacherService';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DAYS = [
    { label: 'Thứ 2', value: 2 },
    { label: 'Thứ 3', value: 3 },
    { label: 'Thứ 4', value: 4 },
    { label: 'Thứ 5', value: 5 },
    { label: 'Thứ 6', value: 6 },
    { label: 'Thứ 7', value: 7 },
    { label: 'Chủ nhật', value: 8 },
];

const PERIODS = Array.from({ length: 18 }, (_, i) => i + 1);

const OVERRIDE_TYPES = [
    {
        value: 'reschedule',
        label: 'Đổi lịch',
        icon: <CalendarOutlined />,
        color: 'orange',
        description: 'Dời buổi học sang thứ/tiết/phòng khác trong tuần này'
    },
    {
        value: 'online',
        label: 'Chuyển online',
        icon: <VideoCameraOutlined />,
        color: 'blue',
        description: 'Chuyển buổi học tuần này sang hình thức trực tuyến'
    },
    {
        value: 'cancelled',
        label: 'Hủy buổi',
        icon: <StopOutlined />,
        color: 'red',
        description: 'Hủy buổi học trong tuần này (nghỉ không dạy bù)'
    },
    {
        value: 'custom',
        label: 'Ghi chú khác',
        icon: <FileTextOutlined />,
        color: 'purple',
        description: 'Thêm ghi chú đặc biệt cho buổi học tuần này'
    },
];

const WeeklyOverrideModal = ({
    open,
    onClose,
    onSuccess,
    section,    // ClassSection object
    week,       // số tuần
    termId,     // ID học kỳ
    existingOverride  // override hiện tại (nếu đã có)
}) => {
    const [form] = Form.useForm();
    const [overrideType, setOverrideType] = useState('reschedule');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (open) {
            if (existingOverride) {
                setOverrideType(existingOverride.overrideType);
                form.setFieldsValue({
                    overrideType: existingOverride.overrideType,
                    dayOfWeek: existingOverride.schedule?.[0]?.dayOfWeek,
                    startPeriod: existingOverride.schedule?.[0]?.startPeriod,
                    endPeriod: existingOverride.schedule?.[0]?.endPeriod,
                    room: existingOverride.schedule?.[0]?.room || existingOverride.room,
                    note: existingOverride.note,
                });
            } else {
                setOverrideType('reschedule');
                form.resetFields();
                form.setFieldsValue({ overrideType: 'reschedule' });
            }
        }
    }, [open, existingOverride, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const payload = {
                week,
                termId,
                overrideType: values.overrideType,
                note: values.note,
            };

            if (values.overrideType === 'reschedule') {
                payload.schedule = [{
                    dayOfWeek: values.dayOfWeek,
                    startPeriod: values.startPeriod,
                    endPeriod: values.endPeriod,
                    room: values.room || section?.schedule?.[0]?.room || 'TBA',
                }];
            } else if (values.overrideType === 'online') {
                payload.teachingMethod = 'Trực tuyến';
                payload.note = values.note;
            }

            let res;
            if (existingOverride) {
                res = await teacherService.updateWeeklyOverride(section._id, week, payload);
            } else {
                res = await teacherService.createWeeklyOverride(section._id, payload);
            }

            if (res.success) {
                message.success('Đã lưu tùy chỉnh tuần thành công!');
                onSuccess?.();
                onClose();
            } else {
                message.error(res.message || 'Lưu thất bại');
            }
        } catch (err) {
            if (err?.errorFields) return; // validation error
            message.error('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        const res = await teacherService.deleteWeeklyOverride(section._id, week);
        setDeleting(false);
        if (res.success) {
            message.success('Đã xóa tùy chỉnh, khôi phục về lịch gốc');
            onSuccess?.();
            onClose();
        } else {
            message.error(res.message || 'Xóa thất bại');
        }
    };

    const selectedType = OVERRIDE_TYPES.find(t => t.value === overrideType);

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <EditOutlined style={{ color: '#6366f1', fontSize: 18 }} />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>
                            Tùy chỉnh lịch — Tuần {week}
                        </div>
                        <div style={{ fontWeight: 400, fontSize: 13, color: '#64748b' }}>
                            {section?.subject?.name} • {section?.code}
                        </div>
                    </div>
                </div>
            }
            footer={null}
            width={580}
            styles={{ body: { padding: '16px 24px 8px' } }}
        >
            {/* Lịch gốc */}
            {section?.schedule?.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap'
                }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>📋 Lịch gốc:</Text>
                    {section.schedule.map((s, idx) => (
                        <Tag key={idx} color="default" style={{ fontSize: 12, margin: 2 }}>
                            {DAYS.find(d => d.value === s.dayOfWeek)?.label} • Tiết {s.startPeriod}–{s.endPeriod} • {s.room}
                        </Tag>
                    ))}
                </div>
            )}

            {existingOverride && (
                <Alert
                    type="warning"
                    showIcon
                    message={`Tuần ${week} đã có tùy chỉnh: ${OVERRIDE_TYPES.find(t => t.value === existingOverride.overrideType)?.label}`}
                    style={{ marginBottom: 14, borderRadius: 8 }}
                />
            )}

            <Form form={form} layout="vertical" requiredMark={false}>
                {/* Loại thay đổi */}
                <Form.Item name="overrideType" label="Loại thay đổi" rules={[{ required: true }]}>
                    <Radio.Group
                        onChange={e => {
                            setOverrideType(e.target.value);
                            form.setFieldValue('overrideType', e.target.value);
                        }}
                        style={{ width: '100%' }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {OVERRIDE_TYPES.map(type => (
                                <Radio.Button
                                    key={type.value}
                                    value={type.value}
                                    style={{
                                        height: 'auto',
                                        padding: '10px 14px',
                                        borderRadius: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        textAlign: 'left',
                                        lineHeight: '1.4',
                                        border: overrideType === type.value ? `2px solid` : '1px solid #d1d5db',
                                        borderColor: overrideType === type.value
                                            ? (type.color === 'orange' ? '#f97316' : type.color === 'blue' ? '#3b82f6' : type.color === 'red' ? '#ef4444' : '#a855f7')
                                            : '#d1d5db',
                                        background: overrideType === type.value ? '#f8fafc' : '#fff',
                                    }}
                                >
                                    <span style={{ marginRight: 4 }}>{type.icon}</span>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{type.label}</span>
                                </Radio.Button>
                            ))}
                        </div>
                    </Radio.Group>
                </Form.Item>

                {selectedType && (
                    <div style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: 8,
                        padding: '8px 12px',
                        marginBottom: 16,
                        fontSize: 13,
                        color: '#1e40af'
                    }}>
                        ℹ️ {selectedType.description}
                    </div>
                )}

                <Divider style={{ margin: '12px 0' }} />

                {/* Đổi lịch */}
                {overrideType === 'reschedule' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <Form.Item name="dayOfWeek" label="Thứ mới" rules={[{ required: true, message: 'Chọn thứ' }]}>
                                <Select placeholder="Chọn thứ">
                                    {DAYS.map(d => <Option key={d.value} value={d.value}>{d.label}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="startPeriod" label="Tiết bắt đầu" rules={[{ required: true, message: 'Nhập tiết' }]}>
                                <Select placeholder="Tiết BD">
                                    {PERIODS.map(p => <Option key={p} value={p}>Tiết {p}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="endPeriod" label="Tiết kết thúc" rules={[{ required: true, message: 'Nhập tiết' }]}>
                                <Select placeholder="Tiết KT">
                                    {PERIODS.map(p => <Option key={p} value={p}>Tiết {p}</Option>)}
                                </Select>
                            </Form.Item>
                        </div>
                        <Form.Item name="room" label="Phòng học mới">
                            <Input placeholder={`Phòng hiện tại: ${section?.schedule?.[0]?.room || 'TBA'}`} />
                        </Form.Item>
                    </>
                )}

                {/* Chuyển online */}
                {overrideType === 'online' && (
                    <Form.Item name="note" label="Link học trực tuyến / Ghi chú">
                        <TextArea
                            placeholder="VD: https://meet.google.com/xxx hoặc ghi chú cho sinh viên"
                            rows={3}
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>
                )}

                {/* Hủy buổi */}
                {overrideType === 'cancelled' && (
                    <Alert
                        type="error"
                        showIcon
                        icon={<StopOutlined />}
                        message="Buổi học tuần này sẽ bị HỦY"
                        description="Sinh viên sẽ thấy buổi này bị đánh dấu 'Đã hủy tuần này'. Hành động này có thể hoàn tác bằng cách xóa tùy chỉnh."
                        style={{ borderRadius: 8, marginBottom: 8 }}
                    />
                )}

                {/* Ghi chú (luôn hiện trừ online đã có) */}
                {overrideType !== 'online' && (
                    <Form.Item name="note" label={overrideType === 'cancelled' ? 'Lý do hủy (tùy chọn)' : 'Ghi chú cho sinh viên'}>
                        <TextArea
                            placeholder="Ghi chú thêm cho sinh viên..."
                            rows={2}
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>
                )}

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        {existingOverride && (
                            <Popconfirm
                                title="Xóa tùy chỉnh tuần này?"
                                description="Lịch học sẽ khôi phục về mặc định."
                                onConfirm={handleDelete}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    danger
                                    icon={<UndoOutlined />}
                                    loading={deleting}
                                    style={{ borderRadius: 8 }}
                                >
                                    Khôi phục lịch gốc
                                </Button>
                            </Popconfirm>
                        )}
                    </div>
                    <Space>
                        <Button onClick={onClose} style={{ borderRadius: 8 }}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            loading={saving}
                            onClick={handleSave}
                            style={{
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                fontWeight: 600
                            }}
                        >
                            {existingOverride ? 'Cập nhật tùy chỉnh' : 'Lưu tùy chỉnh'}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );
};

export default WeeklyOverrideModal;
