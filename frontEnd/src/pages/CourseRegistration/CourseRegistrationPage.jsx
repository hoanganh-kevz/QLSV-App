import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Tag, Button, Tabs, message, Spin, Empty, Statistic, Row, Col, Space, Modal, Input, Badge, Alert } from 'antd';
import { AppstoreAddOutlined, SolutionOutlined, DeleteOutlined, InfoCircleOutlined, SearchOutlined, BookOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import courseRegistrationService from '../../services/courseRegistrationService';

const { Title, Text, Paragraph } = Typography;

const CourseRegistrationPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availableRes, myRes] = await Promise.all([
        courseRegistrationService.getAvailableClasses(),
        courseRegistrationService.getMyRegistrations()
      ]);
      
      if (availableRes.success) setAvailableClasses(availableRes.data);
      if (myRes.success) setMyRegistrations(myRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Không thể tải dữ liệu đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (classId) => {
    try {
      setSubmitting(true);
      const res = await courseRegistrationService.registerClass(classId);
      if (res.success) {
        message.success('Đăng ký lớp học thành công');
        fetchData();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi đăng ký');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (registrationId) => {
    Modal.confirm({
      title: 'Xác nhận hủy đăng ký',
      content: 'Bạn có chắc chắn muốn hủy đăng ký lớp học này?',
      okText: 'Hủy đăng ký',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await courseRegistrationService.cancelRegistration(registrationId);
          if (res.success) {
            message.success('Đã hủy đăng ký');
            fetchData();
          }
        } catch (error) {
          message.error('Lỗi khi hủy đăng ký');
        }
      }
    });
  };

  const totalCredits = myRegistrations.reduce((acc, curr) => acc + (curr.classSection?.subject?.credits || 0), 0);

  const availableColumns = [
    {
      title: 'Mã lớp',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Tên học phần',
      dataIndex: ['subject', 'name'],
      key: 'subjectName',
      render: (text, record) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.subject?.code}</Text>
        </Space>
      )
    },
    {
      title: 'Số tín chỉ',
      dataIndex: ['subject', 'credits'],
      key: 'credits',
    },
    {
      title: 'Giảng viên',
      dataIndex: ['teacher', 'fullName'],
      key: 'teacherName',
    },
    {
      title: 'Sĩ số',
      key: 'capacity',
      render: (_, record) => (
        <span>{record.maxStudents}</span>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const isRegistered = myRegistrations.some(r => r.classSection?._id === record._id);
        return (
          <Button 
            type="primary" 
            disabled={isRegistered}
            onClick={() => handleRegister(record._id)}
          >
            {isRegistered ? 'Đã đăng ký' : 'Đăng ký'}
          </Button>
        );
      }
    }
  ];

  const myColumns = [
    {
      title: 'Mã lớp',
      dataIndex: ['classSection', 'code'],
      key: 'classCode',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Tên học phần',
      dataIndex: ['classSection', 'subject', 'name'],
      key: 'subjectName',
    },
    {
      title: 'Số tín chỉ',
      dataIndex: ['classSection', 'subject', 'credits'],
      key: 'credits',
    },
    {
      title: 'Loại hình',
      key: 'type',
      render: (_, record) => (
        <Tag color={record.isCohort ? 'purple' : 'cyan'}>
          {record.isCohort ? 'Lớp chỉ định' : 'Đăng ký lẻ'}
        </Tag>
      )
    },
    {
      title: 'Học kỳ',
      dataIndex: ['classSection', 'term', 'code'],
      key: 'termCode',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Registered' ? 'success' : 'default'}>
          {status === 'Registered' ? 'Đã tham gia' : status}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => !record.isCohort && (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleCancel(record._id)}
        >
          Hủy
        </Button>
      )
    }
  ];

  const filteredClasses = availableClasses.filter(c => 
    c.subject?.name.toLowerCase().includes(searchText.toLowerCase()) || 
    c.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <AppstoreAddOutlined /> Đăng ký mới
        </span>
      ),
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Input 
              placeholder="Tìm kiếm môn học, mã lớp..." 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div> : (
            <Table 
              columns={availableColumns} 
              dataSource={filteredClasses} 
              rowKey="_id"
              pagination={{ pageSize: 8, placement: 'bottomCenter' }}
            />
          )}
        </>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <SolutionOutlined /> Lớp đã đăng ký
        </span>
      ),
      children: (
        loading ? <div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div> : (
          <Table 
            columns={myColumns} 
            dataSource={myRegistrations} 
            rowKey="_id"
            pagination={false}
          />
        )
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Đăng ký học phần</Title>
          <Text type="secondary">Đăng ký lớp học theo kế hoạch học tập của học kỳ</Text>
        </div>
        <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12, padding: '0 12px' }}>
          <Statistic 
            title="Tổng tín chỉ đã đăng ký" 
            value={totalCredits} 
            suffix="/ 25"
            styles={{ content: { color: 'var(--primary-color)' } }}
          />
        </Card>
      </div>

      <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12 }}>
        <Tabs defaultActiveKey="1" size="large" items={tabItems} />
      </Card>

      <div style={{ marginTop: 24 }}>
         <Alert
          title="Hướng dẫn quan trọng"
          description="Bạn chỉ có thể đăng ký tối đa 25 tín chỉ mỗi học kỳ. Sau khi hết thời gian đăng ký, bạn sẽ không thể hủy hoặc đổi lớp trực tiếp trên hệ thống."
          type="info"
          showIcon
          style={{ borderRadius: 12 }}
        />
      </div>
    </div>
  );
};

export default CourseRegistrationPage;
