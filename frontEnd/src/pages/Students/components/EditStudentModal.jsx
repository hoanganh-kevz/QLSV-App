import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Row, Col } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import dayjs from 'dayjs';
import FormModal from '../../../components/common/FormModal/FormModal';
import ImageUpload from '../../../components/common/ImageUpload/ImageUpload';
import { ErrorMessage } from '../../../components/common/ErrorMessage/ErrorMessage';
import { useTranslation } from '../../../hooks/useTranslation';
import { systemService } from '../../../services/systemService';

const { Option } = Select;

const createSchema = (t) => yup.object().shape({
    mssv: yup.string().required(t('students.idRequired')).matches(/^[0-9]+$/, t('students.idNumbers')),
    fullName: yup.string().required(t('students.nameRequired')),
    email: yup.string().email(t('students.emailInvalid')).required(t('students.emailRequired')),
    phone: yup.string().required(t('students.phoneRequired')).matches(/^[0-9]{10}$/, t('students.phoneDigits')),
    department: yup.string().required(t('teachers.deptRequired')),
    faculty: yup.string().required('Khoa trực thuộc là bắt buộc'),
    major: yup.string().required(t('teachers.majorRequired')),
    batch: yup.string().required('Khóa là bắt buộc'),
    class: yup.string().required(t('students.classRequired')),
    dob: yup.date().nullable().typeError(t('students.dobInvalid')),
    gender: yup.string().required(t('students.genderRequired')),
    address: yup.string(),
    status: yup.string().required(t('students.statusRequired')),
});

const EditStudentModal = ({ open, onCancel, onSubmit, loading, initialData }) => {
    const { t } = useTranslation();
    const schema = createSchema(t);
    const [colleges, setColleges] = React.useState([]);
    const [faculties, setFaculties] = React.useState([]);
    const [programs, setPrograms] = React.useState([]);
    const [batches, setBatches] = React.useState([]);
    const [statusOptions, setStatusOptions] = React.useState(['Active', 'Inactive', 'Graduated']);
    const [classes, setClasses] = React.useState([]);
    const [fetchingColleges, setFetchingColleges] = React.useState(false);
    const [fetchingFaculties, setFetchingFaculties] = React.useState(false);
    const [fetchingPrograms, setFetchingPrograms] = React.useState(false);
    const [fetchingClasses, setFetchingClasses] = React.useState(false);
    const [fetchingConfig, setFetchingConfig] = React.useState(false);

    const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            mssv: '', fullName: '', email: '', phone: '',
            department: undefined, faculty: undefined, major: undefined, batch: undefined, class: undefined,
            dob: null, gender: 'Other', address: '',
            status: 'Active', avatarUrl: null
        }
    });

    const selectedCollege = watch('department');
    const selectedFaculty = watch('faculty');
    const selectedMajor = watch('major');
    const selectedBatch = watch('batch');

    useEffect(() => {
        const fetchInitialData = async () => {
            setFetchingColleges(true);
            setFetchingConfig(true);
            const [collegesRes, configRes] = await Promise.all([
                systemService.getColleges(),
                systemService.getConfig()
            ]);

            if (collegesRes.success) setColleges(collegesRes.data);
            if (configRes.success) {
                setBatches(configRes.data.BATCHES || []);
                setStatusOptions(configRes.data.STATUS_OPTIONS || ['Active', 'Inactive', 'Graduated']);
            }

            setFetchingColleges(false);
            setFetchingConfig(false);
        };

        if (open) {
            fetchInitialData();
            if (initialData) {
                const formData = {
                    ...initialData,
                    department: initialData.class?.major?.faculty?.college?._id || initialData.class?.major?.faculty?.college,
                    faculty: initialData.class?.major?.faculty?._id || initialData.class?.major?.faculty,
                    major: initialData.class?.major?._id || initialData.class?.major,
                    batch: initialData.class?.batch,
                    class: initialData.class?._id || initialData.class,
                    dob: initialData.dob ? dayjs(initialData.dob) : null,
                };
                reset(formData);
            }
        }
    }, [open, initialData, reset]);

    useEffect(() => {
        const fetchFaculties = async () => {
            if (!selectedCollege) {
                setFaculties([]);
                setPrograms([]); // Clear programs when college changes
                setClasses([]); // Clear classes when college changes
                return;
            }
            setFetchingFaculties(true);
            const res = await systemService.getFaculties({ collegeId: selectedCollege });
            if (res.success) setFaculties(res.data);
            setFetchingFaculties(false);
        };
        fetchFaculties();
    }, [selectedCollege]);

    useEffect(() => {
        const fetchPrograms = async () => {
            if (!selectedFaculty) {
                setPrograms([]);
                setClasses([]); // Clear classes when faculty changes
                return;
            }
            setFetchingPrograms(true);
            const res = await systemService.getMajors({ facultyId: selectedFaculty });
            if (res.success) setPrograms(res.data);
            setFetchingPrograms(false);
        };
        fetchPrograms();
    }, [selectedFaculty]);

    useEffect(() => {
        const fetchClasses = async () => {
            if (!selectedMajor) {
                setClasses([]);
                return;
            }
            setFetchingClasses(true);
            const res = await systemService.getClasses({ majorId: selectedMajor });
            if (res.success) {
                const filteredClasses = selectedBatch ? res.data.filter(c => c.batch === selectedBatch) : res.data;
                setClasses(filteredClasses);
            }
            setFetchingClasses(false);
        };
        fetchClasses();
    }, [selectedMajor, selectedBatch]);

    const onFormSubmit = (data) => {
        onSubmit({ ...initialData, ...data });
    };

    return (
        <FormModal
            title={`${t('common.edit')}: ${initialData?.fullName || ''}`}
            open={open}
            onCancel={onCancel}
            onSubmit={handleSubmit(onFormSubmit)}
            loading={loading}
            width={780}
        >
            <div style={{ maxHeight: '65vh', overflowY: 'auto', overflowX: 'hidden', paddingRight: 4 }}>
                <Form layout="vertical" className="professional-form">
                    <Row gutter={24}>
                        {/* Avatar Section */}
                        <Col span={24} style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Controller
                                name="avatarUrl"
                                control={control}
                                render={({ field }) => (
                                    <ImageUpload value={field.value} onChange={field.onChange} />
                                )}
                            />
                            <div style={{ marginTop: 8, color: '#8c8c8c' }}>Ảnh đại diện sinh viên</div>
                        </Col>

                        {/* Section 1: Thông tin cá nhân */}
                        <Col span={24}>
                            <h3 style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12, marginBottom: 16 }}>Thông tin cá nhân</h3>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item label={t('students.id')} required validateStatus={errors.mssv ? 'error' : ''} help={<ErrorMessage error={errors.mssv?.message} />}>
                                <Controller name="mssv" control={control} render={({ field }) => <Input {...field} disabled />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label={t('students.fullName')} required validateStatus={errors.fullName ? 'error' : ''} help={<ErrorMessage error={errors.fullName?.message} />}>
                                <Controller name="fullName" control={control} render={({ field }) => <Input {...field} />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label={t('students.email')} required validateStatus={errors.email ? 'error' : ''} help={<ErrorMessage error={errors.email?.message} />}>
                                <Controller name="email" control={control} render={({ field }) => <Input {...field} />} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item label={t('students.phone')} required validateStatus={errors.phone ? 'error' : ''} help={<ErrorMessage error={errors.phone?.message} />}>
                                <Controller name="phone" control={control} render={({ field }) => <Input {...field} />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label={t('students.dob')} validateStatus={errors.dob ? 'error' : ''} help={<ErrorMessage error={errors.dob?.message} />}>
                                <Controller name="dob" control={control} render={({ field }) => <DatePicker {...field} format="YYYY-MM-DD" style={{ width: '100%' }} />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label={t('students.gender')} required validateStatus={errors.gender ? 'error' : ''} help={<ErrorMessage error={errors.gender?.message} />}>
                                <Controller name="gender" control={control} render={({ field }) => (
                                    <Select {...field} placeholder={t('students.gender')}>
                                        <Option value="Male">{t('students.gender.male')}</Option>
                                        <Option value="Female">{t('students.gender.female')}</Option>
                                        <Option value="Other">{t('students.gender.other')}</Option>
                                    </Select>
                                )} />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label={t('students.address')} validateStatus={errors.address ? 'error' : ''} help={<ErrorMessage error={errors.address?.message} />}>
                                <Controller name="address" control={control} render={({ field }) => <Input {...field} placeholder={t('students.addressPlaceholder')} />} />
                            </Form.Item>
                        </Col>

                        {/* Section 2: Thông tin học tập */}
                        <Col span={24} style={{ marginTop: 12 }}>
                            <h3 style={{ borderLeft: '4px solid #52c41a', paddingLeft: 12, marginBottom: 16 }}>Thông tin học tập</h3>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Trường thành viên" required validateStatus={errors.department ? 'error' : ''} help={<ErrorMessage error={errors.department?.message} />}>
                                <Controller name="department" control={control} render={({ field }) => (
                                    <Select {...field} placeholder="Chọn Trường" loading={fetchingColleges} onChange={(val) => { field.onChange(val); setValue('faculty', undefined); setValue('major', undefined); setValue('class', undefined); }}>
                                        {colleges.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                                    </Select>
                                )} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Khoa trực thuộc" required validateStatus={errors.faculty ? 'error' : ''} help={<ErrorMessage error={errors.faculty?.message} />}>
                                <Controller name="faculty" control={control} render={({ field }) => (
                                    <Select {...field} placeholder="Chọn Khoa" loading={fetchingFaculties} disabled={!selectedCollege} onChange={(val) => { field.onChange(val); setValue('major', undefined); setValue('class', undefined); }}>
                                        {faculties.map(f => <Option key={f._id} value={f._id}>{f.name}</Option>)}
                                    </Select>
                                )} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Ngành học" required validateStatus={errors.major ? 'error' : ''} help={<ErrorMessage error={errors.major?.message} />}>
                                <Controller name="major" control={control} render={({ field }) => (
                                    <Select {...field} placeholder="Chọn Ngành" loading={fetchingPrograms} disabled={!selectedFaculty} onChange={(val) => { field.onChange(val); setValue('class', undefined); }}>
                                        {programs.map(p => <Option key={p._id} value={p._id}>{p.name}</Option>)}
                                    </Select>
                                )} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item label="Khóa" required validateStatus={errors.batch ? 'error' : ''} help={<ErrorMessage error={errors.batch?.message} />}>
                                <Controller name="batch" control={control} render={({ field }) => (
                                    <Select {...field} placeholder="Chọn Khóa" onChange={(val) => { field.onChange(val); setValue('class', undefined); }}>
                                        {batches.map(b => <Option key={b} value={b}>{b}</Option>)}
                                    </Select>
                                )} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item label={t('students.class')} required validateStatus={errors.class ? 'error' : ''} help={<ErrorMessage error={errors.class?.message} />}>
                                <Controller name="class" control={control} render={({ field }) => (
                                    <Select {...field} placeholder={t('common.selectClass')} loading={fetchingClasses} disabled={!selectedMajor}>
                                        {classes.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                                    </Select>
                                )} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label={t('common.status')} required validateStatus={errors.status ? 'error' : ''} help={<ErrorMessage error={errors.status?.message} />}>
                                <Controller name="status" control={control} render={({ field }) => (
                                    <Select {...field} loading={fetchingConfig}>
                                        {statusOptions.map(opt => (
                                            <Option key={opt} value={opt}>{t(`students.status.${opt.toLowerCase()}`) || opt}</Option>
                                        ))}
                                    </Select>
                                )} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </FormModal>
    );
};

export default EditStudentModal;
