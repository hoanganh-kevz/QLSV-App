import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Tag, Row, Col, Statistic, Button, message, Spin, Empty, Alert, Space } from 'antd';
import { DollarOutlined, CreditCardOutlined, HistoryOutlined, CheckCircleOutlined, InfoCircleOutlined, WalletOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import tuitionService from '../../services/tuitionService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const TuitionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTuition();
  }, []);

  const fetchTuition = async () => {
    try {
      setLoading(true);
      const res = user.role === 'student' 
        ? await tuitionService.getMyTuition() 
        : await tuitionService.getAllTuitions();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      message.error('Không thể tải thông tin học phí');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return data.reduce((acc, curr) => {
      acc.total += curr.totalAmount || 0;
      acc.paid += curr.paidAmount || 0;
      acc.unpaid += (curr.totalAmount || 0) - (curr.paidAmount || 0);
      return acc;
    }, { total: 0, paid: 0, unpaid: 0 });
  };

  const totals = calculateTotals();

  const getStatusTag = (status) => {
    switch (status) {
      case 'Paid': return <Tag color="success">Đã hoàn thành</Tag>;
      case 'Partial': return <Tag color="warning">Đã nộp một phần</Tag>;
      default: return <Tag color="error">Chưa hoàn thành</Tag>;
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const columns = [
    {
      title: 'Học kỳ',
      dataIndex: ['term', 'name'],
      key: 'termName',
      render: (text, record) => (
        <span>{record.term?.name} ({record.term?.code})</span>
      )
    },
    {
      title: 'Hạn chót',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '---',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Đã nộp',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (val) => formatCurrency(val || 0),
    },
    {
      title: 'Còn nợ',
      key: 'balance',
      render: (_, record) => (
        <Text strong type={record.totalAmount > record.paidAmount ? 'danger' : 'success'}>
          {formatCurrency(record.totalAmount - (record.paidAmount || 0))}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        record.status !== 'Paid' && (
          <Button type="link" icon={<CreditCardOutlined />} onClick={() => message.info('Tính năng thanh toán đang được tích hợp')}>
            Thanh toán
          </Button>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" description="Đang truy xuất dữ liệu học phí..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Quản lý Học phí</Title>
          <Text type="secondary">Theo dõi và thực hiện nghĩa vụ tài chính học tập</Text>
        </div>
        <Button icon={<HistoryOutlined />} onClick={fetchTuition}>Làm mới</Button>
      </div>

      {user.role === 'student' && (
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12 }}>
              <Statistic 
                title={<Text strong>Tổng học phí</Text>}
                value={totals.total}
                prefix={<DollarOutlined />}
                formatter={(val) => formatCurrency(val)}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12 }}>
              <Statistic 
                title={<Text strong style={{ color: '#52c41a' }}>Đã nộp</Text>}
                value={totals.paid}
                styles={{ content: { color: '#52c41a' } }}
                prefix={<CheckCircleOutlined />}
                formatter={(val) => formatCurrency(val)}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12 }}>
              <Statistic 
                title={<Text strong style={{ color: '#ff4d4f' }}>Còn nợ</Text>}
                value={totals.unpaid}
                styles={{ content: { color: '#ff4d4f' } }}
                prefix={<WalletOutlined />}
                formatter={(val) => formatCurrency(val)}
              />
            </Card>
          </Col>
        </Row>
      )}

      {totals.unpaid > 0 && user.role === 'student' && (
        <Alert
          title="Thông báo nhắc nợ"
          description={`Bạn hiện còn nợ ${formatCurrency(totals.unpaid)} học phí. Vui lòng hoàn thành trước hạn chót để tránh ảnh hưởng đến việc đăng ký học phần.`}
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12 }}>
        {data.length === 0 ? (
          <Empty description="Chưa có dữ liệu học phí" />
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

export default TuitionPage;
