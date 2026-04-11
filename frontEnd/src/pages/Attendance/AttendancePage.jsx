import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Tag, DatePicker, Select, Button, Space, message, Spin, Badge, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FilterOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';
import { classSectionService } from '../../services/classSectionService';
import { termService } from '../../services/termService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const AttendancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (user.role === 'student') {
      fetchStudentHistory();
    } else if (user.role === 'teacher' || user.role === 'admin') {
      loadInitialData();
    }
  }, [user.role]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [classRes, termRes] = await Promise.all([
        classSectionService.getAllSections(),
        termService.getAllTerms()
      ]);

      if (termRes.success) {
        setTerms(termRes.data);
        const activeTerm = termRes.data.find(t => t.isDefault || t.status === 'Active');
        if (activeTerm) setSelectedTerm(activeTerm._id);
      }

      if (classRes.success) {
        // No client-side filtering needed here as Backend already handles it securely for teachers
        setClasses(classRes.data);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu ban đầu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentHistory = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getMyHistory();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      message.error('Không thể tải lịch sử điểm danh');
    } finally {
      setLoading(false);
    }
  };

  // Filtered classes based on term
  const filteredClasses = React.useMemo(() => {
    if (!selectedTerm) return classes;
    return classes.filter(c => (typeof c.term === 'object' ? c.term._id : c.term) === selectedTerm);
  }, [classes, selectedTerm]);

  const handleTermChange = (val) => {
    setSelectedTerm(val);
    setSelectedClass(null);
    setData([]);
  };

  const availableSessions = React.useMemo(() => {
    if (!selectedClass) return [];
    
    const classData = classes.find(c => c._id === selectedClass);
    if (!classData || !classData.subject || !classData.term?.startDate) return [];

    const credits = classData.subject.credits || 3;
    const totalWeeks = credits * 3;
    const termStart = dayjs(classData.term.startDate);
    
    // Day conversion: Monday = 2, Sunday = 8
    // dayjs day(): Sunday = 0, Monday = 1...
    // We assume termStart is a Monday. If not, we find the first Monday.
    // However, usually Term.startDate is the Monday of Week 1.
    const sessions = [];
    const dayOfWeek = classData.schedule && classData.schedule.length > 0 
      ? classData.schedule[0].dayOfWeek 
      : 2;

    for (let w = 1; w <= totalWeeks; w++) {
      const sessionDate = termStart.add(w - 1, 'week').add(dayOfWeek - 2, 'day');
      sessions.push({
        week: w,
        date: sessionDate,
        label: `Tuần ${w} (${sessionDate.format('DD/MM/YYYY')})`,
        value: sessionDate.format('YYYY-MM-DD')
      });
    }
    return sessions;
  }, [selectedClass, classes]);

  const fetchClassAttendance = async (classId, dateStr) => {
    try {
      setLoading(true);
      
      // Fetch roster and attendance concurrently
      const [rosterRes, attendanceRes] = await Promise.all([
        classSectionService.getSectionRoster(classId),
        attendanceService.getClassRecords(classId, dateStr)
      ]);
      
      if (rosterRes.success && attendanceRes.success) {
        const students = rosterRes.data || [];
        const attendanceData = attendanceRes.data || [];
        
        const merged = students.map(s => {
          const record = attendanceData.find(r => r.student?._id === s._id || r.student === s._id);
          return {
            ...s,
            status: record?.status || 'Not Marked',
            note: record?.note || ''
          };
        });
        setData(merged);
      } else {
        message.warning('Không tìm thấy danh sách sinh viên hoặc dữ liệu điểm danh');
        setData([]);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu điểm danh lớp');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (val) => {
    setSelectedClass(val);
    
    // Auto-select session closest to today
    const classData = classes.find(c => c._id === val);
    if (classData && classData.subject) {
      const credits = classData.subject.credits || 3;
      const totalWeeks = credits * 3;
      const termStart = dayjs(classData.term.startDate);
      const dayOfWeek = classData.schedule?.[0]?.dayOfWeek || 2;
      
      let closestSession = null;
      let minDiff = Infinity;
      const today = dayjs();

      for (let w = 1; w <= totalWeeks; w++) {
        const sessionDate = termStart.add(w - 1, 'week').add(dayOfWeek - 2, 'day');
        const diff = Math.abs(today.diff(sessionDate, 'day'));
        if (diff < minDiff) {
          minDiff = diff;
          closestSession = sessionDate;
        }
      }
      
      if (closestSession) {
        setSelectedDate(closestSession);
        fetchClassAttendance(val, closestSession.format('YYYY-MM-DD'));
      }
    }
  };

  const handleSessionChange = (dateStr) => {
    if (dateStr) {
      const date = dayjs(dateStr);
      setSelectedDate(date);
      if (selectedClass) fetchClassAttendance(selectedClass, dateStr);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setData(prev => prev.map(s => s._id === studentId ? { ...s, status } : s));
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;
    try {
      setMarking(true);
      const records = data
        .filter(s => s.status !== 'Not Marked')
        .map(s => ({
          studentId: s._id,
          status: s.status,
          note: s.note
        }));
      
      const res = await attendanceService.batchMark({
        classSectionId: selectedClass,
        date: selectedDate.format('YYYY-MM-DD'),
        records
      });
      
      if (res.success) {
        message.success('Đã lưu thông tin điểm danh');
      }
    } catch (error) {
      message.error('Lỗi khi lưu điểm danh');
    } finally {
      setMarking(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'Present': return <Tag color="success" icon={<CheckCircleOutlined />}>Có mặt</Tag>;
      case 'Absent': return <Tag color="error" icon={<CloseCircleOutlined />}>Vắng</Tag>;
      case 'Late': return <Tag color="warning" icon={<ClockCircleOutlined />}>Đi trễ</Tag>;
      default: return <Tag color="default">Chưa điểm danh</Tag>;
    }
  };

  const studentColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Môn học',
      dataIndex: ['classSection', 'subject', 'name'],
      key: 'subject',
      render: (text, record) => (
        <span>
          <Text strong>{record.classSection?.subject?.code}</Text> - {record.classSection?.subject?.name}
        </span>
      ),
    },
    {
      title: 'Lớp',
      dataIndex: ['classSection', 'code'],
      key: 'classCode',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
  ];

  const teacherColumns = [
    {
      title: 'MSSV',
      dataIndex: 'mssv',
      key: 'mssv',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Điểm danh',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            type={record.status === 'Present' ? 'primary' : 'default'}
            onClick={() => handleStatusChange(record._id, 'Present')}
            style={record.status === 'Present' ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
          >
            Có mặt
          </Button>
          <Button 
            size="small" 
            danger={record.status === 'Absent'}
            type={record.status === 'Absent' ? 'primary' : 'default'}
            onClick={() => handleStatusChange(record._id, 'Absent')}
          >
            Vắng
          </Button>
          <Button 
            size="small" 
            type={record.status === 'Late' ? 'primary' : 'default'}
            onClick={() => handleStatusChange(record._id, 'Late')}
            style={record.status === 'Late' ? { background: '#faad14', borderColor: '#faad14', color: 'white' } : {}}
          >
            Trễ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Điểm danh</Title>
          <Text type="secondary">Quản lý và xem lịch sử điểm danh chuyên cần</Text>
        </div>
        {user.role !== 'student' && selectedClass && (
           <Button type="primary" size="large" onClick={saveAttendance} loading={marking}>
             Lưu điểm danh
           </Button>
        )}
      </div>

      {user.role !== 'student' && (
        <Card variant="outlined" style={{ marginBottom: 24, borderRadius: 12 }} className="glass-panel">
          <Space size="large" wrap>
            <div style={{ width: 220 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Học kỳ:</Text>
              <Select 
                placeholder="Chọn học kỳ" 
                style={{ width: '100%' }} 
                onChange={handleTermChange}
                value={selectedTerm}
              >
                {terms.map(t => (
                  <Option key={t._id} value={t._id}>{t.name}</Option>
                ))}
              </Select>
            </div>
            <div style={{ width: 300 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Chọn lớp học phần:</Text>
              <Select 
                placeholder="Chọn lớp" 
                style={{ width: '100%' }} 
                onChange={handleClassChange}
                value={selectedClass}
                disabled={!selectedTerm}
              >
                {filteredClasses.map(c => (
                  <Option key={c._id} value={c._id}>{c.code} - {c.subject?.name}</Option>
                ))}
              </Select>
            </div>
            <div style={{ width: 220 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Chọn tuần/ngày:</Text>
              <Select 
                placeholder="Chọn tuần học" 
                style={{ width: '100%' }} 
                onChange={handleSessionChange}
                value={selectedDate.format('YYYY-MM-DD')}
                disabled={!selectedClass}
              >
                {availableSessions.map(s => (
                  <Option key={s.value} value={s.value}>{s.label}</Option>
                ))}
              </Select>
            </div>
          </Space>
        </Card>
      )}

      {user.role !== 'student' && selectedClass && (
        <Alert
          message={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                <Text strong>Quy định đi trễ: </Text>
                {(() => {
                  const cls = classes.find(c => c._id === selectedClass);
                  const penalty = cls?.attendanceRules?.latePenalty || 0;
                  if (penalty === 0) return <Tag color="success">🟢 Có mặt (Không trừ điểm)</Tag>;
                  if (penalty === 0.5) return <Tag color="warning">🟡 Trừ 0.5 buổi vắng</Tag>;
                  return <Tag color="error">🔴 Vắng học (Trừ 1 buổi)</Tag>;
                })()}
                <Text type="secondary" style={{ marginLeft: 16 }}>
                  (Hệ thống tự động tính điểm chuyên cần & Cấm thi 30% dựa trên quy tắc này)
                </Text>
              </span>
              <Button type="link" size="small" onClick={() => window.location.href = '/grades/entry'}>
                Thay đổi cấu hình
              </Button>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      <Card variant="outlined" style={{ borderRadius: 12, overflow: 'hidden' }} className="glass-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" description="Đang tải dữ liệu điểm danh..." />
          </div>
        ) : (
          <Table 
            columns={user.role === 'student' ? studentColumns : teacherColumns} 
            dataSource={data}
            rowKey="_id"
            pagination={{ pageSize: 10, placement: 'bottomCenter' }}
          />
        )}
      </Card>
    </div>
  );
};

export default AttendancePage;
