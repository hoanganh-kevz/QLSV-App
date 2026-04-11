import React, { useState } from 'react';
import { Modal, Tabs, Avatar, Tag, Button, Row, Col } from 'antd';
import { UserOutlined, PrinterOutlined } from '@ant-design/icons';
import { exportService } from '../../../services/exportService';
import { useTranslation } from '../../../hooks/useTranslation';

const InfoItem = ({ label, value }) => (
    <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500, wordBreak: 'break-word' }}>{value || 'N/A'}</div>
    </div>
);

const StudentDetailModal = ({ open, onCancel, studentData }) => {
    const { t } = useTranslation();
    const [exportLoading, setExportLoading] = useState(false);

    if (!studentData) return null;

    const handleExportPDF = async () => {
        setExportLoading(true);
        await exportService.exportToPDF();
        setExportLoading(false);
    };

    const items = [
        {
            key: '1',
            label: t('students.personalInfo'),
            children: (
                <Row gutter={[24, 0]}>
                    <Col xs={24} sm={8}>
                        <InfoItem label={t('students.id')} value={studentData.mssv} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label={t('students.fullName')} value={studentData.fullName} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label={t('students.email')} value={studentData.email} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label={t('students.phone')} value={studentData.phone} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label="Trường thành viên" value={studentData.class?.major?.faculty?.college?.name || 'N/A'} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label="Khoa trực thuộc" value={studentData.class?.major?.faculty?.name || 'N/A'} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label={t('students.major')} value={studentData.class?.major?.name || 'N/A'} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label={t('students.class')} value={studentData.class?.name || studentData.class} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label={t('teachers.gender')} value={studentData.gender ? t(`teachers.gender.${studentData.gender.toLowerCase()}`) : studentData.gender} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label={t('teachers.dob')} value={studentData.dob ? new Date(studentData.dob).toLocaleDateString(t('settings.language') === 'Vietnamese' ? 'vi-VN' : 'en-US') : 'N/A'} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <InfoItem label={t('teachers.address')} value={studentData.address} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('common.status')}</div>
                            <Tag color={studentData.status === 'Active' ? 'green' : studentData.status === 'Inactive' ? 'red' : 'blue'} style={{ fontSize: '13px', padding: '2px 12px' }}>
                                {t(`teachers.status.${studentData.status === 'Active' ? 'active' : studentData.status === 'Inactive' ? 'inactive' : 'graduated'}`).toUpperCase()}
                            </Tag>
                        </div>
                    </Col>
                </Row>
            ),
        },
        {
            key: '2',
            label: t('students.academicInfo'),
            children: <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>{t('students.academicDesc')}</div>,
        },
        {
            key: '3',
            label: t('students.historyLogs'),
            children: <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>{t('students.historyDesc')}</div>,
        },
    ];

    return (
        <Modal
            title={`${t('students.detailTitle')}: ${studentData.fullName}`}
            open={open}
            onCancel={onCancel}
            width={700}
            footer={[
                <Button key="print" icon={<PrinterOutlined />} onClick={handleExportPDF} loading={exportLoading} style={{ float: 'left', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
                    {t('common.exportPDF')}
                </Button>,
                <Button key="close" type="primary" onClick={onCancel}>
                    {t('common.close')}
                </Button>
            ]}
        >
            {/* Header card */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 20,
                marginTop: 12,
                padding: '16px 20px',
                background: 'rgba(0, 90, 81, 0.05)',
                borderRadius: '12px'
            }}>
                <Avatar size={52} icon={<UserOutlined />} src={studentData.avatarUrl} style={{ marginRight: 16, flexShrink: 0 }} />
                <div>
                    <h3 style={{ margin: 0, color: '#1a1a2e', fontWeight: 700, fontSize: '16px' }}>{studentData.fullName}</h3>
                    <div style={{ color: '#8c8c8c', fontSize: '13px' }}>
                        {studentData.mssv} • {studentData.class?.name || studentData.class} • {studentData.class?.batch || 'N/A'}
                    </div>
                </div>
            </div>

            <Tabs defaultActiveKey="1" items={items} />
        </Modal>
    );
};

export default StudentDetailModal;
