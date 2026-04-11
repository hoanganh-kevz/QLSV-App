import React, { useState } from 'react';
import { Modal, Tabs, Avatar, Tag, Button, Row, Col, Table, Select } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { showSuccess } from '../../../components/common/SuccessMessage/SuccessMessage';
import { useTranslation } from '../../../hooks/useTranslation';

const { Option } = Select;

const InfoItem = ({ label, value }) => (
    <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500, wordBreak: 'break-word', minHeight: '21px' }}>{value || 'N/A'}</div>
    </div>
);

const TeacherDetailModal = ({ open, onCancel, teacherData }) => {
    const { t } = useTranslation();
    const [assignMode, setAssignMode] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);

    if (!teacherData) return null;

    const handleAssign = () => {
        if (!selectedClass || !selectedSubject) return;
        // In a real app, you would call an API here
        showSuccess(`Successfully assigned ${teacherData.fullName} to ${selectedClass} for ${selectedSubject}`);
        setAssignMode(false);
        setSelectedClass(null);
        setSelectedSubject(null);
    };

    const mockClasses = [
        { id: 'c1', name: 'IS01', subject: 'Database Systems', semester: 'HK1-2024' },
        { id: 'c2', name: 'IS02', subject: 'System Analysis', semester: 'HK1-2024' },
    ];

    const classColumns = [
        { title: 'Class', dataIndex: 'name', key: 'name' },
        { title: 'Subject', dataIndex: 'subject', key: 'subject' },
        { title: 'Semester', dataIndex: 'semester', key: 'semester' },
    ];

    const items = [
        {
            key: '1',
            label: 'Personal Information',
            children: (
                <Row gutter={[24, 0]}>
                    <Col xs={24} sm={12}>
                        <InfoItem label={t('teachers.teacherId')} value={teacherData.teacherId} />
                    </Col>
                    <Col xs={24} sm={12}>
                        <InfoItem label={t('teachers.fullName')} value={teacherData.fullName} />
                    </Col>
                    <Col xs={24} sm={12}>
                        <InfoItem label={t('teachers.email')} value={teacherData.email} />
                    </Col>
                    <Col xs={24} sm={12}>
                        <InfoItem label={t('teachers.phone')} value={teacherData.phone} />
                    </Col>
                    <Col xs={24} sm={12}>
                        <InfoItem label="Trường" value={teacherData.college?.name || teacherData.college} />
                    </Col>
                    <Col xs={24} sm={12}>
                        <InfoItem label="Khoa" value={teacherData.faculty?.name || teacherData.faculty} />
                    </Col>
                    <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('common.status')}</div>
                            <Tag color={teacherData.status === 'Active' ? 'green' : teacherData.status === 'Inactive' ? 'red' : 'orange'} style={{ fontSize: '13px', padding: '2px 12px' }}>
                                {t(`teachers.status.${teacherData.status === 'Active' ? 'active' : teacherData.status === 'Inactive' ? 'inactive' : 'onLeave'}`)}
                            </Tag>
                        </div>
                    </Col>
                </Row>
            ),
        },
        {
            key: '2',
            label: 'Classes & Subjects Taught',
            children: (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h4 style={{ margin: 0 }}>{t('users.assignments')}</h4>
                        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setAssignMode(!assignMode)}>
                            {assignMode ? t('common.cancel') : t('teachers.assign')}
                        </Button>
                    </div>

                    {assignMode && (
                        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 150 }}>
                                <div style={{ fontSize: 12, marginBottom: 4 }}>{t('common.selectClass')}</div>
                                <Select style={{ width: '100%' }} value={selectedClass} onChange={setSelectedClass} placeholder="e.g. IS01">
                                    <Option value="IS01">IS01</Option>
                                    <Option value="IS02">IS02</Option>
                                    <Option value="IS03">IS03</Option>
                                </Select>
                            </div>
                            <div style={{ flex: 1, minWidth: 150 }}>
                                <div style={{ fontSize: 12, marginBottom: 4 }}>{t('common.selectSubject')}</div>
                                <Select style={{ width: '100%' }} value={selectedSubject} onChange={setSelectedSubject} placeholder="e.g. IT101">
                                    <Option value="Database Systems">Database Systems</Option>
                                    <Option value="Web Development">Web Development</Option>
                                    <Option value="Mathematics">Mathematics</Option>
                                </Select>
                            </div>
                            <Button type="primary" onClick={handleAssign} disabled={!selectedClass || !selectedSubject}>{t('teachers.save')}</Button>
                        </div>
                    )}

                    <Table
                        columns={classColumns}
                        dataSource={teacherData.classes || mockClasses}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        bordered
                    />
                </div>
            ),
        },
    ];

    return (
        <Modal
            title={`Teacher Detail: ${teacherData.fullName}`}
            open={open}
            onCancel={() => {
                setAssignMode(false);
                onCancel();
            }}
            width={700}
            footer={[
                <Button key="close" type="primary" onClick={() => { setAssignMode(false); onCancel(); }}>
                    {t('common.close')}
                </Button>
            ]}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 20,
                marginTop: 12,
                padding: '16px 20px',
                background: 'rgba(0, 90, 81, 0.05)',
                borderRadius: '12px'
            }}>
                <Avatar size={52} icon={<UserOutlined />} src={teacherData.avatarUrl} style={{ marginRight: 16, flexShrink: 0 }} />
                <div>
                    <h3 style={{ margin: 0, color: '#1a1a2e', fontWeight: 700, fontSize: '16px' }}>{teacherData.fullName}</h3>
                    <div style={{ color: '#8c8c8c', fontSize: '13px' }}>
                        {teacherData.teacherId} • {teacherData.college?.name || teacherData.college} • {teacherData.faculty?.name || teacherData.faculty}
                    </div>
                </div>
            </div>

            <Tabs defaultActiveKey="1" items={items} />
        </Modal >
    );
};

export default TeacherDetailModal;
