import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Table, Tag, Row, Col, 
  Statistic, Progress, Spin, Empty, message, Descriptions 
} from 'antd';
import { 
  TrophyOutlined, StarOutlined, CheckCircleOutlined, 
  InfoCircleOutlined, UserOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import trainingPointService from '../../services/trainingPointService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const TrainingPointPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const res = user.role === 'student' 
        ? await trainingPointService.getMyPoints() 
        : await trainingPointService.getAllPoints();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu điểm rèn luyện');
    } finally {
      setLoading(false);
    }
  };

  const currentRecord = data[0]; // Get latest semester record

  const getClassificationColor = (cls) => {
    switch (cls) {
      case 'Xuất sắc': return '#722ed1';
      case 'Tốt': return '#52c41a';
      case 'Khá': return '#1890ff';
      case 'Trung bình': return '#faad14';
      default: return '#f5222d';
    }
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
      title: 'Tổng điểm',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (val) => <Text strong style={{ fontSize: '16px' }}>{val}</Text>,
    },
    {
      title: 'Xếp loại',
      dataIndex: 'classification',
      key: 'classification',
      render: (cls) => (
        <Tag color={getClassificationColor(cls)} style={{ fontWeight: 'bold' }}>
          {cls.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    }
  ];

  const criteriaColumns = [
    {
      title: 'Nội dung đánh giá (Tiêu chí)',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Điểm tối đa',
      dataIndex: 'maxPoints',
      key: 'maxPoints',
      width: 120,
    },
    {
      title: 'Điểm đạt được',
      dataIndex: 'points',
      key: 'points',
      width: 150,
      render: (points, record) => (
        <Progress 
          percent={(points / record.maxPoints) * 100} 
          format={() => `${points}/${record.maxPoints}`} 
          size="small" 
          strokeColor={getClassificationColor(currentRecord?.classification)}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" description="Đang tải dữ liệu điểm rèn luyện..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Điểm rèn luyện</Title>
        <Text type="secondary">Theo dõi quá trình rèn luyện và hoạt động phong trào</Text>
      </div>

      {currentRecord ? (
        <>
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={16}>
              <Card className="glass-panel" style={{ borderRadius: 12, height: '100%' }}>
                <Descriptions title={<Title level={4}>Kết quả học kỳ mới nhất ({currentRecord.term?.name})</Title>} bordered column={1}>
                  <Descriptions.Item label="Họ tên SV">{user.fullName || 'Hồ sơ Sinh viên'}</Descriptions.Item>
                  <Descriptions.Item label="Mã sinh viên">{user.mssv || '---'}</Descriptions.Item>
                  <Descriptions.Item label="Tổng điểm rèn luyện">
                    <Text strong style={{ fontSize: '20px', color: getClassificationColor(currentRecord.classification) }}>
                      {currentRecord.totalPoints} / 100
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Xếp loại">
                    <Tag color={getClassificationColor(currentRecord.classification)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {currentRecord.classification}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Progress 
                  type="dashboard" 
                  percent={currentRecord.totalPoints} 
                  strokeColor={getClassificationColor(currentRecord.classification)}
                  strokeWidth={10}
                  width={180}
                />
                <div style={{ marginTop: 16 }}>
                  <Text strong>Tỷ lệ hoàn thành rèn luyện</Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Title level={4} style={{ marginBottom: 16 }}>Chi tiết các tiêu chí đánh giá</Title>
          <Card className="glass-panel" style={{ borderRadius: 12, marginBottom: 24 }}>
            <Table 
              columns={criteriaColumns} 
              dataSource={currentRecord.criteria} 
              pagination={false} 
              rowKey="category"
            />
          </Card>

          <Title level={4} style={{ marginBottom: 16 }}>Lịch sử các học kỳ</Title>
          <Card className="glass-panel" style={{ borderRadius: 12 }}>
            <Table 
              columns={columns} 
              dataSource={data} 
              rowKey="_id"
            />
          </Card>
        </>
      ) : (
        <Card className="glass-panel" style={{ borderRadius: 12 }}>
          <Empty description="Chứa có dữ liệu điểm rèn luyện cho tài khoản này" />
        </Card>
      )}
    </div>
  );
};

export default TrainingPointPage;
