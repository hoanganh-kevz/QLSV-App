import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Tag, Button, message, Spin, Empty, Alert, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, InfoCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import examScheduleService from '../../services/examScheduleService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const ExamSchedulePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = user.role === 'student' 
        ? await examScheduleService.getMySchedule() 
        : await examScheduleService.getAllSchedules();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      message.error('Không thể tải lịch thi');
    } finally {
      setLoading(false);
    }
  };

  const getExamTypeTag = (type) => {
    switch (type) {
      case 'Final': return <Tag color="red">Thi cuối kỳ</Tag>;
      case 'Midterm': return <Tag color="orange">Thi giữa kỳ</Tag>;
      default: return <Tag color="blue">{type}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Môn thi',
      dataIndex: ['classSection', 'subject', 'name'],
      key: 'subjectName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.classSection?.subject?.code}</Text>
        </Space>
      )
    },
    {
      title: 'Hình thức',
      dataIndex: 'examType',
      key: 'examType',
      render: (type) => getExamTypeTag(type),
    },
    {
      title: 'Ngày thi',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD/MM/YYYY')}
        </Space>
      ),
    },
    {
      title: 'Giờ bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) => (
        <Space>
          <ClockCircleOutlined />
          {time}
        </Space>
      ),
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      render: (val) => `${val} phút`,
    },
    {
      title: 'Phòng thi',
      dataIndex: 'room',
      key: 'room',
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => text || '---',
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Lịch thi</Title>
          <Text type="secondary">Xem thời gian và địa điểm tổ chức thi các học phần</Text>
        </div>
        <Button icon={<ExportOutlined />} onClick={() => message.info('Tính năng xuất lịch thi đang được phát triển')}>
          Xuất lịch thi
        </Button>
      </div>

      <Alert
        title="Lưu ý quan trọng"
        description="Sinh viên cần có mặt tại phòng thi trước giờ bắt đầu ít nhất 15 phút và mang theo Thẻ sinh viên để vào phòng thi."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24, borderRadius: 12 }}
      />

      <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" description="Đang truy xuất lịch thi..." />
          </div>
        ) : data.length === 0 ? (
          <Empty description="Bạn chưa có lịch thi nào được sắp xếp" />
        ) : (
          <Table 
            columns={columns} 
            dataSource={data} 
            rowKey="_id"
            pagination={false}
          />
        )}
      </Card>
    </div>
  );
};

export default ExamSchedulePage;
