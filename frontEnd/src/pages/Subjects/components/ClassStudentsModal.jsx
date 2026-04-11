import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Typography, Button, Space } from 'antd';
import { UserOutlined, FileExcelOutlined } from '@ant-design/icons';
import { studentService } from '../../../services/studentService';
import { exportService } from '../../../services/exportService';
import { useTranslation } from '../../../hooks/useTranslation';

const { Text, Title } = Typography;

const ClassStudentsModal = ({ open, onCancel, classStr }) => {
    const { t } = useTranslation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && classStr) {
            fetchStudents();
        }
    }, [open, classStr]);

    const fetchStudents = async () => {
        setLoading(true);
        const res = await studentService.getAllStudents();
        if (res.success) {
            // Filter by class
            const filtered = res.data.filter(s => s.class?.name === classStr || s.class === classStr);
            setStudents(filtered);
        }
        setLoading(false);
    };

    const columns = [
        {
            title: t('students.id'),
            dataIndex: 'mssv',
            key: 'mssv',
            width: 120,
        },
        {
            title: t('students.fullName'),
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: t('teachers.gender'),
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
            render: (gender) => t(`teachers.gender.${gender?.toLowerCase()}`) || gender
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                    {(status ? t(`teachers.status.${status.toLowerCase()}`) : status || '').toUpperCase()}
                </Tag>
            )
        }
    ];

    return (
        <Modal
            title={
                <Space>
                    <UserOutlined />
                    <span>{t('subjects.classStudents').replace('{{class}}', classStr)}</span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>{t('common.close')}</Button>,
                <Button
                    key="export"
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={() => exportService.exportToExcel(students, `Students_Class_${classStr}`)}
                    disabled={students.length === 0}
                >
                    {t('subjects.exportList')}
                </Button>
            ]}
            width={700}
        >
            <Table
                columns={columns}
                dataSource={students}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                size="middle"
                locale={{ emptyText: t('subjects.noStudents') }}
            />
        </Modal>
    );
};

export default ClassStudentsModal;
