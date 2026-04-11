import React, { useState, useEffect, useMemo } from 'react';
import { Card, Select, Typography, Space, Tag, Modal, Button, Avatar, Tooltip, Row, Col, Statistic, Divider } from 'antd';
import { UserOutlined, StopOutlined, CheckCircleOutlined, DeleteOutlined, TeamOutlined, UserAddOutlined, SolutionOutlined, SafetyOutlined } from '@ant-design/icons';
import DataTable from '../../components/common/DataTable/DataTable';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import { showConfirmDialog } from '../../components/common/ConfirmDialog/ConfirmDialog';
import { showSuccess } from '../../components/common/SuccessMessage/SuccessMessage';
import { showError } from '../../components/common/ErrorMessage/ErrorMessage';
import { userService } from '../../services/userService';
import { systemService } from '../../services/systemService';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const { Title, Text } = Typography;
const { Option } = Select;


const UsersPage = () => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [systemClasses, setSystemClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Assignment Modal State
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const [userRes, classRes] = await Promise.all([
            userService.getAllUsers(),
            systemService.getClasses()
        ]);
        
        if (userRes.success) {
            setUsers(userRes.data);
            setFilteredUsers(userRes.data);
        } else {
            showError(userRes.message);
        }

        if (classRes.success) {
            setSystemClasses(classRes.data);
        }

        setLoading(false);
    };

    useEffect(() => {
        let result = users;
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.name?.toLowerCase().includes(lowerSearch) ||
                u.email?.toLowerCase().includes(lowerSearch) ||
                u.username?.toLowerCase().includes(lowerSearch)
            );
        }
        if (roleFilter !== 'All') {
            result = result.filter(u => u.role === roleFilter);
        }
        setFilteredUsers(result);
    }, [searchTerm, roleFilter, users]);

    const handleRoleChange = async (userId, newRole, record) => {
        // Confirmation for upgrading to admin
        if (newRole === 'admin') {
            showConfirmDialog({
                title: t('users.upgradeAdminTitle') || 'Nâng cấp Quản trị viên',
                content: t('users.upgradeAdminConfirm')?.replace('{{name}}', record.name || record.username) || `Bạn có chắc chắn muốn nâng cấp ${record.name || record.username} thành Quản trị viên? Quyền hạn này rất lớn và có thể ảnh hưởng đến hệ thống.`,
                onConfirm: async () => {
                    await executeRoleChange(userId, newRole);
                }
            });
            return;
        }

        await executeRoleChange(userId, newRole);
    };

    const executeRoleChange = async (userId, newRole) => {
        const previousUsers = [...users];
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        
        const res = await userService.updateUserRole(userId, newRole);
        if (res.success) {
            showSuccess(t('users.updateRoleSuccess').replace('{{role}}', t(`users.role.${newRole}`)));
            loadUsers(); // Refresh to ensure data consistency
        } else {
            showError(res.message);
            setUsers(previousUsers);
        }
    };

    const handleToggleStatus = async (record) => {
        const isSelf = record._id === currentUser?.id || record._id === currentUser?._id;
        if (isSelf) {
            showError(t('users.errorOwnStatus'));
            return;
        }
        const actionWord = record.status === 'Active' ? t('users.deactivateTitle') : t('users.activateTitle');
        const confirmContent = record.status === 'Active' ? t('users.deactivateConfirm') : t('users.activateConfirm');
        showConfirmDialog({
            title: actionWord,
            content: confirmContent.replace('{{name}}', record.name || record.username),
            onConfirm: async () => {
                const previousUsers = [...users];
                const expectedNewStatus = record.status === 'Active' ? 'Inactive' : 'Active';
                setUsers(users.map(u => u._id === record._id ? { ...u, status: expectedNewStatus } : u));
                const res = await userService.toggleUserStatus(record._id, record.status);
                if (res.success) {
                    showSuccess(res.newStatus === 'Active' ? t('users.activateSuccess') : t('users.deactivateSuccess'));
                } else {
                    showError(res.message);
                    setUsers(previousUsers);
                }
            }
        });
    };

    const handleDelete = (record) => {
        const isSelf = record._id === currentUser?.id || record._id === currentUser?._id;
        if (isSelf) {
            showError(t('users.errorOwnDelete'));
            return;
        }
        showConfirmDialog({
            title: t('users.deleteTitle'),
            content: t('users.deleteConfirm').replace('{{name}}', record.name || record.username),
            onConfirm: async () => {
                const res = await userService.deleteUser(record._id);
                if (res.success) {
                    showSuccess(t('users.deleteSuccess'));
                    loadUsers();
                } else {
                    showError(res.message);
                }
            }
        });
    };

    const handleOpenAssignModal = (user) => {
        setSelectedUser(user);
        setAssignedClasses(user.assignedClasses || []);
        setIsAssignModalVisible(true);
    };

    const handleSaveAssignments = async () => {
        if (!selectedUser) return;
        setAssignLoading(true);
        const res = await userService.updateUserAssignments(selectedUser._id, assignedClasses);
        if (res.success) {
            showSuccess(t('users.updateAssignmentsSuccess') || 'Assignments updated successfully');
            setIsAssignModalVisible(false);
            loadUsers();
        } else {
            showError(res.message);
        }
        setAssignLoading(false);
    };

    const stats = useMemo(() => {
        return {
            total: users.length,
            admins: users.filter(u => u.role === 'admin').length,
            teachers: users.filter(u => u.role === 'teacher').length,
            students: users.filter(u => u.role === 'student').length,
        };
    }, [users]);

    const columns = [
        {
            title: t('common.user') || 'User',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <Avatar 
                        src={record.avatar || undefined} 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: record.role === 'admin' ? '#005A51' : '#10b981', border: '2px solid rgba(255,255,255,0.2)' }} 
                        size="large"
                    />
                    <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-color)', fontSize: '15px' }}>{record.name || record.username}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{record.email}</div>
                    </div>
                </Space>
            )
        },
        {
            title: t('common.role'),
            dataIndex: 'role',
            key: 'role',
            width: 160,
            render: (role, record) => (
                <Select
                    value={role}
                    onChange={(value) => handleRoleChange(record._id, value, record)}
                    disabled={(record._id === currentUser?.id || record._id === currentUser?._id) || record.role === 'admin'}
                    className="glass-panel"
                    style={{ width: '100%', borderRadius: '8px' }}
                    variant="borderless"
                >
                    <Option value="admin">{t('users.role.admin')}</Option>
                    <Option value="manager">{t('users.role.manager')}</Option>
                    <Option value="teacher">{t('users.role.teacher')}</Option>
                    <Option value="student">{t('users.role.student')}</Option>
                </Select>
            )
        },
        {
            title: t('common.status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={status === 'Active' ? '#10b981' : '#ef4444'} style={{ borderRadius: '6px', fontWeight: 600, border: 'none', padding: '2px 10px' }}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: t('users.assignments'),
            key: 'assignments',
            render: (_, record) => (
                record.role === 'teacher' ? (
                    <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {(record.assignedClasses || []).map(c => <Tag color="blue" key={c} style={{ borderRadius: '4px' }}>{c}</Tag>)}
                            {(record.assignedClasses || []).length === 0 && <Text type="secondary" style={{ fontSize: '12px' }}>{t('users.none')}</Text>}
                        </div>
                        <Button size="small" type="link" onClick={() => handleOpenAssignModal(record)} style={{ padding: 0 }}>
                            {t('users.editClasses')}
                        </Button>
                    </Space>
                ) : <Text type="secondary">—</Text>
            )
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: 120,
            align: 'right',
            render: (_, record) => {
                const isSelf = record._id === currentUser?.id || record._id === currentUser?._id;
                const isActive = record.status === 'Active';
                return (
                    <Space size="small">
                        <Tooltip title={isActive ? t('users.deactivateTitle') : t('users.activateTitle')}>
                            <Button
                                type="text"
                                icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                                onClick={() => handleToggleStatus(record)}
                                disabled={isSelf}
                                style={{ color: isActive ? '#f59e0b' : '#10b981' }}
                            />
                        </Tooltip>
                        <Tooltip title={t('users.deleteTitle')}>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(record)}
                                disabled={isSelf}
                            />
                        </Tooltip>
                    </Space>
                )
            }
        }
    ];

    return (
        <div className="dashboard-container animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <Title level={2} className="premium-title">{t('nav.usermanagement')}</Title>
                    <Text className="premium-subtitle">{t('users.subtitle')}</Text>
                </div>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={6}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('users.stats.total')} value={stats.total} prefix={<TeamOutlined />} styles={{ content: { color: 'var(--primary-color)', fontWeight: 800 } }} />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('users.stats.admins')} value={stats.admins} prefix={<SafetyOutlined />} styles={{ content: { color: '#005A51', fontWeight: 800 } }} />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('users.stats.teachers')} value={stats.teachers} prefix={<SolutionOutlined />} styles={{ content: { color: '#10b981', fontWeight: 800 } }} />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="glass-panel" variant="borderless">
                        <Statistic title={t('users.stats.students')} value={stats.students} prefix={<UserAddOutlined />} styles={{ content: { color: '#3b82f6', fontWeight: 800 } }} />
                    </Card>
                </Col>
            </Row>

            <Card className="glass-panel" variant="borderless" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={16} lg={12}>
                        <SearchBar placeholder={t('common.searchPlaceholder')} onSearch={setSearchTerm} />
                    </Col>
                    <Col xs={24} md={8} lg={6}>
                        <Select value={roleFilter} onChange={setRoleFilter} style={{ width: '100%' }} size="large" className="glass-panel">
                            <Option value="All">{t('users.allRoles')}</Option>
                            <Option value="admin">{t('users.role.admin')}</Option>
                            <Option value="manager">{t('users.role.manager')}</Option>
                            <Option value="teacher">{t('users.role.teacher')}</Option>
                            <Option value="student">{t('users.role.student')}</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card variant="borderless" className="glass-panel" style={{ padding: '0px' }}>
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ defaultPageSize: 10, showSizeChanger: true }}
                    className="premium-table"
                />
            </Card>

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>{t('users.assignTitle').replace('{{name}}', selectedUser?.name || selectedUser?.username || '')}</Title>}
                open={isAssignModalVisible}
                onOk={handleSaveAssignments}
                onCancel={() => setIsAssignModalVisible(false)}
                confirmLoading={assignLoading}
                destroyOnHidden
                centered
                className="premium-modal"
            >
                <div style={{ marginBottom: 24 }}>
                    <Text type="secondary">{t('users.assignDesc')}</Text>
                </div>
                <Select
                    mode="multiple"
                    placeholder={t('users.selectClasses')}
                    style={{ width: '100%' }}
                    size="large"
                    value={assignedClasses}
                    onChange={setAssignedClasses}
                    className="premium-input"
                >
                    {systemClasses.map(c => <Option key={c._id} value={c.code}>{c.code} - {c.name}</Option>)}
                </Select>
            </Modal>
        </div>
    );
};

export default UsersPage;
