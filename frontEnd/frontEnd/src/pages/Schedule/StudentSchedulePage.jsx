import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Typography, Select, Row, Col, Spin, Empty, Tag, Tooltip, Button, Badge } from 'antd';
import {
    CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined,
    ReadOutlined, EditOutlined
} from '@ant-design/icons';
import { termService } from '../../services/termService';
import { studentService } from '../../services/studentService';
import { teacherService } from '../../services/teacherService';
import { useAuth } from '../../context/AuthContext';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import WeeklyOverrideModal from './WeeklyOverrideModal';
import './SchedulePage.css';

const { Title, Text } = Typography;
const { Option } = Select;

const DAYS = [
    { label: 'Thứ 2', value: 2 },
    { label: 'Thứ 3', value: 3 },
    { label: 'Thứ 4', value: 4 },
    { label: 'Thứ 5', value: 5 },
    { label: 'Thứ 6', value: 6 },
    { label: 'Thứ 7', value: 7 },
    { label: 'Chủ nhật', value: 8 },
];

// University standard periods (7:00 - 20:45), 18 periods
const PERIODS = Array.from({ length: 18 }, (_, i) => i + 1);

// Each period is ~50 minutes
const TIME_MAPPINGS = {
    1:  '07:00 - 07:50',
    2:  '07:55 - 08:45',
    3:  '08:50 - 09:40',
    4:  '09:45 - 10:35',
    5:  '10:40 - 11:30',
    6:  '11:35 - 12:25',
    7:  '12:30 - 13:20',
    8:  '13:25 - 14:15',
    9:  '14:20 - 15:10',
    10: '15:15 - 16:05',
    11: '16:10 - 17:00',
    12: '17:05 - 17:55',
    13: '18:00 - 18:50',
    14: '18:55 - 19:45',
    15: '19:50 - 20:40',
    16: '20:00 - 20:50',
    17: '20:55 - 21:45',
    18: '21:50 - 22:40',
};

// Calculate current week number within a date range
const getWeekNumber = (date, startDate) => {
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const diffMs = date - new Date(startDate);
    if (diffMs < 0) return 1;
    return Math.floor(diffMs / msPerWeek) + 1;
};

// Get start and end dates for a given week number within a term
const getWeekDateRange = (weekNum, termStartDate) => {
    const start = new Date(termStartDate);
    // Align to Monday of the term start week
    const dayOfWeek = start.getDay(); // 0=Sunday
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + daysToMonday + (weekNum - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
};

const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Merge override vào ClassSection để tính lịch thực tế của tuần
const getEffectiveSchedule = (section, week) => {
    const override = section?.weeklyOverrides?.find(o => o.week === week);
    if (!override) return { sched: section.schedule, override: null, isCancelled: false };

    if (override.overrideType === 'cancelled') {
        return { sched: [], override, isCancelled: true };
    }

    if (override.overrideType === 'reschedule' && override.schedule?.length > 0) {
        return { sched: override.schedule, override, isCancelled: false };
    }

    // online / custom: giữ lịch gốc nhưng đánh dấu
    return { sched: section.schedule, override, isCancelled: false };
};

export const StudentSchedulePage = () => {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';

    const [terms, setTerms] = useState([]);
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedTermId, setSelectedTermId] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(1);

    // Override Modal state
    const [overrideModal, setOverrideModal] = useState({ open: false, section: null });

    // Derived lists
    const academicYears = useMemo(() => {
        const years = new Set();
        terms.forEach(t => {
            if (t.startDate) {
                const yr = new Date(t.startDate).getFullYear();
                years.add(yr);
            }
        });
        return [...years].sort((a, b) => b - a);
    }, [terms]);

    const filteredTermsByYear = useMemo(() => {
        if (!selectedYear) return terms;
        return terms.filter(t => {
            if (!t.startDate) return false;
            const yr = new Date(t.startDate).getFullYear();
            return yr === selectedYear;
        });
    }, [terms, selectedYear]);

    const selectedTermObj = useMemo(() => {
        return terms.find(t => t._id === selectedTermId) || null;
    }, [terms, selectedTermId]);

    const totalWeeks = useMemo(() => {
        if (!selectedTermObj?.startDate || !selectedTermObj?.endDate) return 20;
        const ms = new Date(selectedTermObj.endDate) - new Date(selectedTermObj.startDate);
        return Math.max(1, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)));
    }, [selectedTermObj]);

    const weekRange = useMemo(() => {
        if (!selectedTermObj?.startDate) return null;
        return getWeekDateRange(selectedWeek, selectedTermObj.startDate);
    }, [selectedWeek, selectedTermObj]);

    useEffect(() => {
        loadTerms();
    }, []);

    useEffect(() => {
        if (selectedTermId) {
            loadSchedule(selectedTermId);
        }
    }, [selectedTermId]);

    const loadTerms = async () => {
        const res = await termService.getAllTerms();
        if (res.success && res.data.length > 0) {
            setTerms(res.data);
            // Auto-select active term
            const activeTerm = res.data.find(t => t.status === 'Active') || res.data[0];
            if (activeTerm) {
                const yr = activeTerm.startDate ? new Date(activeTerm.startDate).getFullYear() : new Date().getFullYear();
                setSelectedYear(yr);
                setSelectedTermId(activeTerm._id);
                // Auto-select current week
                if (activeTerm.startDate) {
                    const wk = getWeekNumber(new Date(), activeTerm.startDate);
                    setSelectedWeek(Math.max(1, Math.min(wk, 20)));
                }
            }
        }
    };

    const loadSchedule = async (termId) => {
        setLoading(true);
        let res;
        if (isTeacher) {
            res = await teacherService.getTeacherSchedule('me', termId);
        } else {
            res = await studentService.getStudentSchedule('me', termId);
        }

        if (res?.success) {
            setScheduleData(res.data);
        } else {
            showError(res?.message || 'Lỗi tải thời khóa biểu');
        }
        setLoading(false);
    };

    // Kiểm tra tuần hiện tại có nằm trong đợt của lớp học phần không
    const isWeekInPhase = (section) => {
        const midWeek = Math.ceil(totalWeeks / 2);
        if (section.phase === 1) return selectedWeek <= midWeek;
        if (section.phase === 2) return selectedWeek > midWeek;
        return true; // phase === 0: Cả học kỳ
    };

    // Lấy class tại (day, period) - có tính override
    const getClassAt = (day, period) => {
        for (const section of scheduleData) {
            if (!isWeekInPhase(section)) continue;

            const { sched, override, isCancelled } = getEffectiveSchedule(section, selectedWeek);

            if (isCancelled) {
                // Kiểm tra xem lịch gốc có class ở ô này không để hiện "Đã hủy"
                for (const s of (section.schedule || [])) {
                    if (s.dayOfWeek === day && s.startPeriod === period) {
                        return { section, sched: s, rowSpan: s.endPeriod - s.startPeriod + 1, override, isCancelled: true };
                    }
                }
                continue;
            }

            for (const s of (sched || [])) {
                if (s.dayOfWeek === day && s.startPeriod === period) {
                    return { section, sched: s, rowSpan: s.endPeriod - s.startPeriod + 1, override, isCancelled: false };
                }
            }
        }
        return null;
    };

    const isCellOccupied = (day, period) => {
        for (const section of scheduleData) {
            if (!isWeekInPhase(section)) continue;

            const { sched, isCancelled } = getEffectiveSchedule(section, selectedWeek);

            // Cancelled cells: check original schedule for spanning
            if (isCancelled) {
                for (const s of (section.schedule || [])) {
                    if (s.dayOfWeek === day && s.startPeriod < period && s.endPeriod >= period) return true;
                }
                continue;
            }

            for (const s of (sched || [])) {
                if (s.dayOfWeek === day && s.startPeriod < period && s.endPeriod >= period) return true;
            }
        }
        return false;
    };

    // Color palette for different classes
    const classColors = [
        { bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '#3b82f6', text: '#1e40af', code: '#1d4ed8' },
        { bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '#22c55e', text: '#166534', code: '#15803d' },
        { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '#f97316', text: '#9a3412', code: '#c2410c' },
        { bg: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', border: '#a855f7', text: '#6b21a8', code: '#7e22ce' },
        { bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', border: '#f43f5e', text: '#9f1239', code: '#be123c' },
        { bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', border: '#14b8a6', text: '#134e4a', code: '#0f766e' },
    ];

    // Assign consistent colors to each class section
    const sectionColorMap = useMemo(() => {
        const map = {};
        scheduleData.forEach((s, idx) => {
            map[s._id || s.code] = classColors[idx % classColors.length];
        });
        return map;
    }, [scheduleData]);

    const openOverrideModal = useCallback((section) => {
        setOverrideModal({ open: true, section });
    }, []);

    const handleOverrideSuccess = useCallback(() => {
        if (selectedTermId) loadSchedule(selectedTermId);
    }, [selectedTermId]);

    // Helper: lấy existing override của 1 section cho tuần hiện tại
    const getExistingOverride = (section) => {
        return section?.weeklyOverrides?.find(o => o.week === selectedWeek) || null;
    };

    return (
        <div className="schedule-page animate-fade-in">
            {/* Header */}
            <div className="schedule-header">
                <div className="schedule-header-left">
                    <div className="schedule-header-icon">
                        <CalendarOutlined />
                    </div>
                    <div>
                        <Title level={2} className="premium-title" style={{ margin: 0 }}>Thời khóa biểu</Title>
                        <Text className="premium-subtitle">
                            {isTeacher ? 'Lịch dạy cá nhân theo tuần và học kỳ' : 'Lịch học cá nhân theo tuần và học kỳ'}
                        </Text>
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            <Card className="glass-panel schedule-filter-card" variant="borderless">
                <Row gutter={[16, 16]} align="middle" wrap>
                    <Col>
                        <Text type="secondary" style={{ fontSize: 13 }}>Năm học:</Text>
                    </Col>
                    <Col>
                        <Select
                            value={selectedYear}
                            style={{ width: 130 }}
                            onChange={(yr) => {
                                setSelectedYear(yr);
                                // Reset term selection to first term for this year
                                const firstTermForYear = terms.find(t => {
                                    if (!t.startDate) return false;
                                    return new Date(t.startDate).getFullYear() === yr;
                                });
                                if (firstTermForYear) setSelectedTermId(firstTermForYear._id);
                            }}
                            placeholder="Năm học"
                        >
                            {academicYears.map(yr => (
                                <Option key={yr} value={yr}>{yr} - {yr + 1}</Option>
                            ))}
                        </Select>
                    </Col>

                    <Col>
                        <Text type="secondary" style={{ fontSize: 13 }}>Học kỳ:</Text>
                    </Col>
                    <Col>
                        <Select
                            value={selectedTermId}
                            style={{ width: 200 }}
                            onChange={(id) => {
                                setSelectedTermId(id);
                                setSelectedWeek(1);
                            }}
                            placeholder="Chọn học kỳ"
                        >
                            {filteredTermsByYear.map(t => (
                                <Option key={t._id} value={t._id}>{t.name}</Option>
                            ))}
                        </Select>
                    </Col>

                    <Col>
                        <Text type="secondary" style={{ fontSize: 13 }}>Tuần:</Text>
                    </Col>
                    <Col>
                        <Select
                            value={selectedWeek}
                            style={{ width: 100 }}
                            onChange={setSelectedWeek}
                        >
                            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => (
                                <Option key={w} value={w}>Tuần {w}</Option>
                            ))}
                        </Select>
                    </Col>

                    {weekRange && (
                        <Col>
                            <Tag color="blue" style={{ borderRadius: 6, padding: '4px 10px', fontSize: 13 }}>
                                📅 Tuần {selectedWeek}: {formatDate(weekRange.start)} – {formatDate(weekRange.end)}
                            </Tag>
                        </Col>
                    )}

                    {isTeacher && (
                        <Col>
                            <Tag color="purple" style={{ borderRadius: 6, padding: '4px 10px', fontSize: 13 }}>
                                ✏️ Click vào ô lịch để tùy chỉnh tuần này
                            </Tag>
                        </Col>
                    )}
                </Row>
            </Card>

            {/* Timetable Grid */}
            <Card className="glass-panel" variant="borderless" style={{ padding: 0 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Spin size="large" />
                    </div>
                ) : !selectedTermId ? (
                    <Empty description="Vui lòng chọn học kỳ để xem lịch học" />
                ) : (
                    <div className="schedule-table-wrapper">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th className="th-period">Tiết</th>
                                    {DAYS.map(day => (
                                        <th key={day.value} className="th-day">
                                            {day.label}
                                            {weekRange && (
                                                <div className="th-date">
                                                    {formatDate(new Date(weekRange.start.getTime() + (day.value - 2) * 86400000))}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERIODS.map(period => (
                                    <tr key={period} className={period === 6 ? 'period-break-before' : ''}>
                                        <td className="td-period">
                                            <span className="period-num">{period}</span>
                                            <span className="period-time">{TIME_MAPPINGS[period]}</span>
                                        </td>
                                        {DAYS.map(day => {
                                            const classInfo = getClassAt(day.value, period);
                                            if (classInfo) {
                                                const colors = sectionColorMap[classInfo.section._id || classInfo.section.code] || classColors[0];
                                                const existingOv = getExistingOverride(classInfo.section);

                                                // === Ô bị hủy ===
                                                if (classInfo.isCancelled) {
                                                    return (
                                                        <td
                                                            key={`${day.value}-${period}`}
                                                            rowSpan={classInfo.rowSpan}
                                                            className="td-class"
                                                        >
                                                            <div
                                                                className="class-block"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                                                    borderLeftColor: '#94a3b8',
                                                                    opacity: 0.75,
                                                                    cursor: isTeacher ? 'pointer' : 'default',
                                                                }}
                                                                onClick={isTeacher ? () => openOverrideModal(classInfo.section) : undefined}
                                                            >
                                                                <div className="cb-name" style={{ color: '#64748b', textDecoration: 'line-through' }}>
                                                                    {classInfo.section.subject?.name}
                                                                </div>
                                                                <div className="cb-code" style={{ color: '#94a3b8' }}>
                                                                    {classInfo.section.code}
                                                                </div>
                                                                <div className="cb-badges" style={{ marginTop: 4 }}>
                                                                    <span className="cb-badge" style={{ background: '#ef4444', color: '#fff', fontSize: 11 }}>
                                                                        🚫 Đã hủy tuần này
                                                                    </span>
                                                                </div>
                                                                {classInfo.override?.note && (
                                                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>
                                                                        {classInfo.override.note}
                                                                    </div>
                                                                )}
                                                                {isTeacher && (
                                                                    <div style={{ marginTop: 6 }}>
                                                                        <span style={{
                                                                            fontSize: 11, color: '#6366f1',
                                                                            background: '#ede9fe', borderRadius: 4, padding: '2px 6px',
                                                                            cursor: 'pointer'
                                                                        }}>
                                                                            ✏️ Chỉnh sửa
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                // === Ô bình thường / có override khác ===
                                                const hasOverride = !!classInfo.override;
                                                const isOnline = classInfo.override?.overrideType === 'online'
                                                    || classInfo.section.teachingMethod === 'Trực tuyến';
                                                const isRescheduled = classInfo.override?.overrideType === 'reschedule';

                                                return (
                                                    <td
                                                        key={`${day.value}-${period}`}
                                                        rowSpan={classInfo.rowSpan}
                                                        className="td-class"
                                                    >
                                                        <div
                                                            className="class-block"
                                                            style={{
                                                                background: colors.bg,
                                                                borderLeftColor: colors.border,
                                                                cursor: isTeacher ? 'pointer' : 'default',
                                                                outline: hasOverride ? `2px dashed ${colors.border}` : undefined,
                                                                position: 'relative',
                                                            }}
                                                            onClick={isTeacher ? () => openOverrideModal(classInfo.section) : undefined}
                                                        >
                                                            {/* Override indicator badge */}
                                                            {hasOverride && (
                                                                <div style={{
                                                                    position: 'absolute', top: 4, right: 4,
                                                                    background: isRescheduled ? '#f97316' : '#3b82f6',
                                                                    color: '#fff', borderRadius: 4,
                                                                    fontSize: 10, padding: '1px 5px',
                                                                    fontWeight: 700
                                                                }}>
                                                                    {isRescheduled ? '📅 Đổi lịch' : '🖥 Online'}
                                                                </div>
                                                            )}

                                                            <div className="cb-name" style={{ color: colors.text }}>
                                                                {classInfo.section.subject?.name}
                                                            </div>
                                                            <div className="cb-code" style={{ color: colors.code }}>
                                                                {classInfo.section.code}
                                                            </div>
                                                            <div className="cb-info">
                                                                <ClockCircleOutlined className="cb-icon" />
                                                                Tiết {classInfo.sched.startPeriod}–{classInfo.sched.endPeriod}
                                                            </div>
                                                            <div className="cb-info">
                                                                <EnvironmentOutlined className="cb-icon" />
                                                                {classInfo.sched.room}
                                                            </div>
                                                            {classInfo.section.teacher && (
                                                                <div className="cb-teacher" style={{ fontWeight: 'bold' }}>
                                                                    <ReadOutlined className="cb-icon" />
                                                                    GV: {classInfo.section.teacher.fullName}
                                                                </div>
                                                            )}
                                                            <div className="cb-badges">
                                                                {classInfo.section.phase === 1 && <span className="cb-badge cb-badge-phase1">Đợt 1</span>}
                                                                {classInfo.section.phase === 2 && <span className="cb-badge cb-badge-phase2">Đợt 2</span>}
                                                                <span className={`cb-badge ${
                                                                    (classInfo.override?.overrideType === 'online' || classInfo.section.teachingMethod === 'Trực tuyến')
                                                                        ? 'cb-badge-online'
                                                                        : classInfo.section.teachingMethod === 'Kết hợp'
                                                                        ? 'cb-badge-blend'
                                                                        : 'cb-badge-offline'
                                                                }`}>
                                                                    {(classInfo.override?.overrideType === 'online' || classInfo.section.teachingMethod === 'Trực tuyến')
                                                                        ? '🖥 TT Online'
                                                                        : classInfo.section.teachingMethod === 'Kết hợp'
                                                                        ? '🔀 Kết hợp'
                                                                        : '🏫 Tập trung'}
                                                                </span>
                                                                <span className="cb-badge cb-badge-lang">
                                                                    🌐 {classInfo.section.language || 'Tiếng Việt'}
                                                                </span>
                                                            </div>

                                                            {/* Ghi chú override */}
                                                            {classInfo.override?.note && (
                                                                <div style={{
                                                                    fontSize: 11, color: '#64748b',
                                                                    marginTop: 4, fontStyle: 'italic',
                                                                    borderTop: '1px dashed #e2e8f0', paddingTop: 4
                                                                }}>
                                                                    💬 {classInfo.override.note}
                                                                </div>
                                                            )}

                                                            {/* Nút tùy chỉnh dành cho giảng viên */}
                                                            {isTeacher && (
                                                                <div style={{ marginTop: 6 }}>
                                                                    <span style={{
                                                                        fontSize: 11, color: '#6366f1',
                                                                        background: '#ede9fe', borderRadius: 4, padding: '2px 6px',
                                                                        cursor: 'pointer', display: 'inline-block',
                                                                    }}>
                                                                        ✏️ Tùy chỉnh tuần {selectedWeek}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            } else if (!isCellOccupied(day.value, period)) {
                                                return <td key={`${day.value}-${period}`} className="td-empty" />;
                                            }
                                            return null;
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Weekly Override Modal (chỉ giảng viên) */}
            {isTeacher && (
                <WeeklyOverrideModal
                    open={overrideModal.open}
                    onClose={() => setOverrideModal({ open: false, section: null })}
                    onSuccess={handleOverrideSuccess}
                    section={overrideModal.section}
                    week={selectedWeek}
                    termId={selectedTermId}
                    existingOverride={overrideModal.section ? getExistingOverride(overrideModal.section) : null}
                />
            )}
        </div>
    );
};

export default StudentSchedulePage;
