import React, { useState, useEffect, useMemo } from 'react';
import { Card, Select, Button, InputNumber, Table, Typography, Space, Tag, Row, Col, Spin, Divider, Progress, Badge, Tooltip, Modal, Form, Radio } from 'antd';
import { SaveOutlined, ReloadOutlined, FileExcelOutlined, EditOutlined, BookOutlined, TeamOutlined, SettingOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { exportService } from '../../services/exportService';
import { gradeService } from '../../services/gradeService';
import { classSectionService } from '../../services/classSectionService';
import { subjectService } from '../../services/subjectService';
import { termService } from '../../services/termService';
import { showSuccess } from '../../components/common/SuccessMessage/SuccessMessage';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const { Title, Text } = Typography;
const { Option } = Select;

const getGradeColor = (grade) => {
    if (!grade) return 'default';
    if (['A+', 'A'].includes(grade)) return '#10b981';
    if (['B+', 'B'].includes(grade)) return '#3b82f6';
    if (['C+', 'C'].includes(grade)) return '#f59e0b';
    if (['D+', 'D'].includes(grade)) return '#ef4444';
    if (grade === 'F') return '#f43f5e';
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
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Dynamic config state
    const [showConfig, setShowConfig] = useState(false);
    const [configForm] = Form.useForm();
    const [tempComponents, setTempComponents] = useState([]);

    const { user: currentUser } = useAuth();
    
    // Derived selected class full object
    const activeClassObj = useMemo(() => {
        return availableClasses.find(c => c._id === selectedClass || c.code === selectedClass);
    }, [availableClasses, selectedClass]);

    useEffect(() => {
        const loadInitialData = async () => {
            const [subjectsRes, termRes, classesRes] = await Promise.all([
                subjectService.getAllSubjects(),
                termService.getAllTerms(),
                classSectionService.getAllSections()
            ]);

            if (termRes.success) {
                setTerms(termRes.data);
                const activeTerm = termRes.data.find(t => t.isDefault || t.status === 'Active');
                if (activeTerm) setSelectedSemester(activeTerm.code);
            }
            if (subjectsRes.success) setSubjects(subjectsRes.data);
            if (classesRes.success) {
                setAvailableClasses(classesRes.data);
            }
        };
        loadInitialData();
    }, [currentUser]);

    const filteredClasses = useMemo(() => {
        if (!selectedSemester) return availableClasses;
        return availableClasses.filter(c => {
            const termCode = typeof c.term === 'object' ? c.term.code : (terms.find(t => t._id === c.term)?.code);
            return termCode === selectedSemester;
        });
    }, [availableClasses, selectedSemester, terms]);

    const loadGradeSheet = async () => {
        if (!activeClassObj || !selectedSubject || !selectedSemester) return;
        setLoading(true);
        try {
            // Check if class has schema, if not we might want to prompt config (handled later)
            const schema = activeClassObj.gradingSchema || [];

            const [rosterRes, gradesRes] = await Promise.all([
                classSectionService.getSectionRoster(activeClassObj._id),
                gradeService.getGradesByClass({ 
                    classSectionId: activeClassObj._id, 
                    classStr: activeClassObj.code, 
                    subjectCode: selectedSubject, 
                    semester: selectedSemester 
                })
            ]);

            const classStudents = rosterRes.success ? rosterRes.data : [];
            const existingGrades = gradesRes.success ? gradesRes.data : [];
            const selectedSubjectData = subjects.find(s => s.code === selectedSubject);

            const merged = classStudents.map(student => {
                const existing = existingGrades.find(g => g.studentId === student._id);
                const termObj = terms.find(t => t.code === selectedSemester);
                
                // Map existing components into a dictionary wrapper for easy input binding
                const compsMap = {};
                schema.forEach(s => compsMap[s.name] = null); // initialize

                if (existing && existing.components) {
                    existing.components.forEach(c => {
                        compsMap[c.name] = c.score;
                    });
                }

                return {
                    key: student._id,
                    studentId: student._id,
                    studentMssv: student.mssv,
                    studentName: student.fullName,
                    subjectId: selectedSubjectData?._id,
                    subjectCode: selectedSubject,
                    subjectName: selectedSubjectData?.name || selectedSubject,
                    classSectionId: activeClassObj._id,
                    classStr: activeClassObj.code,
                    termId: termObj?._id,
                    semester: selectedSemester,
                    
                    componentsMap: compsMap,
                    isExamBanned: existing?.isExamBanned || false,
                    totalScore: existing?.totalScore ?? null,
                    gpa4: existing?.gpa4 ?? null,
                    letterGrade: existing?.letterGrade ?? null,
                    gradeId: existing?._id || null,
                };
            });

            setGradeData(merged);
            setStudents(classStudents);
            setHasChanges(false);
            
            // Auto open config if schema is empty or missing
            if (schema.length === 0) {
               openConfigModal();
            }
        } catch (err) {
            console.error('Grade sheet error:', err);
            showError('Lỗi tải dữ liệu bảng điểm');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadGradeSheet();
    }, [selectedClass, selectedSubject, selectedSemester]);

    const handleSemesterChange = (val) => {
        setSelectedSemester(val);
        setSelectedClass(null);
    };

    const handleGradeChange = (key, compName, value) => {
        setGradeData(prev => prev.map(row => {
            if (row.key === key) {
                const newCompsMap = { ...row.componentsMap, [compName]: value };
                const schema = activeClassObj.gradingSchema || [];
                
                let isComplete = true;
                let total = 0;
                let totalWeight = 0;

                schema.forEach(s => {
                    const score = newCompsMap[s.name];
                    if (score == null) {
                        isComplete = false;
                    } else {
                        total += (score * s.weight) / 100;
                    }
                    totalWeight += s.weight;
                });

                let newTotal = null, newGpa = null, newLetter = null;

                if (row.isExamBanned) {
                    newTotal = 0; newGpa = 0; newLetter = 'F';
                } else if (isComplete && totalWeight === 100) {
                    newTotal = Math.round(total * 100) / 100;
                    if (newTotal >= 9.0) { newGpa = 4.0; newLetter = 'A+'; }
                    else if (newTotal >= 8.5) { newGpa = 4.0; newLetter = 'A'; }
                    else if (newTotal >= 8.0) { newGpa = 3.5; newLetter = 'B+'; }
                    else if (newTotal >= 7.0) { newGpa = 3.0; newLetter = 'B'; }
                    else if (newTotal >= 6.5) { newGpa = 2.5; newLetter = 'C+'; }
                    else if (newTotal >= 5.5) { newGpa = 2.0; newLetter = 'C'; }
                    else if (newTotal >= 5.0) { newGpa = 1.5; newLetter = 'D+'; }
                    else if (newTotal >= 4.0) { newGpa = 1.0; newLetter = 'D'; }
                    else if (newTotal >= 3.0) { newGpa = 0.5; newLetter = 'F+'; }
                    else { newGpa = 0; newLetter = 'F'; }
                }

                return { ...row, componentsMap: newCompsMap, totalScore: newTotal, gpa4: newGpa, letterGrade: newLetter };
            }
            return row;
        }));
        setHasChanges(true);
    };

    const handleBatchSave = async () => {
        const schema = activeClassObj.gradingSchema || [];
        
        let hasIncomplete = false;
        
        const toSave = gradeData.filter(r => {
            // Unsaved means it has at least one grade, but not necessarily all. 
            // We'll reject saving partially filled rows to strict grade matching.
            let hasAny = false, isMissing = false;
            schema.forEach(s => {
                if (r.componentsMap[s.name] != null) hasAny = true;
                else isMissing = true;
            });
            if (hasAny && isMissing) hasIncomplete = true;
            return hasAny && !isMissing;
        }).map(r => {
            // Map back to components array for backend
            const dbComps = schema.map(s => ({
                name: s.name,
                weight: s.weight,
                type: s.type,
                score: r.componentsMap[s.name]
            }));

            return {
                ...r,
                components: dbComps,
                term: r.termId,
                classSection: r.classSectionId,
                subject: r.subjectId
            };
        });

        if (hasIncomplete) {
            showError('Có sinh viên chưa được nhập đủ các cột điểm, không thể lưu.');
            return;
        }

        if (toSave.length === 0) {
            showError('Không có dữ liệu điểm hoàn chỉnh nào để lưu.');
            return;
        }

        setSaving(true);
        const res = await gradeService.batchSaveGrades(toSave);
        if (res.success) {
            showSuccess(`Đã lưu điểm cho ${toSave.length} sinh viên`);
            setHasChanges(false);
            loadGradeSheet();
        } else {
            showError(res.message);
        }
        setSaving(false);
    };

    const openConfigModal = () => {
        const schema = activeClassObj?.gradingSchema || [
            { name: 'Chuyên cần', weight: 20, type: 'attendance', order: 1 },
            { name: 'Giữa kỳ', weight: 30, type: 'midterm', order: 2 },
            { name: 'Cuối kỳ', weight: 50, type: 'final', order: 3 }
        ];
        const penalty = activeClassObj?.attendanceRules?.latePenalty || 0;

        setTempComponents(schema);
        configForm.setFieldsValue({ latePenalty: penalty });
        setShowConfig(true);
    };

    const saveConfig = async () => {
        const total = tempComponents.reduce((acc, c) => acc + c.weight, 0);
        if (total !== 100) {
             showError(`Tổng trọng số phải bằng 100%. Hiện tại: ${total}%`);
             return;
        }
        try {
            const vals = await configForm.validateFields();
            const res = await classSectionService.updateSection(activeClassObj._id, {
                gradingSchema: tempComponents,
                attendanceRules: { latePenalty: vals.latePenalty }
            });
            if (res.success) {
                showSuccess('Cập nhật cấu hình điểm thành công');
                setShowConfig(false);
                
                // Update the local classes list so activeClassObj gets the new schema
                setAvailableClasses(prev => prev.map(c => c._id === res.data._id ? res.data : c));
                
                // Data will refresh because activeClassObj changes, 
                // but let's call loadGradeSheet explicitly to be sure and immediate
                setTimeout(() => loadGradeSheet(), 100);
            }
        } catch(e) { console.error(e) }
    };

    const entryProgress = useMemo(() => {
        if (gradeData.length === 0) return 0;
        const entered = gradeData.filter(g => g.totalScore != null || g.isExamBanned).length;
        return Math.round((entered / gradeData.length) * 100);
    }, [gradeData]);

    const buildColumns = () => {
        const base = [
            { title: '#', key: 'index', width: 60, render: (_, __, i) => <Text type="secondary">{i + 1}</Text>, fixed: 'left' },
            { title: t('students.mssv'), dataIndex: 'studentMssv', key: 'studentMssv', width: 140, render: (t) => <Text strong>{t}</Text>, fixed: 'left' },
            { title: t('students.fullName'), dataIndex: 'studentName', key: 'studentName', width: 200, fixed: 'left' },
        ];

        const schema = activeClassObj?.gradingSchema || [];
        // Sort schema by order
        const sortedSchema = [...schema].sort((a,b) => a.order - b.order);

        sortedSchema.forEach(comp => {
           base.push({
               title: <span>{comp.name} <Tag style={{ marginLeft: 4 }}>{comp.weight}%</Tag></span>,
               key: comp.name,
               width: 140,
               render: (_, r) => (
                   <InputNumber 
                       min={0} max={10} step={0.5} 
                       value={r.componentsMap[comp.name]} 
                       onChange={v => handleGradeChange(r.key, comp.name, v)} 
                       style={{ width: '100%' }}
                       disabled={r.isExamBanned || comp.type === 'attendance'} // Attendance read-only
                   />
               )
           });
        });

        base.push({
            title: t('grades.total'), dataIndex: 'totalScore', key: 'totalScore', width: 100, align: 'center', fixed: 'right',
            render: (v, r) => {
                if (r.isExamBanned) return <Badge count="CẤM THI" style={{ backgroundColor: '#f43f5e' }} />;
                return v != null ? <Badge count={v} style={{ backgroundColor: v >= 5.0 ? 'var(--primary-color)' : '#f5222d' }} /> : <Text type="secondary">—</Text>;
            }
        });
        base.push({
            title: t('grades.grade'), dataIndex: 'letterGrade', key: 'letterGrade', width: 80, align: 'center', fixed: 'right',
            render: (grade, r) => {
                if (r.isExamBanned) return <Tag color="#f43f5e" style={{ fontWeight: 600 }}>F</Tag>;
                return grade ? <Tag color={getGradeColor(grade)} style={{ fontWeight: 600 }}>{grade}</Tag> : <Text type="secondary">—</Text>;
            }
        });

        return base;
    };


    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={2} className="premium-title">{t('grades.entry.title')}</Title>
                    <Text className="premium-subtitle">{t('grades.entry.subtitle')}</Text>
                </div>
                {hasChanges && (
                    <Badge dot status="processing" text={<Text type="warning" strong>{t('common.unsavedChanges') || 'Chưa lưu thay đổi'}</Text>} />
                )}
            </div>

            {/* SELECTION CARD */}
            <Card className="glass-panel" bordered={false} style={{ marginBottom: 24 }}>
                <Row gutter={[24, 24]} align="bottom">
                    <Col xs={24} sm={12} md={6}>
                        <Text strong className="stat-card-title">{t('students.class')}</Text>
                        <Select placeholder={t('students.class')} style={{ width: '100%' }} size="large" value={selectedClass} onChange={setSelectedClass} allowClear icon={<TeamOutlined />} disabled={!selectedSemester}>
                            {filteredClasses.map(c => <Option key={c._id || c.id} value={c._id}>{c.code} - {c.subject?.name}</Option>)}
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
                        <Select placeholder={t('common.semester')} style={{ width: '100%' }} size="large" value={selectedSemester} onChange={handleSemesterChange} allowClear>
                            {terms.map(t => <Option key={t._id} value={t.code}>{t.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4} style={{ display: 'flex', gap: 8 }}>
                        <Tooltip title="Refresh data">
                            <Button icon={<ReloadOutlined />} onClick={loadGradeSheet} disabled={!selectedClass} size="large" className="glass-panel" block />
                        </Tooltip>
                        <Tooltip title="Cấu hình">
                            <Button icon={<SettingOutlined />} onClick={openConfigModal} disabled={!activeClassObj} size="large" className="glass-panel" block />
                        </Tooltip>
                    </Col>
                </Row>
            </Card>

            {/* MAIN TABLE CARD */}
            {activeClassObj && selectedSubject && selectedSemester ? (
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
                        columns={buildColumns()}
                        dataSource={gradeData}
                        loading={loading}
                        pagination={false}
                        size="middle"
                        bordered={false}
                        scroll={{ x: 'max-content' }}
                        className="premium-table"
                    />
                </Card>
            ) : (
                <Card bordered={false} className="glass-panel" style={{ padding: '80px 0', textAlign: 'center' }}>
                    <EditOutlined style={{ fontSize: 64, color: 'var(--primary-light)', marginBottom: 24 }} />
                    <Title level={4} style={{ color: 'var(--text-secondary)' }}>Tiến hành nhập điểm</Title>
                    <Text type="secondary">Vui lòng chọn lớp và môn học để điền điểm cho sinh viên</Text>
                </Card>
            )}

            {/* CONFIG MODAL */}
            <Modal
                title={<span><SettingOutlined /> Thiết lập Bảng Điểm & Điểm Danh</span>}
                open={showConfig}
                onOk={saveConfig}
                onCancel={() => setShowConfig(false)}
                width={700}
                okText="Lưu cấu hình"
                cancelText="Hủy"
            >
                <Divider>Quy định Vắng/Đi trễ</Divider>
                <Form layout="vertical" form={configForm} initialValues={{ latePenalty: 0 }}>
                    <Form.Item name="latePenalty" label="Hình thức xử lý khi sinh viên Đi trễ:">
                        <Radio.Group style={{ width: '100%' }}>
                            <Space orientation="vertical" style={{ width: '100%' }}>
                                <Radio.Button value={0} style={{ width: '100%', textAlign: 'left' }}>🟢 Tính như Có mặt (Không trừ điểm chuyên cần)</Radio.Button>
                                <Radio.Button value={0.5} style={{ width: '100%', textAlign: 'left' }}>🟡 Coi như Nửa buổi vắng (Trừ 0.5 buổi điểm danh)</Radio.Button>
                                <Radio.Button value={1} style={{ width: '100%', textAlign: 'left' }}>🔴 Coi như Vắng học (Trừ 1 buổi điểm danh)</Radio.Button>
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                    <div style={{ padding: '8px 12px', background: '#ffe4e6', borderRadius: 8, marginTop: 12 }}>
                        <Text type="danger"><InfoCircleOutlined/> Lưu ý: Hệ thống sẽ đánh giá Điểm chuyên cần tự động. Sinh viên vắng trên 30% mặc định bị CẤM THI.</Text>
                    </div>
                </Form>

                <Divider>Cấu Hình Đầu Điểm</Divider>
                
                <Row gutter={[16, 16]} style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    <Col span={8}>Tên Đầu Điểm</Col>
                    <Col span={6}>Trọng Số (%)</Col>
                    <Col span={4}>Thứ tự</Col>
                    <Col span={4}>Phân Loại</Col>
                    <Col span={2}>Xóa</Col>
                </Row>
                
                {tempComponents.map((comp, idx) => (
                    <Row gutter={[16, 16]} key={idx} style={{ marginBottom: 12 }}>
                        <Col span={8}>
                            <input className="ant-input" value={comp.name} readOnly={comp.type === 'attendance' || comp.type === 'final'} onChange={(e) => {
                                const newComps = [...tempComponents]; newComps[idx].name = e.target.value; setTempComponents(newComps);
                            }} />
                        </Col>
                        <Col span={6}>
                            <InputNumber min={0} max={100} value={comp.weight} style={{width:'100%'}} onChange={(v) => {
                                const newComps = [...tempComponents]; newComps[idx].weight = v; setTempComponents(newComps);
                            }}/>
                        </Col>
                        <Col span={4}>
                            <InputNumber min={0} max={20} value={comp.order} style={{width:'100%'}} onChange={(v) => {
                                const newComps = [...tempComponents]; newComps[idx].order = v; setTempComponents(newComps);
                            }}/>
                        </Col>
                        <Col span={4}>
                            <Select value={comp.type} disabled style={{width:'100%'}}>
                                <Option value="attendance">C.Cần</Option>
                                <Option value="midterm">G.Kỳ</Option>
                                <Option value="final">C.Kỳ</Option>
                                <Option value="custom">Tùy biến</Option>
                            </Select>
                        </Col>
                        <Col span={2}>
                            <Button danger type="text" icon={<DeleteOutlined/>} disabled={comp.type === 'attendance' || comp.type === 'final'} onClick={() => {
                                setTempComponents(tempComponents.filter((_, i) => i !== idx));
                            }} />
                        </Col>
                    </Row>
                ))}
                
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => {
                   setTempComponents([...tempComponents, { name: 'Đầu điểm mới', weight: 10, type: 'custom', order: tempComponents.length+1 }]);
                }}>
                    Thêm Tiêu Chí
                </Button>

                <div style={{ marginTop: 24, padding: 12, background: 'var(--bg-glass)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Tổng kết trọng số:</Text>
                    <Text strong type={tempComponents.reduce((acc, c) => acc + c.weight, 0) === 100 ? 'success' : 'danger'}>
                        {tempComponents.reduce((acc, c) => acc + c.weight, 0)}%
                    </Text>
                </div>
            </Modal>

        </div>
    );
};

export default GradeEntryPage;
