import React, { useState } from 'react';
import { Table, Button, Input, Space, Card, InputNumber, notification, Tag, Typography } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Search } = Input;
const { Text } = Typography;

const GradeEntryPage = () => {
    const [sectionId, setSectionId] = useState('');
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Track edits locally before saving
    const [editingData, setEditingData] = useState({});

    const fetchGrades = async (id = sectionId) => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await api.get(`/grades/section/${id}`);
            const data = response.data?.data || response.data;
            setGrades(data);
            setEditingData({}); // Reset edits on reload
        } catch (error) {
            notification.error({ message: 'Error', description: 'Failed to load grades for this section or section not found.' });
            setGrades([]);
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (recordId, component, value) => {
        setEditingData(prev => ({
            ...prev,
            [recordId]: {
                ...(prev[recordId] || {}),
                [component]: value
            }
        }));
    };

    const handleSaveComponent = async (gradeId, component) => {
        const score = editingData[gradeId]?.[component];
        if (score === undefined || score === null) return;

        try {
            setLoading(true);
            await api.patch(`/grades/${gradeId}/component`, {
                component: component,
                score: score,
                reason: "Teacher updated via portal"
            });
            notification.success({ message: 'Saved', description: `${component} score updated successfully` });
            // Remove from editing state
            setEditingData(prev => {
                const next = { ...prev };
                delete next[gradeId][component];
                if (Object.keys(next[gradeId]).length === 0) delete next[gradeId];
                return next;
            });
            // Refresh to get new total/GPA
            fetchGrades();
        } catch (error) {
            notification.error({ message: 'Update failed', description: `Could not update ${component} score.` });
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'Student', dataIndex: 'studentName', key: 'studentName', width: 200, fixed: 'left' },
        { title: 'Code', dataIndex: 'studentCode', key: 'studentCode', width: 120 },
        {
            title: 'Attendance (10%)',
            dataIndex: 'attendanceScore',
            key: 'attendanceScore',
            render: (val, record) => {
                const isEditing = editingData[record.gradeID]?.Attendance !== undefined;
                const currentVal = isEditing ? editingData[record.gradeID].Attendance : val;
                return (
                    <Space>
                        <InputNumber min={0} max={10} step={0.5} value={currentVal} onChange={v => handleScoreChange(record.gradeID, 'Attendance', v)} />
                        {isEditing && <Button type="primary" size="small" icon={<SaveOutlined />} onClick={() => handleSaveComponent(record.gradeID, 'Attendance')} />}
                    </Space>
                );
            }
        },
        {
            title: 'Midterm (30%)',
            dataIndex: 'midtermScore',
            key: 'midtermScore',
            render: (val, record) => {
                const isEditing = editingData[record.gradeID]?.Midterm !== undefined;
                const currentVal = isEditing ? editingData[record.gradeID].Midterm : val;
                return (
                    <Space>
                        <InputNumber min={0} max={10} step={0.5} value={currentVal} onChange={v => handleScoreChange(record.gradeID, 'Midterm', v)} />
                        {isEditing && <Button type="primary" size="small" icon={<SaveOutlined />} onClick={() => handleSaveComponent(record.gradeID, 'Midterm')} />}
                    </Space>
                );
            }
        },
        {
            title: 'Final (60%)',
            dataIndex: 'finalScore',
            key: 'finalScore',
            render: (val, record) => {
                const isEditing = editingData[record.gradeID]?.Final !== undefined;
                const currentVal = isEditing ? editingData[record.gradeID].Final : val;
                return (
                    <Space>
                        <InputNumber min={0} max={10} step={0.5} value={currentVal} onChange={v => handleScoreChange(record.gradeID, 'Final', v)} />
                        {isEditing && <Button type="primary" size="small" icon={<SaveOutlined />} onClick={() => handleSaveComponent(record.gradeID, 'Final')} />}
                    </Space>
                );
            }
        },
        { 
            title: 'Total', 
            dataIndex: 'totalScore', 
            key: 'totalScore',
            render: (val) => <Text strong>{val?.toFixed(2)}</Text>
        },
        { 
            title: 'Letter', 
            dataIndex: 'letterGrade', 
            key: 'letterGrade',
            render: (val) => {
                let color = 'default';
                if (val === 'A' || val === 'A+') color = 'success';
                if (val === 'F') color = 'error';
                return <Tag color={color}>{val}</Tag>;
            }
        }
    ];

    return (
        <Card title="Grade Entry">
            <div style={{ marginBottom: 20 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    Enter the Section ID to load student grades (e.g. from your assigned sections list):
                </Text>
                <Space>
                    <Search
                        placeholder="Enter Section ID (Guid)"
                        allowClear
                        enterButton="Load Class"
                        size="large"
                        onSearch={(value) => {
                            setSectionId(value);
                            fetchGrades(value);
                        }}
                        style={{ width: 400 }}
                    />
                    <Button size="large" icon={<ReloadOutlined />} onClick={() => fetchGrades()}>Refresh</Button>
                </Space>
            </div>

            {grades.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Subject:</Text> {grades[0]?.subjectName} ({grades[0]?.subjectCode})
                </div>
            )}

            <Table
                columns={columns}
                dataSource={grades}
                rowKey="gradeID"
                loading={loading}
                pagination={false}
                scroll={{ x: 1000 }}
            />
        </Card>
    );
};

export default GradeEntryPage;
