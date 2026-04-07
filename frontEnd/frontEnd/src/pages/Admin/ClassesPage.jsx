import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, Table, Space, Tag, Typography, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, PartitionOutlined, TeamOutlined, ClusterOutlined } from '@ant-design/icons';
import { systemService } from '../../services/systemService';
import { useTranslation } from '../../hooks/useTranslation';

const { Title, Text } = Typography;
const { Option } = Select;

const ClassesPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('classes');
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    
    // Data states
    const [colleges, setColleges] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [majors, setMajors] = useState([]);
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState('class'); // class, major, faculty, college
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    const loadData = async () => {
        setLoading(true);
        try {
            const [collegeRes, facultyRes, majorRes, classRes, configRes] = await Promise.all([
                systemService.getColleges(),
                systemService.getFaculties(),
                systemService.getMajors(),
                systemService.getClasses(),
                systemService.getConfig()
            ]);

            if (collegeRes.success) setColleges(collegeRes.data);
            if (facultyRes.success) setFaculties(facultyRes.data);
            if (majorRes.success) setMajors(majorRes.data);
            if (classRes.success) setClasses(classRes.data);
            if (configRes.success) setBatches(configRes.data.BATCHES || []);
        } catch (error) {
            message.error('Failed to load system data');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setSearchText('');
    }, [activeTab]);

    const getFilteredData = (data, searchKeys = ['name', 'code']) => {
        if (!searchText) return data;
        const lowerSearch = searchText.toLowerCase();
        return data.filter(item => 
            searchKeys.some(key => {
                const val = item[key];
                if (!val) return false;
                return val.toString().toLowerCase().includes(lowerSearch);
            })
        );
    };

    const showModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalVisible(true);
        if (item) {
            form.setFieldsValue({
                ...item,
                collegeId: item.college?._id || item.college,
                facultyId: item.faculty?._id || item.faculty,
                majorId: item.major?._id || item.major
            });
        } else {
            form.resetFields();
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingItem(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        let res;
        try {
            if (modalType === 'college') {
                res = editingItem 
                    ? await systemService.updateCollege(editingItem._id, values)
                    : await systemService.createCollege(values);
            } else if (modalType === 'faculty') {
                res = editingItem 
                    ? await systemService.updateFaculty(editingItem._id, values)
                    : await systemService.createFaculty(values);
            } else if (modalType === 'major') {
                res = editingItem
                    ? await systemService.updateMajor(editingItem._id, values)
                    : await systemService.createMajor(values);
            } else if (modalType === 'class') {
                res = editingItem
                    ? await systemService.updateClass(editingItem._id, values)
                    : await systemService.createClass(values);
            }

            if (res?.success) {
                message.success(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} saved successfully`);
                handleCancel();
                loadData();
            } else {
                message.error(res?.message || 'An error occurred');
            }
        } catch (error) {
            message.error('An error occurred');
        }
        setLoading(false);
    };

    const handleDelete = async (type, id) => {
        let res;
        if (type === 'college') res = await systemService.deleteCollege(id);
        else if (type === 'faculty') res = await systemService.deleteFaculty(id);
        else if (type === 'major') res = await systemService.deleteMajor(id);
        else if (type === 'class') res = await systemService.deleteClass(id);

        if (res?.success) {
            message.success('Item deleted');
            loadData();
        } else {
            message.error(res?.message || 'Delete error');
        }
    };

    const collegeColumns = [
        { 
            title: t('classes.col.code'), dataIndex: 'code', key: 'code', width: 120,
            sorter: (a, b) => a.code.localeCompare(b.code)
        },
        { 
            title: t('classes.col.name'), dataIndex: 'name', key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        { title: t('students.address'), dataIndex: 'description', key: 'description', ellipsis: true },
        { 
            title: t('common.status'), dataIndex: 'status', key: 'status', width: 100,
            render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{t(`common.${status.toLowerCase()}`) || status}</Tag>
        },
        {
            title: t('common.actions'), key: 'actions', width: 120,
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal('college', record)} />
                    <Popconfirm title={t('subjects.deleteConfirm').replace('{{name}}', record.name).replace('{{code}}', record.code)} onConfirm={() => handleDelete('college', record._id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const facultyColumns = [
        { 
            title: t('classes.col.code'), dataIndex: 'code', key: 'code', width: 120,
            sorter: (a, b) => a.code.localeCompare(b.code)
        },
        { 
            title: t('classes.col.name'), dataIndex: 'name', key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        { 
            title: 'Type', dataIndex: 'type', key: 'type', width: 120,
            filters: [
                { text: 'Khoa', value: 'Khoa' },
                { text: 'Viện', value: 'Viện' }
            ],
            onFilter: (value, record) => record.type === value
        },
        { 
            title: 'College', dataIndex: 'college', key: 'college',
            filters: colleges.map(c => ({ text: c.name, value: c._id })),
            onFilter: (value, record) => {
                const colId = typeof record.college === 'object' ? record.college?._id : record.college;
                return colId === value;
            },
            render: (college) => typeof college === 'object' ? college?.name : college
        },
        { 
            title: t('common.status'), dataIndex: 'status', key: 'status', width: 100,
            render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{t(`common.${status.toLowerCase()}`) || status}</Tag>
        },
        {
            title: t('common.actions'), key: 'actions', width: 120,
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal('faculty', record)} />
                    <Popconfirm title={t('subjects.deleteConfirm').replace('{{name}}', record.name).replace('{{code}}', record.code)} onConfirm={() => handleDelete('faculty', record._id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const majorColumns = [
        { 
            title: t('classes.col.code'), dataIndex: 'code', key: 'code', width: 120,
            sorter: (a, b) => a.code.localeCompare(b.code)
        },
        { 
            title: t('classes.col.name'), dataIndex: 'name', key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        { 
            title: 'Faculty', dataIndex: 'faculty', key: 'faculty',
            filters: faculties.map(f => ({ text: f.name, value: f._id })),
            onFilter: (value, record) => {
                const facId = typeof record.faculty === 'object' ? record.faculty?._id : record.faculty;
                return facId === value;
            },
            render: (fac) => typeof fac === 'object' ? fac?.name : fac
        },
        { 
            title: t('common.status'), dataIndex: 'status', key: 'status', width: 100,
            render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{t(`common.${status.toLowerCase()}`) || status}</Tag>
        },
        {
            title: t('common.actions'), key: 'actions', width: 120,
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal('major', record)} />
                    <Popconfirm title={t('subjects.deleteConfirm').replace('{{name}}', record.name).replace('{{code}}', record.code)} onConfirm={() => handleDelete('major', record._id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const classColumns = [
        { 
            title: t('classes.col.code'), dataIndex: 'code', key: 'code', width: 120,
            sorter: (a, b) => a.code.localeCompare(b.code)
        },
        { 
            title: t('classes.col.name'), dataIndex: 'name', key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        { 
            title: t('classes.col.major'), dataIndex: 'major', key: 'major',
            filters: majors.map(m => ({ text: m.name, value: m._id })),
            onFilter: (value, record) => {
                const majorId = typeof record.major === 'object' ? record.major?._id : record.major;
                return majorId === value;
            },
            render: (m) => typeof m === 'object' ? m?.name : m
        },
        { 
            title: t('classes.col.batch'), dataIndex: 'batch', key: 'batch', width: 100,
            filters: batches.map(b => ({ text: b, value: b })),
            onFilter: (value, record) => record.batch === value
        },
        { 
            title: t('common.status'), dataIndex: 'status', key: 'status', width: 100,
            render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{t(`common.${status.toLowerCase()}`) || status}</Tag>
        },
        {
            title: t('common.actions'), key: 'actions', width: 120,
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => showModal('class', record)} />
                    <Popconfirm title={t('subjects.deleteConfirm').replace('{{name}}', record.name).replace('{{code}}', record.code)} onConfirm={() => handleDelete('class', record._id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const SearchBar = () => (
        <Input.Search 
            placeholder="Tìm kiếm theo mã hoặc tên..." 
            allowClear 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)} 
            style={{ width: 300 }} 
        />
    );

    const items = [
        {
            key: 'classes',
            label: <span><TeamOutlined /> Cấp Lớp Học</span>,
            children: (
                <Card variant="borderless" className="glass-panel" title={<SearchBar />} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('class')}>{t('classes.add')}</Button>}>
                    <Table columns={classColumns} dataSource={getFilteredData(classes)} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
                </Card>
            )
        },
        {
            key: 'majors',
            label: <span><ClusterOutlined /> Cấp Ngành Học</span>,
            children: (
                <Card variant="borderless" className="glass-panel" title={<SearchBar />} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('major')}>Thêm Ngành</Button>}>
                    <Table columns={majorColumns} dataSource={getFilteredData(majors)} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
                </Card>
            )
        },
        {
            key: 'faculties',
            label: <span><PartitionOutlined /> Cấp Khoa</span>,
            children: (
                <Card variant="borderless" className="glass-panel" title={<SearchBar />} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('faculty')}>Thêm Khoa</Button>}>
                    <Table columns={facultyColumns} dataSource={getFilteredData(faculties)} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
                </Card>
            )
        },
        {
            key: 'colleges',
            label: <span><BankOutlined /> Cấp Trường</span>,
            children: (
                <Card variant="borderless" className="glass-panel" title={<SearchBar />} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('college')}>Thêm Trường</Button>}>
                    <Table columns={collegeColumns} dataSource={getFilteredData(colleges)} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
                </Card>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>{t('classes.title')}</Title>
                <Text type="secondary">{t('classes.subtitle')}</Text>
            </div>

            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab} 
                items={items} 
                type="card"
                className="premium-tabs"
            />

            <Modal
                title={`${editingItem ? 'Edit' : 'Add'} ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                        <Input placeholder="E.g. CS101, IT, etc." />
                    </Form.Item>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input placeholder="Full Name" />
                    </Form.Item>

                    {modalType === 'college' && (
                        <Form.Item name="description" label="Description">
                            <Input.TextArea placeholder="College details" rows={4} />
                        </Form.Item>
                    )}

                    {modalType === 'faculty' && (
                        <>
                            <Form.Item name="type" label="Type" initialValue="Khoa" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="Khoa">Khoa</Option>
                                    <Option value="Viện">Viện</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="college" label="College" rules={[{ required: true }]}>
                                <Select placeholder="Select College">
                                    {colleges.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </>
                    )}

                    {modalType === 'major' && (
                        <Form.Item name="faculty" label="Faculty" rules={[{ required: true }]}>
                            <Select placeholder="Select Faculty">
                                {faculties.map(f => <Option key={f._id} value={f._id}>{f.name}</Option>)}
                            </Select>
                        </Form.Item>
                    )}

                    {modalType === 'class' && (
                        <>
                            <Form.Item name="major" label="Major" rules={[{ required: true }]}>
                                <Select placeholder="Select Major">
                                    {majors.map(m => <Option key={m._id} value={m._id}>{m.name}</Option>)}
                                </Select>
                            </Form.Item>
                            <Form.Item name="batch" label="Batch" rules={[{ required: true }]}>
                                <Select placeholder="Select Batch">
                                    {batches.map(b => <Option key={b} value={b}>{b}</Option>)}
                                </Select>
                            </Form.Item>
                        </>
                    )}

                    <Form.Item name="status" label="Status" initialValue="Active">
                        <Select>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ClassesPage;
