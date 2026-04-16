import React, { useState, useEffect } from 'react';
import { Card, Select, Typography, Table, Tag, Row, Col, Statistic, Empty, Divider, Button } from 'antd';
import { TrophyOutlined, BookOutlined, BarChartOutlined, PrinterOutlined } from '@ant-design/icons';
import { gradeService } from '../../services/gradeService';
import { studentService } from '../../services/studentService';
import { exportService } from '../../services/exportService';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;

const StudentTranscriptPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(isStudent ? user?._id || user?.id : null);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        const loadStudents = async () => {
            if (isStudent) return; // Don't load others' directory if student
            const res = await studentService.getAllStudents();
            if (res.success) setStudents(res.data);
        };
        loadStudents();
    }, [isStudent]);

    useEffect(() => {
        if (selectedStudent) loadTranscript();
    }, [selectedStudent]);

    const loadTranscript = async () => {
        setLoading(true);
        const res = await gradeService.getGradesByStudent(selectedStudent);
        if (res.success) {
            setGrades(res.data);
        } else {
            showError(res.message);
        }
        setLoading(false);
    };

    const handleExportPDF = async () => {
        setExportLoading(true);
        await exportService.exportToPDF();
        setExportLoading(false);
    };

    // Group grades by semester
    const groupedBySemester = grades.reduce((acc, g) => {
        if (!acc[g.semester]) acc[g.semester] = [];
        acc[g.semester].push(g);
        return acc;
    }, {});

    // Calculate GPA (scale 4.0) using backend field
    const calculateGPA = (grades) => {
        if (grades.length === 0) return 0;
        const totalPoints = grades.reduce((sum, g) => sum + (g.gpa4 || 0), 0);
        return (totalPoints / grades.length).toFixed(2);
    };

    const totalGPA = calculateGPA(grades);
    const totalSubjects = grades.length;
    const passedSubjects = grades.filter(g => g.totalScore != null && g.totalScore >= 5.0).length;

    const getGradeColor = (grade) => {
        if (!grade) return 'default';
        if (['A+', 'A'].includes(grade)) return 'green';
        if (['B+', 'B'].includes(grade)) return 'blue';
        if (['C+', 'C'].includes(grade)) return 'orange';
        if (['D+', 'D'].includes(grade)) return 'volcano';
        return 'red';
    };

    const columns = [
        { title: t('subjects.code'), dataIndex: 'subjectCode', key: 'subjectCode', width: 120 },
        { title: t('subjects.name'), dataIndex: 'subjectName', key: 'subjectName' },
        { title: t('grades.midterm'), dataIndex: 'midterm', key: 'midterm', width: 80, align: 'center' },
        { title: t('grades.final'), dataIndex: 'final', key: 'final', width: 80, align: 'center' },
        { title: t('grades.attend'), dataIndex: 'attendance', key: 'attendance', width: 80, align: 'center' },
        {
            title: t('grades.total'), dataIndex: 'totalScore', key: 'totalScore', width: 80, align: 'center',
            render: (v) => <Text strong>{v}</Text>,
        },
        {
            title: t('grades.gpa4'), dataIndex: 'gpa4', key: 'gpa4', width: 80, align: 'center',
            render: (v) => v != null ? <Text strong style={{ color: 'var(--primary-color)' }}>{v.toFixed(1)}</Text> : '—',
        },
        {
            title: t('grades.grade'), dataIndex: 'letterGrade', key: 'letterGrade', width: 80, align: 'center',
            render: (grade) => <Tag color={getGradeColor(grade)}>{grade}</Tag>,
        },
    ];

    const studentInfo = students.find(s => s._id === selectedStudent);

    return (
        <div style={{ padding: '24px', background: 'var(--bg-color)', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>{t('grades.transcript.title')}</Title>
            </div>
 
            {/* Student Selector - Hidden for Students */}
            {!isStudent && (
                <Card bordered={false} style={{ marginBottom: 24, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    <Row gutter={16} align="middle">
                        <Col xs={24} md={12}>
                            <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>{t('common.selectStudent').toUpperCase()}</Text>
                            <Select
                                showSearch
                                placeholder={t('common.searchStudent')}
                                style={{ width: '100%' }}
                                value={selectedStudent}
                                onChange={setSelectedStudent}
                                optionFilterProp="children"
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                size="large"
                            >
                                {students.map(s => (
                                    <Option key={s._id} value={s._id}>{s.mssv} — {s.fullName} ({s.classStr || s.class?.name || 'No Class'})</Option>
                                ))}
                            </Select>
                        </Col>
                        {studentInfo && (
                            <Col xs={24} md={12}>
                                <div style={{ display: 'flex', gap: 32, paddingTop: 20, alignItems: 'center' }}>
                                    <Statistic title="GPA (4.0)" value={totalGPA} prefix={<TrophyOutlined />} valueStyle={{ color: totalGPA >= 3.0 ? '#52c41a' : totalGPA >= 2.0 ? '#faad14' : '#f5222d' }} />
                                    <Statistic title={t('grades.subjects')} value={totalSubjects} prefix={<BookOutlined />} />
                                    <Statistic title={t('grades.passed')} value={passedSubjects} prefix={<BarChartOutlined />} valueStyle={{ color: '#52c41a' }} />
                                    <Button type="default" icon={<PrinterOutlined />} onClick={handleExportPDF} loading={exportLoading} style={{ marginLeft: 'auto', borderColor: '#722ed1', color: '#722ed1' }}>
                                        {t('common.exportPDF')}
                                    </Button>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Card>
            )}

            {/* Global Stats Summary for Students (Since selector is hidden) */}
            {isStudent && grades.length > 0 && (
                <Card bordered={false} style={{ marginBottom: 24, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', gap: 32, alignItems: 'center', justifyContent: 'space-around' }}>
                        <Statistic title="GPA (4.0)" value={totalGPA} prefix={<TrophyOutlined />} valueStyle={{ color: totalGPA >= 3.0 ? '#52c41a' : totalGPA >= 2.0 ? '#faad14' : '#f5222d' }} />
                        <Statistic title={t('grades.subjects')} value={totalSubjects} prefix={<BookOutlined />} />
                        <Statistic title={t('grades.passed')} value={passedSubjects} prefix={<BarChartOutlined />} valueStyle={{ color: '#52c41a' }} />
                        <Button type="primary" icon={<PrinterOutlined />} onClick={handleExportPDF} loading={exportLoading} className="premium-btn">
                            {t('common.exportPDF')}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Transcript by Semester */}
            {selectedStudent ? (
                loading ? (
                    <Card bordered={false} style={{ borderRadius: '16px', textAlign: 'center', padding: 40 }}>
                        <Text type="secondary">{t('common.loading')}</Text>
                    </Card>
                ) : grades.length > 0 ? (
                    Object.entries(groupedBySemester).sort(([a], [b]) => b.localeCompare(a)).map(([semester, semGrades]) => (
                        <Card key={semester} bordered={false} style={{ marginBottom: 16, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong style={{ fontSize: 16 }}>📅 {semester}</Text>
                                <Tag color="purple">GPA (4.0): {calculateGPA(semGrades)}</Tag>
                            </div>
                            <Table columns={columns} dataSource={semGrades} rowKey="_id" pagination={false} size="small" bordered />
                        </Card>
                    ))
                ) : (
                    <Card bordered={false} style={{ borderRadius: '16px', textAlign: 'center', padding: 40 }}>
                        <Empty description={t('grades.noGrades')} />
                    </Card>
                )
            ) : (
                <Card bordered={false} style={{ borderRadius: '16px', textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
                    <Title level={4} style={{ color: '#999' }}>{t('common.selectStudent')}</Title>
                    <Text type="secondary">{t('grades.selectStudent')}</Text>
                </Card>
            )}
        </div>
    );
};

export default StudentTranscriptPage;
