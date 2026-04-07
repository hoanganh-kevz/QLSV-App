import React, { useState, useEffect } from 'react';
import { Table, Card, Spin, Alert, Typography, Descriptions, Tag, List } from 'antd';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { Title, Text } = Typography;

const TranscriptPage = () => {
    const { user } = useAuth();
    const [transcript, setTranscript] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTranscript = async () => {
            // Because the frontend mock didn't capture the exact ID format in some contexts,
            // we will query relying on the backend to enforce the identity context if possible.
            // But since the API demands /{studentId}, we must pass user.id. 
            // Make sure the mock user or real user has the correct ID.
            if (!user?.id) {
                setError("Unable to determine student ID for the current logged-in user.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/grades/transcript/${user.id}`);
                const data = response.data?.data || response.data;
                setTranscript(data);
            } catch (err) {
                setError('Failed to load semantic transcript details. Or you are not a valid student.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTranscript();
    }, [user]);

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    if (error) return <Alert message={error} type="error" showIcon style={{ margin: 24 }} />;
    if (!transcript) return <Alert message="No transcript data found" type="info" style={{ margin: 24 }} />;

    const columns = [
        { title: 'Subject Code', dataIndex: 'subjectCode', key: 'subjectCode' },
        { title: 'Subject Name', dataIndex: 'subjectName', key: 'subjectName' },
        { title: 'Credits', dataIndex: 'credits', key: 'credits' },
        { title: 'Att. (10%)', dataIndex: 'attendanceScore', key: 'attendanceScore' },
        { title: 'Mid (30%)', dataIndex: 'midtermScore', key: 'midtermScore' },
        { title: 'Final (60%)', dataIndex: 'finalScore', key: 'finalScore' },
        { title: 'Total', dataIndex: 'totalScore', key: 'totalScore', render: (v) => <Text strong>{v?.toFixed(2)}</Text> },
        { 
            title: 'Letter', 
            dataIndex: 'letterGrade', 
            key: 'letterGrade',
            render: (v) => <Tag color={v === 'A' || v === 'A+' ? 'success' : (v === 'F' ? 'error' : 'default')}>{v}</Tag> 
        },
    ];

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Title level={3}>Academic Transcript</Title>
                <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Student"><b>{transcript.studentName}</b></Descriptions.Item>
                    <Descriptions.Item label="Code">{transcript.studentCode}</Descriptions.Item>
                    <Descriptions.Item label="Total Credits Collected">{transcript.totalCredits}</Descriptions.Item>
                    <Descriptions.Item label="Cumulative GPA" span={3}>
                        <Tag color={transcript.currentGPA >= 8 ? "success" : "blue"} style={{ fontSize: 16, padding: '4px 12px' }}>
                            {transcript.currentGPA?.toFixed(2)}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={transcript.semesters || []}
                renderItem={(semester) => (
                    <List.Item>
                        <Card 
                            title={`Semester ${semester.semester} - ${semester.academicYear}`}
                            extra={<Text strong>Term GPA: <Tag color="blue">{semester.semesterGPA?.toFixed(2)}</Tag></Text>}
                            style={{ borderRadius: 8 }}
                        >
                            <Table 
                                columns={columns} 
                                dataSource={semester.grades} 
                                pagination={false} 
                                rowKey="gradeID"
                                size="small"
                                scroll={{ x: 800 }}
                            />
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default TranscriptPage;
