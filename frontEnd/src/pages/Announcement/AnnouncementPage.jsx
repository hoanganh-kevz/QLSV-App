import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, List, Tag, Modal, Form, Input, Select, Space, message, Spin, Empty, Badge } from 'antd';
import { NotificationOutlined, PlusOutlined, DeleteOutlined, InfoCircleOutlined, ThunderboltOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import announcementService from '../../services/announcementService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AnnouncementPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementService.getAll();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      message.error('Không thể tải bảng tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      setSubmitting(true);
      const res = await announcementService.createAnnouncement(values);
      if (res.success) {
        message.success('Đã đăng thông báo mới');
        setIsModalOpen(false);
        form.resetFields();
        fetchAnnouncements();
      }
    } catch (error) {
      message.error('Lỗi khi đăng thông báo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa thông báo này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await announcementService.deleteAnnouncement(id);
          if (res.success) {
            message.success('Đã xóa thông báo');
            fetchAnnouncements();
          }
        } catch (error) {
          message.error('Lỗi khi xóa thông báo');
        }
      }
    });
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Academic': return 'blue';
      case 'Financial': return 'gold';
      case 'Activity': return 'green';
      default: return 'default';
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'Academic': return 'Học thuật';
      case 'Financial': return 'Tài chính';
      case 'Activity': return 'Hoạt động';
      default: return 'Chung';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Bảng tin</Title>
          <Text type="secondary">Cập nhật những thông tin mới nhất từ nhà trường</Text>
        </div>
        {user.role === 'admin' && (
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalOpen(true)}>
            Đăng thông báo
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" description="Đang tải tin tức..." />
        </div>
      ) : data.length === 0 ? (
        <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12 }}>
          <Empty description="Chưa có thông báo nào" />
        </Card>
      ) : (
        <List
          grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <Badge.Ribbon 
                text={item.isUrgent ? 'Khẩn' : getCategoryLabel(item.category)} 
                color={item.isUrgent ? 'red' : getCategoryColor(item.category)}
              >
                <Card 
                  hoverable 
                  variant="outlined"
                  className="glass-panel announcement-card" 
                  style={{ borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column' }}
                  actions={user.role === 'admin' ? [
                    <DeleteOutlined key="delete" onClick={() => handleDelete(item._id)} style={{ color: '#ff4d4f' }} />
                  ] : []}
                >
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </div>
                  <Title level={4} style={{ marginTop: 0, marginBottom: 12, lineHeight: 1.4 }}>{item.title}</Title>
                  <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }} style={{ flex: 1 }}>
                    {item.content}
                  </Paragraph>
                  <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                    <NotificationOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
                    <Text strong style={{ fontSize: '12px' }}>{item.author?.name || 'Ban Quản trị'}</Text>
                  </div>
                </Card>
              </Badge.Ribbon>
            </List.Item>
          )}
        />
      )}

      <Modal
        title="Đăng thông báo mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ category: 'General', isUrgent: false }}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Nhập tiêu đề thông báo" />
          </Form.Item>
          <Form.Item name="category" label="Danh mục">
            <Select>
              <Option value="General">Chung</Option>
              <Option value="Academic">Học thuật</Option>
              <Option value="Financial">Tài chính</Option>
              <Option value="Activity">Hoạt động</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isUrgent" label="Mức độ khẩn cấp" valuePropName="checked">
            <Select>
              <Option value={false}>Bình thường</Option>
              <Option value={true}>Khẩn cấp (Hiện đỏ)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
            <TextArea rows={6} placeholder="Nhập nội dung chi tiết..." />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>Đăng tin</Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <style>{`
        .announcement-card {
          transition: transform 0.3s ease;
        }
        .announcement-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default AnnouncementPage;
