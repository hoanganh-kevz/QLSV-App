import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Tag, Button, Modal, Form, Input, Select, Space, message, Spin, Empty, Descriptions, DatePicker, Popconfirm, Tooltip } from 'antd';
import { FileProtectOutlined, PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import petitionService from '../../services/petitionService';
import { studentService } from '../../services/studentService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PetitionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [form] = Form.useForm();
  const [processForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [studentClasses, setStudentClasses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPetitions();
    if (user.role === 'student') {
      fetchStudentClasses();
    }
  }, []);

  const fetchStudentClasses = async () => {
    try {
      const res = await studentService.getStudentSchedule('me', '');
      if (res.success) {
        setStudentClasses(res.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách lớp học phần:', error);
    }
  };

  const fetchPetitions = async () => {
    try {
      setLoading(true);
      const res = user.role === 'student' 
        ? await petitionService.getMyPetitions() 
        : await petitionService.getAllPetitions();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      message.error('Không thể tải danh sách đơn từ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const res = editingId 
        ? await petitionService.updatePetition(editingId, values)
        : await petitionService.createPetition(values);
      if (res.success) {
        message.success(`Đã ${editingId ? 'cập nhật' : 'gửi'} đơn thành công`);
        setIsModalOpen(false);
        form.resetFields();
        setEditingId(null);
        fetchPetitions();
      }
    } catch (error) {
      message.error(`Lỗi khi ${editingId ? 'cập nhật' : 'gửi'} đơn`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await petitionService.deletePetition(id);
      if (res.success) {
        message.success('Đã xóa đơn thành công');
        fetchPetitions();
      }
    } catch (error) {
      message.error('Lỗi khi xóa đơn');
      setLoading(false);
    }
  };

  const handleProcess = async (values) => {
    try {
      setSubmitting(true);
      const res = await petitionService.updateStatus(selectedPetition._id, values);
      if (res.success) {
        message.success('Đã cập nhật trạng thái đơn');
        setIsViewModalOpen(false);
        processForm.resetFields();
        fetchPetitions();
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật đơn');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'Approved': return <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
      case 'Rejected': return <Tag color="error" icon={<CloseCircleOutlined />}>Từ chối</Tag>;
      case 'Processing': return <Tag color="processing" icon={<ClockCircleOutlined />}>Đang xử lý</Tag>;
      default: return <Tag color="default" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'Academic': return 'Học thuật';
      case 'Financial': return 'Tài chính';
      case 'Activity': return 'Hoạt động';
      case 'GradeReview': return 'Phúc khảo';
      case 'Absence': return 'Xin nghỉ học';
      default: return 'Khác';
    }
  };

  const columns = [
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    ...(user.role !== 'student' ? [{
      title: 'Sinh viên',
      dataIndex: ['student', 'fullName'],
      key: 'studentName',
      render: (name, record) => (
        <span>{record.student?.fullName} ({record.student?.mssv})</span>
      )
    }] : []),
    {
      title: 'Loại đơn',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{getTypeLabel(type)}</Tag>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title, record) => (
        <div>
          <div>{title}</div>
          {record.classSection && (
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              [{record.classSection.code}] {record.classSection.subject?.name}
            </Text>
          )}
          {record.absenceDate && (
            <Text type="warning" style={{ fontSize: '12px', display: 'block' }}>
              Ngày xin vắng: {dayjs(record.absenceDate).format('DD/MM/YYYY')}
            </Text>
          )}
        </div>
      )
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
        <Space>
          <Tooltip title="Chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedPetition(record);
                setIsViewModalOpen(true);
                processForm.setFieldsValue({ status: record.status, response: record.response });
              }}
            />
          </Tooltip>
          {user.role === 'student' && record.status === 'Pending' && (
            <>
              <Tooltip title="Sửa">
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => {
                    setEditingId(record._id);
                    const formValues = {
                      ...record,
                      classSectionId: record.classSection?._id || record.classSection,
                      absenceDate: record.absenceDate ? dayjs(record.absenceDate) : null
                    };
                    form.setFieldsValue(formValues);
                    setIsModalOpen(true);
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="Xóa đơn từ"
                description="Bạn có chắc chắn muốn xóa đơn này không?"
                onConfirm={() => handleDelete(record._id)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Tooltip title="Xóa">
                  <Button danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Đơn từ Sinh viên</Title>
          <Text type="secondary">Gửi và quản lý các yêu cầu, đề nghị từ sinh viên</Text>
        </div>
        {user.role === 'student' && (
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => {
            setEditingId(null);
            form.resetFields();
            setIsModalOpen(true);
          }}>
            Tạo đơn mới
          </Button>
        )}
      </div>

      <Card variant="outlined" className="glass-panel" style={{ borderRadius: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" description="Đang tải danh sách đơn từ..." />
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={data} 
            rowKey="_id"
            pagination={{ pageSize: 10, placement: 'bottomCenter' }}
          />
        )}
      </Card>

      {/* Modal tạo đơn (Cho Sinh viên) */}
      <Modal
        title={editingId ? "Cập nhật đơn từ" : "Gửi đơn từ mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type" label="Loại đơn" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại đơn">
              <Option value="Absence">Xin nghỉ học</Option>
              <Option value="GradeReview">Phúc khảo điểm</Option>
              <Option value="Academic">Học vụ / Đào tạo</Option>
              <Option value="Financial">Tài chính / Học phí</Option>
              <Option value="Other">Khác</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
               prevValues.type !== currentValues.type || prevValues.classSectionId !== currentValues.classSectionId
            }
          >
            {({ getFieldValue }) => {
              const selectedType = getFieldValue('type');
              const selectedClassSectionId = getFieldValue('classSectionId');

              if (selectedType === 'Absence' || selectedType === 'GradeReview') {
                return (
                  <>
                    <Form.Item 
                      name="classSectionId" 
                      label="Lớp học phần" 
                      rules={[{ required: true, message: 'Vui lòng chọn lớp học phần' }]}
                    >
                      <Select placeholder="Chọn lớp học phần liên quan">
                        {studentClasses.map(cls => (
                          <Option key={cls._id} value={cls._id}>
                            {cls.code} - {cls.subject?.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {selectedType === 'Absence' && selectedClassSectionId && (
                      <Form.Item 
                        name="absenceDate" 
                        label="Ngày xin phép vắng" 
                        rules={[{ required: true, message: 'Vui lòng chọn ngày vắng mặt hợp lệ' }]}
                        help="Chỉ hiển thị các ngày có lịch học của môn này"
                      >
                        <DatePicker 
                          style={{ width: '100%' }} 
                          format="DD/MM/YYYY" 
                          placeholder="Chọn ngày học"
                          disabledDate={(current) => {
                             if (!current) return false;
                             const cls = studentClasses.find(c => c._id === selectedClassSectionId);
                             if (!cls || !cls.schedule || cls.schedule.length === 0) return false;
                             
                             // Map Backend dayOfWeek (2: Mon, 8: Sun) to Dayjs Day (1: Mon, 0: Sun)
                             const allowedDays = cls.schedule.map(s => s.dayOfWeek === 8 ? 0 : s.dayOfWeek - 1);
                             
                             // Disable any date that doesn't match the allowed days
                             return !allowedDays.includes(current.day());
                          }}
                        />
                      </Form.Item>
                    )}
                  </>
                );
              }
              return null;
            }}
          </Form.Item>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Tóm tắt yêu cầu" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung chi tiết" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
            <TextArea rows={5} placeholder="Trình bày chi tiết lý do..." />
          </Form.Item>
          <Form.Item name="attachmentUrl" label="Minh chứng đính kèm (URL)">
            <Input placeholder="Dán đường dẫn tới hình ảnh/tài liệu minh chứng (Google Drive, v.v...)" />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>{editingId ? "Cập nhật" : "Gửi đơn"}</Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal xem chi tiết và xử lý (Cả 2 role) */}
      <Modal
        title="Chi tiết đơn từ"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedPetition && (
          <div style={{ padding: '10px 0' }}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Mã sinh viên">{selectedPetition.student?.mssv || user.mssv || '---'}</Descriptions.Item>
              <Descriptions.Item label="Loại đơn">{getTypeLabel(selectedPetition.type)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getStatusTag(selectedPetition.status)}</Descriptions.Item>
              {selectedPetition.classSection && (
                <Descriptions.Item label="Lớp học phần">
                  <Tag color="cyan">{selectedPetition.classSection.code}</Tag>
                  {selectedPetition.classSection.subject?.name}
                </Descriptions.Item>
              )}
              {selectedPetition.absenceDate && (
                <Descriptions.Item label="Ngày vắng mặt">
                  <Text type="danger" strong>{dayjs(selectedPetition.absenceDate).format('DD/MM/YYYY')}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tiêu đề">{selectedPetition.title}</Descriptions.Item>
              <Descriptions.Item label="Nội dung">
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{selectedPetition.content}</Paragraph>
              </Descriptions.Item>
              {selectedPetition.attachmentUrl && (
                <Descriptions.Item label="Minh chứng">
                  <a href={selectedPetition.attachmentUrl} target="_blank" rel="noopener noreferrer">
                    <FileProtectOutlined /> Xem minh chứng đính kèm
                  </a>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Phản hồi từ Nhà trường">
                {selectedPetition.response ? (
                  <Text strong color="blue">{selectedPetition.response}</Text>
                ) : (
                  <Text type="secondary">Chưa có phản hồi</Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            {user.role !== 'student' && (
              <div style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
                <Title level={5}>Xử lý đơn từ</Title>
                <Form form={processForm} layout="vertical" onFinish={handleProcess}>
                  <Form.Item name="status" label="Cập nhật trạng thái" rules={[{ required: true }]}>
                    <Select>
                      <Option value="Processing">Đang xử lý</Option>
                      <Option value="Approved">Duyệt đơn</Option>
                      <Option value="Rejected">Từ chối</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="response" label="Nội dung phản hồi" rules={[{ required: true }]}>
                    <TextArea rows={3} placeholder="Nhập ý kiến xử lý..." />
                  </Form.Item>
                  <div style={{ textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit" loading={submitting}>Cập nhật đơn</Button>
                  </div>
                </Form>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PetitionPage;
