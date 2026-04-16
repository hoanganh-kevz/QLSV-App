import React, { useState, useEffect, useMemo } from 'react';
import { Card, Select, Button, InputNumber, Table, Typography, Space, Tag, Row, Col, Spin, Divider, Progress, Badge, Tooltip } from 'antd';
import { SaveOutlined, ReloadOutlined, FileExcelOutlined, EditOutlined, CheckCircleOutlined, InfoCircleOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import { exportService } from '../../services/exportService';
import { gradeService } from '../../services/gradeService';
import { studentService } from '../../services/studentService';
import { subjectService } from '../../services/subjectService';
import { showSuccess } from '../../components/common/SuccessMessage/SuccessMessage';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { systemService } from '../../services/systemService';
import { useTranslation } from '../../hooks/useTranslation';

const { Title, Text } = Typography;
const { Option } = Select;

const getGradeColor = (grade) => {
    if (!grade) return 'default';
    if (['A+', 'A'].includes(grade)) return '#10b981';
    if (['B+', 'B'].includes(grade)) return '#3b82f6';
    if (['C+', 'C'].includes(grade)) return '#f59e0b';
    if (['D+', 'D'].includes(grade)) return '#ef4444';
    return '#6366f1';
};

const GradeEntryPage = () => {
    const { t } = useTranslation();
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);

    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [gradeData, setGradeData] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const { user: currentUser } = useAuth();

    useEffect(() => {
        const loadInitialData = async () => {
            const [subjectsRes, configRes, classesRes] = await Promise.all([
                subjectService.getAllSubjects(),
                systemService.getConfig(),
                systemService.getClasses()
            ]);

            if (configRes.success) setAvailableSemesters(configRes.data.SEMESTERS || []);
            if (subjectsRes.success) setSubjects(subjectsRes.data);
            if (classesRes.success) {
                let classes = classesRes.data;
                if (currentUser?.role === 'teacher') {
                    const assigned = currentUser.assignedClasses || [];
                    classes = classes.filter(c => assigned.includes(c.code) || assigned.includes(c.name));
                }
                setAvailableClasses(classes);
            }
        };
        loadInitialData();
    }, [currentUser]);

    const loadGradeSheet = async () => {
        if (!selectedClass || !selectedSubject || !selectedSemester) return;
        setLoading(true);
        try {
            const [studentsRes, gradesRes] = await Promise.all([
                studentService.getAllStudents(),
                gradeService.getGradesByClass({ classStr: selectedClass, subjectCode: selectedSubject, semester: selectedSemester })
            ]);

            const classStudents = studentsRes.success
                ? studentsRes.data.filter(s => (s.class?.code === selectedClass || s.class?.name === selectedClass || s.class === selectedClass) && s.status === 'Active')
                : [];

            const existingGrades = gradesRes.success ? gradesRes.data : [];
            const selectedSubjectData = subjects.find(s => s.code === selectedSubject);

            const merged = classStudents.map(student => {
                const existing = existingGrades.find(g => g.studentId === student._id);
                return {
                    key: student._id,
                    studentId: student._id,
                    studentMssv: student.mssv,
                    studentName: student.fullName,
                    subjectCode: selectedSubject,
                    subjectName: selectedSubjectData?.name || selectedSubject,
                    classStr: selectedClass,
                    semester: selectedSemester,
                    midterm: existing?.midterm ?? null,
                    final: existing?.final ?? null,
                    attendance: existing?.attendance ?? null,
                    totalScore: existing?.totalScore ?? null,
                    gpa4: existing?.gpa4 ?? null,
                    letterGrade: existing?.letterGrade ?? null,
                    gradeId: existing?._id || null,
                };
            });

            setGradeData(merged);
            setStudents(classStudents);
            setHasChanges(false);
        } catch (err) {
            showError(t('common.error'));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadGradeSheet();
    }, [selectedClass, selectedSubject, selectedSemester]);

    const handleGradeChange = (key, field, value) => {
        setGradeData(prev => prev.map(row => {
            if (row.key === key) {
                const newRow = { ...row, [field]: value };
                if (newRow.midterm != null && newRow.final != null && newRow.attendance != null) {
                    newRow.totalScore = Math.round((newRow.midterm * 0.3 + newRow.final * 0.5 + newRow.attendance * 0.2) * 100) / 100;
                    if (newRow.totalScore >= 9.0) { newRow.gpa4 = 4.0; newRow.letterGrade = 'A+'; }
                    else if (newRow.totalScore >= 8.5) { newRow.gpa4 = 4.0; newRow.letterGrade = 'A'; }
                    else if (newRow.totalScore >= 8.0) { newRow.gpa4 = 3.5; newRow.letterGrade = 'B+'; }
                    else if (newRow.totalScore >= 7.0) { newRow.gpa4 = 3.0; newRow.letterGrade = 'B'; }
                    else if (newRow.totalScore >= 6.5) { newRow.gpa4 = 2.5; newRow.letterGrade = 'C+'; }
                    else if (newRow.totalScore >= 5.5) { newRow.gpa4 = 2.0; newRow.letterGrade = 'C'; }
                    else if (newRow.totalScore >= 5.0) { newRow.gpa4 = 1.5; newRow.letterGrade = 'D+'; }
                    else if (newRow.totalScore >= 4.0) { newRow.gpa4 = 1.0; newRow.letterGrade = 'D'; }
                    else if (newRow.totalScore >= 3.0) { newRow.gpa4 = 0.5; newRow.letterGrade = 'F+'; }
                    else { newRow.gpa4 = 0; newRow.letterGrade = 'F'; }
                } else {
                    newRow.totalScore = null; newRow.gpa4 = null; newRow.letterGrade = null;
                }
                return newRow;
            }
            return row;
        }));
        setHasChanges(true);
    };

    const handleBatchSave = async () => {
        const incomplete = gradeData.filter(r => (r.midterm != null || r.final != null || r.attendance != null) && (r.midterm == null || r.final == null || r.attendance == null));
        if (incomplete.length > 0) {
            showError(t('grades.entry.incomplete').replace('{{count}}', incomplete.length));
            return;
        }

        const toSave = gradeData.filter(r => r.midterm != null && r.final != null && r.attendance != null);
        if (toSave.length === 0) {
            showError(t('grades.entry.noGradesToSave'));
            return;
        }

        setSaving(true);
        const res = await gradeService.batchSaveGrades(toSave);
        if (res.success) {
            showSuccess(t('grades.entry.saveSuccess').replace('{{count}}', toSave.length));
            setHasChanges(false);
            loadGradeSheet();
        } else {
            showError(res.message);
        }
        setSaving(false);
    };

    const entryProgress = useMemo(() => {
        if (gradeData.length === 0) return 0;
        const entered = gradeData.filter(g => g.totalScore != null).length;
        return Math.round((entered / gradeData.length) * 100);
    }, [gradeData]);

    const columns = [
        { title: '#', key: 'index', width: 60, render: (_, __, i) => <Text type="secondary">{i + 1}</Text> },
        { title: t('students.mssv'), dataIndex: 'studentMssv', key: 'studentMssv', width: 140, render: (t) => <Text strong>{t}</Text> },
        { title: t('students.fullName'), dataIndex: 'studentName', key: 'studentName' },
        {
            title: <span>{t('grades.midterm')} <Tag style={{ marginLeft: 4 }}>30%</Tag></span>,
            dataIndex: 'midterm', key: 'midterm', width: 130,
            render: (v, r) => <InputNumber min={0} max={10} step={0.5} value={v} onChange={v => handleGradeChange(r.key, 'midterm', v)} style={{ width: '100%' }} status={v === null && r.final !== null ? 'error' : ''} />
        },
        {
            title: <span>{t('grades.final')} <Tag style={{ marginLeft: 4 }}>50%</Tag></span>,
            dataIndex: 'final', key: 'final', width: 130,
            render: (v, r) => <InputNumber min={0} max={10} step={0.5} value={v} onChange={v => handleGradeChange(r.key, 'final', v)} style={{ width: '100%' }} status={v === null && r.midterm !== null ? 'error' : ''} />
        },
        {
            title: <span>{t('grades.attend')} <Tag style={{ marginLeft: 4 }}>20%</Tag></span>,
            dataIndex: 'attendance', key: 'attendance', width: 130,
            render: (v, r) => <InputNumber min={0} max={10} step={0.5} value={v} onChange={v => handleGradeChange(r.key, 'attendance', v)} style={{ width: '100%' }} />
        },
        {
            title: t('grades.total'), dataIndex: 'totalScore', key: 'totalScore', width: 100, align: 'center',
            render: (v) => v != null ? <Badge count={v} style={{ backgroundColor: v >= 5.0 ? 'var(--primary-color)' : '#f5222d' }} /> : <Text type="secondary">—</Text>,
        },
        {
            title: t('grades.grade'), dataIndex: 'letterGrade', key: 'letterGrade', width: 100, align: 'center',
            render: (grade) => grade ? <Tag color={getGradeColor(grade)} style={{ fontWeight: 600 }}>{grade}</Tag> : <Text type="secondary">—</Text>,
        },
    ];

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={2} className="premium-title">{t('grades.entry.title')}</Title>
                    <Text className="premium-subtitle">{t('grades.entry.subtitle')}</Text>
                </div>
                {hasChanges && (
                    <Badge dot status="processing" text={<Text type="warning" strong>{t('common.unsavedChanges') || 'You have unsaved changes'}</Text>} />
                )}
            </div>

            <Card className="glass-panel" bordered={false} style={{ marginBottom: 24 }}>
                <Row gutter={[24, 24]} align="bottom">
                    <Col xs={24} sm={12} md={6}>
                        <Text strong className="stat-card-title">{t('students.class')}</Text>
                        <Select placeholder={t('students.class')} style={{ width: '100%' }} size="large" value={selectedClass} onChange={setSelectedClass} allowClear icon={<TeamOutlined />}>
                            {availableClasses.map(c => <Option key={c._id || c.id} value={c.code}>{c.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={10}>
                        <Text strong className="stat-card-title">{t('nav.subjects').toUpperCase()}</Text>
                        <Select placeholder={t('nav.subjects')} style={{ width: '100%' }} size="large" value={selectedSubject} onChange={setSelectedSubject} allowClear showSearch icon={<BookOutlined />}>
                            {subjects.map(s => <Option key={s.code || s.id} value={s.code}>{s.code} — {s.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Text strong className="stat-card-title">{t('common.semester')}</Text>
                        <Select placeholder={t('common.semester')} style={{ width: '100%' }} size="large" value={selectedSemester} onChange={setSelectedSemester} allowClear>
                            {availableSemesters.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4} style={{ display: 'flex', gap: 8 }}>
                        <Tooltip title="Refresh data">
                            <Button icon={<ReloadOutlined />} onClick={loadGradeSheet} disabled={!selectedClass} size="large" className="glass-panel" block />
                        </Tooltip>
                        <Button icon={<FileExcelOutlined />} onClick={() => exportService.exportToExcel(gradeData)} disabled={gradeData.length === 0} size="large" className="glass-panel" block />
                    </Col>
                </Row>
            </Card>

            {selectedClass && selectedSubject && selectedSemester ? (
                <Card className="glass-panel" bordered={false} style={{ padding: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '12px' }}>
                        <div style={{ flex: 1, maxWidth: 300 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text strong>{t('grades.entry.progress')}</Text>
                                <Text type="secondary">{entryProgress}%</Text>
                            </div>
                            <Progress percent={entryProgress} strokeColor="var(--brand-gradient)" size="small" />
                        </div>
                        <Space size="large">
                            <Text type="secondary">
                                <TeamOutlined /> {gradeData.length} {t('nav.students')}
                            </Text>
                            <Divider type="vertical" />
                            <Button 
                                type="primary" 
                                icon={<SaveOutlined />} 
                                onClick={handleBatchSave} 
                                loading={saving} 
                                disabled={!hasChanges}
                                className="premium-btn"
                                style={{ height: '44px', padding: '0 32px' }}
                            >
                                {t('common.saveAll')}
                            </Button>
                        </Space>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={gradeData}
                        loading={loading}
                        pagination={false}
                        size="middle"
                        bordered={false}
                        scroll={{ x: 1000 }}
                        className="premium-table"
                    />
                </Card>
            ) : (
                <Card bordered={false} className="glass-panel" style={{ padding: '80px 0', textAlign: 'center' }}>
                    <EditOutlined style={{ fontSize: 64, color: 'var(--primary-light)', marginBottom: 24 }} />
                    <Title level={4} style={{ color: 'var(--text-secondary)' }}>{t('grades.entry.ready')}</Title>
                    <Text type="secondary">{t('grades.entry.readyDesc')}</Text>
                </Card>
            )}
        </div>
    );
};

export default GradeEntryPage;
