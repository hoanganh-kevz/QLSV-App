import React, { useEffect } from 'react';
import { Form, Input, Select, Row, Col } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormModal from '../../../components/common/FormModal/FormModal';
import { ErrorMessage } from '../../../components/common/ErrorMessage/ErrorMessage';
import { useTranslation } from '../../../hooks/useTranslation';
import { systemService } from '../../../services/systemService';
import { message } from 'antd';

const { Option } = Select;

const schema = yup.object().shape({
    teacherId: yup.string().required('teachers.idRequired'),
    fullName: yup.string().required('teachers.nameRequired'),
    email: yup.string().email('teachers.emailInvalid').required('teachers.emailRequired'),
    phone: yup.string().required('teachers.phoneRequired').matches(/^[0-9]{10}$/, 'teachers.phoneFormat'),
    college: yup.string().required('teachers.deptRequired'),
    faculty: yup.string().required('Khoa trực thuộc là bắt buộc'),
    specialization: yup.string(),
    gender: yup.string().required('teachers.genderRequired'),
    status: yup.string().required('teachers.statusRequired'),
});

const EditTeacherModal = ({ open, onCancel, onSubmit, loading, initialData }) => {
    const { t } = useTranslation();
    const [colleges, setColleges] = React.useState([]);
    const [faculties, setFaculties] = React.useState([]);
    const [fetchingDepts, setFetchingDepts] = React.useState(false);
    const [fetchingFaculties, setFetchingFaculties] = React.useState(false);

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            teacherId: '', fullName: '', email: '', phone: '',
            college: undefined, faculty: undefined, specialization: '', gender: 'Other', status: 'Active'
        }
    });

    const selectedCollege = watch('college');
    const selectedFaculty = watch('faculty');

    useEffect(() => {
        const fetchColleges = async () => {
            setFetchingDepts(true);
            const res = await systemService.getColleges();
            if (res.success) setColleges(res.data);
            setFetchingDepts(false);
        };
        if (open) {
            fetchColleges();
            if (initialData) {
                reset({
                    ...initialData,
                    college: initialData.college?._id || initialData.college,
                    faculty: initialData.faculty?._id || initialData.faculty
                });
            }
        }
    }, [open, initialData, reset]);

    useEffect(() => {
        const fetchFaculties = async () => {
            if (!selectedCollege) {
                setFaculties([]);
                return;
            }
            setFetchingFaculties(true);
            const res = await systemService.getFaculties({ collegeId: selectedCollege });
            if (res.success) setFaculties(res.data);
            setFetchingFaculties(false);
        };
        fetchFaculties();
    }, [selectedCollege]);

    const onFormSubmit = (data) => onSubmit({ ...initialData, ...data });

    return (
        <FormModal title={`${t('common.edit')} ${t('nav.teachers')}: ${initialData?.fullName || ''}`} open={open} onCancel={onCancel} onSubmit={handleSubmit(onFormSubmit)} loading={loading} width={780}>
            <Form layout="vertical" className="professional-form">
                <Row gutter={24}>
                    {/* Section 1: Thông tin cơ bản */}
                    <Col span={24}>
                        <h3 style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12, marginBottom: 16 }}>Thông tin cơ bản</h3>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label={t('teachers.teacherId')} required validateStatus={errors.teacherId ? 'error' : ''} help={<ErrorMessage error={t(errors.teacherId?.message)} />}>
                            <Controller name="teacherId" control={control} render={({ field }) => <Input {...field} disabled />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item label={t('teachers.fullName')} required validateStatus={errors.fullName ? 'error' : ''} help={<ErrorMessage error={t(errors.fullName?.message)} />}>
                            <Controller name="fullName" control={control} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item label={t('teachers.email')} required validateStatus={errors.email ? 'error' : ''} help={<ErrorMessage error={t(errors.email?.message)} />}>
                            <Controller name="email" control={control} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label={t('teachers.phone')} required validateStatus={errors.phone ? 'error' : ''} help={<ErrorMessage error={t(errors.phone?.message)} />}>
                            <Controller name="phone" control={control} render={({ field }) => <Input {...field} />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item label={t('teachers.gender')} required validateStatus={errors.gender ? 'error' : ''} help={<ErrorMessage error={t(errors.gender?.message)} />}>
                            <Controller name="gender" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <Option value="Male">{t('teachers.gender.male')}</Option>
                                    <Option value="Female">{t('teachers.gender.female')}</Option>
                                    <Option value="Other">{t('teachers.gender.other')}</Option>
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>

                    {/* Section 2: Công tác & Chuyên môn */}
                    <Col span={24} style={{ marginTop: 12 }}>
                        <h3 style={{ borderLeft: '4px solid #52c41a', paddingLeft: 12, marginBottom: 16 }}>Công tác & Chuyên môn</h3>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item label="Trường thành viên" required validateStatus={errors.college ? 'error' : ''} help={<ErrorMessage error={t(errors.college?.message)} />}>
                            <Controller name="college" control={control} render={({ field }) => (
                                <Select {...field} placeholder="Chọn Trường" loading={fetchingDepts} onChange={(val) => { field.onChange(val); setValue('faculty', undefined); }}>
                                    {colleges.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item label="Khoa trực thuộc" required validateStatus={errors.faculty ? 'error' : ''} help={<ErrorMessage error={t(errors.faculty?.message)} />}>
                            <Controller name="faculty" control={control} render={({ field }) => (
                                <Select {...field} placeholder="Chọn Khoa" loading={fetchingFaculties} disabled={!selectedCollege}>
                                    {faculties.map(f => <Option key={f._id} value={f._id}>{f.name}</Option>)}
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item label={t('teachers.specialization')}>
                            <Controller name="specialization" control={control} render={({ field }) => <Input {...field} placeholder="e.g. AI, Web Dev" />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label={t('common.status')} required validateStatus={errors.status ? 'error' : ''} help={<ErrorMessage error={t(errors.status?.message)} />}>
                            <Controller name="status" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <Option value="Active">{t('teachers.status.active')}</Option>
                                    <Option value="Inactive">{t('teachers.status.inactive')}</Option>
                                    <Option value="On Leave">{t('teachers.status.onLeave')}</Option>
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </FormModal>
    );
};

export default EditTeacherModal;
