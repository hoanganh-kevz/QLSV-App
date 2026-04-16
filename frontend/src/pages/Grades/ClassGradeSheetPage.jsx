import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Select, Typography, Table, Tag, Row, Col, Button, Empty, Slider, Switch, Divider, Space, Statistic, Progress } from 'antd';
import { FileExcelOutlined, ReloadOutlined, BarChartOutlined, LineChartOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import { gradeService } from '../../services/gradeService';
import { subjectService } from '../../services/subjectService';
import { systemService } from '../../services/systemService';
import { exportService } from '../../services/exportService';
import { showError, showSuccess } from '../../components/common/ErrorMessage/ErrorMessage';
import AdvancedFilterPanel from '../../components/common/AdvancedFilterPanel/AdvancedFilterPanel';
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

const ClassGradeSheetPage = () => {
    const { t } = useTranslation();
    const searchParams = new URLSearchParams(window.location.search);
    const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || null);
    const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || null);
    const [selectedSemester, setSelectedSemester] = useState(searchParams.get('semester') || null);
    const [subjects, setSubjects] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableAcademicYears, setAvailableAcademicYears] = useState([]);
    const [grades, setGrades] = useState([]);
    const [filteredGrades, setFilteredGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    // Advanced filter states
    const [scoreRange, setScoreRange] = useState([
        parseFloat(searchParams.get('minScore')) || 0,
        parseFloat(searchParams.get('maxScore')) || 10
    ]);
    const [failedOnly, setFailedOnly] = useState(searchParams.get('failedOnly') === 'true');
    const [academicYear, setAcademicYear] = useState(searchParams.get('academicYear') || 'All');

    useEffect(() => {
        const loadInitialData = async () => {
            const [subjectsRes, classesRes, configRes] = await Promise.all([
                subjectService.getAllSubjects(),
                systemService.getClasses(),
                systemService.getConfig()
            ]);
            if (subjectsRes.success) setSubjects(subjectsRes.data);
            if (classesRes.success) setAvailableClasses(classesRes.data);
            if (configRes.success) {
                setAvailableSemesters(configRes.data.SEMESTERS || []);
                setAvailableAcademicYears(configRes.data.ACADEMIC_YEARS || []);
                if (!selectedSemester && configRes.data.SEMESTERS?.length > 0) {
                    setSelectedSemester(configRes.data.SEMESTERS[0]);
                }
            }
        };
        loadInitialData();
    }, []);

    const loadGradeSheet = useCallback(async () => {
        if (!selectedClass || !selectedSubject || !selectedSemester) return;
        setLoading(true);
        const res = await gradeService.getGradesByClass({
            classStr: selectedClass,
            subjectCode: selectedSubject,
            semester: selectedSemester,
        });
        if (res.success) {
            setGrades(res.data);
            setFilteredGrades(res.data);
        } else {
            showError(res.message);
        }
        setLoading(false);
    }, [selectedClass, selectedSubject, selectedSemester]);

    useEffect(() => {
        loadGradeSheet();
    }, [loadGradeSheet]);

    useEffect(() => {
        let result = [...grades];
        if (failedOnly) {
            result = result.filter(g => g.letterGrade === 'F' || (g.totalScore !== undefined && g.totalScore < 5.0));
        }
        if (scoreRange[0] > 0 || scoreRange[1] < 10) {
            result = result.filter(g => g.totalScore !== undefined && g.totalScore >= scoreRange[0] && g.totalScore <= scoreRange[1]);
        }
        setFilteredGrades(result);

        const urlParams = new URLSearchParams();
        if (selectedClass) urlParams.set('class', selectedClass);
        if (selectedSubject) urlParams.set('subject', selectedSubject);
        if (selectedSemester) urlParams.set('semester', selectedSemester);
        if (failedOnly) urlParams.set('failedOnly', 'true');
        if (academicYear !== 'All') urlParams.set('academicYear', academicYear);
        if (scoreRange[0] > 0 || scoreRange[1] < 10) {
            urlParams.set('minScore', scoreRange[0]);
            urlParams.set('maxScore', scoreRange[1]);
        }
        window.history.replaceState(null, '', `${window.location.pathname}?${urlParams.toString()}`);
    }, [grades, scoreRange, failedOnly, academicYear, selectedClass, selectedSubject, selectedSemester]);

    const avgScore = useMemo(() => {
        if (filteredGrades.length === 0) return 0;
        const sum = filteredGrades.reduce((acc, g) => acc + (g.totalScore || 0), 0);
        return (sum / filteredGrades.length).toFixed(2);
    }, [filteredGrades]);

    const passRate = useMemo(() => {
        if (filteredGrades.length === 0) return 0;
        const passed = filteredGrades.filter(g => g.totalScore >= 5.0).length;
        return Math.round((passed / filteredGrades.length) * 100);
    }, [filteredGrades]);

    const columns = useMemo(() => [
        { title: '#', key: 'index', width: 60, render: (_, __, i) => <Text type="secondary">{i + 1}</Text> },
        { title: t('students.mssv'), dataIndex: 'studentMssv', key: 'studentMssv', width: 140, render: (text) => <Text strong>{text}</Text> },
        { title: t('students.fullName'), dataIndex: 'studentName', key: 'studentName' },
        { title: `${t('grades.midterm')} (30%)`, dataIndex: 'midterm', key: 'midterm', width: 120, align: 'center' },
        { title: `${t('grades.final')} (50%)`, dataIndex: 'final', key: 'final', width: 120, align: 'center' },
        { title: `${t('grades.attend')} (20%)`, dataIndex: 'attendance', key: 'attendance', width: 120, align: 'center' },
        {
            title: t('grades.total'), dataIndex: 'totalScore', key: 'totalScore', width: 100, align: 'center',
            render: (v) => <Text strong style={{ color: v >= 5.0 ? 'var(--primary-color)' : '#ef4444' }}>{v ?? '—'}</Text>,
        },
        {
            title: t('grades.grade'), dataIndex: 'letterGrade', key: 'letterGrade', width: 100, align: 'center',
            render: (grade) => grade ? <Tag color={getGradeColor(grade)} style={{ borderRadius: '6px', fontWeight: 600 }}>{grade}</Tag> : '—',
        },
    ], [t]);

    const handleExport = useCallback(async () => {
        if (filteredGrades.length === 0) return;
        setExportLoading(true);
        const excelHeaders = [
            '#', t('students.mssv'), t('students.fullName'),
            t('grades.midterm'), t('grades.final'), t('grades.attend'),
            t('grades.total'), t('grades.gpa4'), t('grades.grade')
        ];
        const exportData = filteredGrades.map((g, i) => [
            i + 1, g.studentMssv, g.studentName,
            g.midterm, g.final, g.attendance,
            g.totalScore, g.gpa4, g.letterGrade
        ]);
        const res = await exportService.exportToExcel(
            exportData,
            `GradeSheet_${selectedClass}_${selectedSubject}_${selectedSemester}`,
            'Grades',
            excelHeaders
        );
        if (res.success) showSuccess(t('grades.exportSuccess'));
        else showError(res.message);
        setExportLoading(false);
    }, [filteredGrades, selectedClass, selectedSubject, selectedSemester, t]);

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={2} className="premium-title">{t('grades.sheet.title')}</Title>
                    <Text className="premium-subtitle">{t('grades.sheet.subtitle')}</Text>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={loadGradeSheet} disabled={!selectedClass || !selectedSubject || !selectedSemester} className="glass-panel">
                        {t('common.refresh')}
                    </Button>
                    <Button type="primary" icon={<FileExcelOutlined />} onClick={handleExport} disabled={filteredGrades.length === 0} loading={exportLoading} className="premium-btn">
                        {t('common.export')}
                    </Button>
                </Space>
            </div>

            <Card className="glass-panel" bordered={false} style={{ marginBottom: 24 }}>
                <Row gutter={[24, 24]} align="bottom">
                    <Col xs={24} md={8}>
                        <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>{t('students.class').toUpperCase()}</Text>
                        <Select placeholder={t('students.class')} style={{ width: '100%' }} size="large" value={selectedClass} onChange={setSelectedClass} allowClear icon={<TeamOutlined />}>
                            {availableClasses.map(c => <Option key={c._id || c.id} value={c.code}>{c.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} md={10}>
                        <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>{t('nav.subjects').toUpperCase()}</Text>
                        <Select placeholder={t('nav.subjects')} style={{ width: '100%' }} size="large" value={selectedSubject} onChange={setSelectedSubject} allowClear showSearch optionFilterProp="children" icon={<BookOutlined />}>
                            {subjects.map(s => <Option key={s.code || s.id} value={s.code}>{s.code} — {s.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>{t('common.semester').toUpperCase()}</Text>
                        <Select placeholder={t('common.semester')} style={{ width: '100%' }} size="large" value={selectedSemester} onChange={setSelectedSemester} allowClear>
                            {availableSemesters.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <AdvancedFilterPanel onReset={() => { setScoreRange([0, 10]); setFailedOnly(false); setAcademicYear('All'); }}>
                <Row gutter={[32, 16]} align="middle">
                    <Col xs={24} md={9}>
                        <div style={{ marginBottom: 16, fontWeight: 600 }}>{t('grades.scoreRange')}</div>
                        <Slider range step={0.5} min={0} max={10} value={scoreRange} onChange={setScoreRange} marks={{ 0: '0', 5: 'PASS', 10: '10' }} />
                    </Col>
                    <Col xs={24} md={9}>
                        <div style={{ marginBottom: 8, fontWeight: 600 }}>{t('grades.academicYear')}</div>
                        <Select value={academicYear} onChange={setAcademicYear} style={{ width: '100%' }} size="large">
                            <Option value="All">{t('grades.sheet.filterAllYears')}</Option>
                            {availableAcademicYears.map(year => <Option key={year} value={year}>{year}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%', paddingTop: 24 }}>
                            <Switch checked={failedOnly} onChange={setFailedOnly} />
                            <Text strong>{t('grades.sheet.filterFailedOnly')}</Text>
                        </div>
                    </Col>
                </Row>
            </AdvancedFilterPanel>

            {selectedClass && selectedSubject && selectedSemester ? (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={6}>
                        <Card bordered={false} className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Statistic title={t('grades.sheet.stats.avg')} value={avgScore} prefix={<BarChartOutlined />} valueStyle={{ fontWeight: 800, color: 'var(--primary-color)' }} />
                            <Divider style={{ margin: '16px 0' }} />
                            <div style={{ textAlign: 'center' }}>
                                <Progress type="dashboard" percent={passRate} strokeColor="var(--primary-color)" />
                                <div style={{ marginTop: 8 }}>
                                    <Text strong>{t('grades.sheet.stats.passRate')}</Text>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filteredGrades.filter(g => g.totalScore >= 5.0).length} {t('common.of') || 'of'} {filteredGrades.length} {t('nav.students')}</div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={18}>
                        <Card bordered={false} className="glass-panel">
                            <Table
                                columns={columns}
                                dataSource={filteredGrades}
                                rowKey="_id"
                                loading={loading}
                                pagination={false}
                                size="middle"
                                bordered
                                scroll={{ x: 800 }}
                                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No grades matching filters" /> }}
                                className="premium-table"
                            />
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Card bordered={false} className="glass-panel" style={{ padding: '80px 0', textAlign: 'center' }}>
                    <Empty
                        image={<LineChartOutlined style={{ fontSize: 64, color: 'var(--primary-light)' }} />}
                        description={
                            <div style={{ marginTop: 16 }}>
                                <Title level={4} style={{ color: 'var(--text-secondary)' }}>{t('grades.sheet.ready') || 'Select Filters to View Data'}</Title>
                                <Text type="secondary">{t('grades.sheet.readyDesc') || 'Please select a class, subject, and semester to generate the grade sheet.'}</Text>
                            </div>
                        }
                    />
                </Card>
            )}
        </div>
    );
};

export default ClassGradeSheetPage;
