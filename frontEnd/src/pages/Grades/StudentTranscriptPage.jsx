import React, { useState, useEffect } from 'react';
import { Card, Select, Typography, Table, Tag, Row, Col, Statistic, Empty, Divider, Button, Spin } from 'antd';
import { TrophyOutlined, BookOutlined, BarChartOutlined, PrinterOutlined } from '@ant-design/icons';
import { gradeService } from '../../services/gradeService';
import { studentService } from '../../services/studentService';
import { exportService } from '../../services/exportService';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text, Paragraph } = Typography;
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
    const [evalRequired, setEvalRequired] = useState(null); // { message, missing: [] }

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
        setEvalRequired(null);
        const res = await gradeService.getGradesByStudent(selectedStudent);
        if (res.success) {
            setGrades(res.data);
        } else if (res.errorType === 'EVALUATION_REQUIRED') {
            setEvalRequired({ message: res.message, missing: res.missing });
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
        { 
            title: 'Điểm thành phần', 
            key: 'components',
            width: 250,
            render: (_, record) => {
                if (record.isExamBanned) {
                    return <Tag color="#f43f5e" style={{ fontWeight: 800 }}>CẤM THI</Tag>;
                }
                if (!record.components || record.components.length === 0) return <Text type="secondary">—</Text>;
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {record.components.map((c, i) => (
                            <Tooltip key={i} title={`${c.name} (${c.weight}%)`}>
                                <div style={{ 
                                    padding: '2px 8px', 
                                    background: 'rgba(24, 144, 255, 0.05)', 
                                    border: '1px solid rgba(24, 144, 255, 0.1)', 
                                    borderRadius: '6px',
                                    fontSize: '13px'
                                }}>
                                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', lineHeight: 1 }}>{c.name}</Text>
                                    <Text strong>{c.score != null ? c.score : '—'}</Text>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                );
            }
        },
        {
            title: t('grades.total'), dataIndex: 'totalScore', key: 'totalScore', width: 80, align: 'center',
            render: (v, r) => r.isExamBanned ? <Text strong style={{ color: '#f43f5e' }}>0</Text> : (v != null ? <Text strong>{v}</Text> : <Text type="secondary">—</Text>),
        },
        {
            title: t('grades.gpa4'), dataIndex: 'gpa4', key: 'gpa4', width: 80, align: 'center',
            render: (v, r) => r.isExamBanned ? <Text strong style={{ color: '#f43f5e' }}>0.0</Text> : (v != null ? <Text strong style={{ color: 'var(--primary-color)' }}>{v.toFixed(1)}</Text> : <Text type="secondary">—</Text>),
        },
        {
            title: t('grades.grade'), dataIndex: 'letterGrade', key: 'letterGrade', width: 80, align: 'center',
            render: (grade, r) => {
                if (r.isExamBanned) return <Tag color="#f43f5e" style={{ fontWeight: 600 }}>F</Tag>;
                return grade ? <Tag color={getGradeColor(grade)} style={{ fontWeight: 600 }}>{grade}</Tag> : <Text type="secondary">—</Text>;
            },
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
                <Card variant="borderless" style={{ marginBottom: 24, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
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
                                    <Statistic title="GPA (4.0)" value={totalGPA} prefix={<TrophyOutlined />} styles={{ content: { color: totalGPA >= 3.0 ? '#52c41a' : totalGPA >= 2.0 ? '#faad14' : '#f5222d' } }} />
                                    <Statistic title={t('grades.subjects')} value={totalSubjects} prefix={<BookOutlined />} />
                                    <Statistic title={t('grades.passed')} value={passedSubjects} prefix={<BarChartOutlined />} styles={{ content: { color: '#52c41a' } }} />
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
                <Card variant="borderless" style={{ marginBottom: 24, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', gap: 32, alignItems: 'center', justifyContent: 'space-around' }}>
                        <Statistic title="GPA (4.0)" value={totalGPA} prefix={<TrophyOutlined />} styles={{ content: { color: totalGPA >= 3.0 ? '#52c41a' : totalGPA >= 2.0 ? '#faad14' : '#f5222d' } }} />
                        <Statistic title={t('grades.subjects')} value={totalSubjects} prefix={<BookOutlined />} />
                        <Statistic title={t('grades.passed')} value={passedSubjects} prefix={<BarChartOutlined />} styles={{ content: { color: '#52c41a' } }} />
                        <Button type="primary" icon={<PrinterOutlined />} onClick={handleExportPDF} loading={exportLoading} className="premium-btn">
                            {t('common.exportPDF')}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Transcript by Semester */}
            {selectedStudent ? (
                loading ? (
                    <Card variant="borderless" style={{ borderRadius: '16px', textAlign: 'center', padding: 40 }}>
                        <Spin description={t('common.loading')} />
                    </Card>
                ) : evalRequired ? (
                    <Card variant="borderless" className="glass-panel" style={{ borderRadius: '16px', textAlign: 'center', padding: '60px 40px', border: '1px solid #ffccc7', background: '#fff2f0' }}>
                        <div style={{ fontSize: 64, marginBottom: 24 }}>🔒</div>
                        <Title level={3} style={{ color: '#cf1322' }}>{evalRequired.message}</Title>
                        <Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 600, margin: '0 auto 24px' }}>
                            Để đảm bảo khách quan và nâng cao chất lượng đào tạo, bạn cần hoàn thành đánh giá cho tất cả giảng viên trước khi có thể xem kết quả học tập.
                        </Paragraph>
                        
                        <div style={{ background: '#fff', borderRadius: 12, padding: 20, maxWidth: 500, margin: '0 auto 32px', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <Text strong style={{ display: 'block', marginBottom: 12 }}>Các học phần chưa đánh giá:</Text>
                            <ul style={{ paddingLeft: 20 }}>
                                {evalRequired.missing?.map(m => (
                                    <li key={m.id} style={{ marginBottom: 8 }}>
                                        <Text strong>{m.subjectName}</Text> <Text type="secondary">({m.subjectCode})</Text>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={() => window.location.href = '/teacher-evaluation'}
                            className="premium-btn"
                            style={{ padding: '0 40px', height: 48, borderRadius: 24 }}
                        >
                            Đến trang Đánh giá ngay
                        </Button>
                    </Card>
                ) : grades.length > 0 ? (
                    Object.entries(groupedBySemester).sort(([a], [b]) => b.localeCompare(a)).map(([semester, semGrades]) => (
                        <Card key={semester} variant="borderless" style={{ marginBottom: 16, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong style={{ fontSize: 16 }}>📅 {semester}</Text>
                                <Tag color="purple">GPA (4.0): {calculateGPA(semGrades)}</Tag>
                            </div>
                            <Table columns={columns} dataSource={semGrades} rowKey="_id" pagination={false} size="small" bordered />
                        </Card>
                    ))
                ) : (
                    <Card variant="borderless" style={{ borderRadius: '16px', textAlign: 'center', padding: 40 }}>
                        <Empty description={t('grades.noGrades')} />
                    </Card>
                )
            ) : (
                <Card variant="borderless" style={{ borderRadius: '16px', textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
                    <Title level={4} style={{ color: '#999' }}>{t('common.selectStudent')}</Title>
                    <Text type="secondary">{t('grades.selectStudent')}</Text>
                </Card>
            )}
        </div>
    );
};

export default StudentTranscriptPage;
