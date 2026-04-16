import React, { useEffect } from 'react';
import { Form, Input, Select, InputNumber, Row, Col } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormModal from '../../../components/common/FormModal/FormModal';
import { ErrorMessage } from '../../../components/common/ErrorMessage/ErrorMessage';
import { useTranslation } from '../../../hooks/useTranslation';
import { systemService } from '../../../services/systemService';

const { Option } = Select;

const createSchema = (t) => yup.object().shape({
    code: yup.string().required(t('subjects.codeRequired')).matches(/^[A-Z0-9]+$/, t('subjects.codeFormat')),
    name: yup.string().required(t('subjects.nameRequired')),
    credits: yup.number().typeError(t('subjects.creditsType')).min(1, t('subjects.creditsMin')).max(10, t('subjects.creditsMax')).required(t('subjects.creditsRequired')),
    status: yup.string().required(t('students.statusRequired')),
    faculty: yup.string().required('Vui lòng chọn Khoa quản lý'),
});

const AddSubjectModal = ({ open, onCancel, onSubmit, loading, faculties = [] }) => {
    const { t } = useTranslation();
    const [classes, setClasses] = React.useState([]);
    const [fetchingClasses, setFetchingClasses] = React.useState(false);

    const schema = createSchema(t);
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            code: '', name: '', credits: 3, status: 'Active', faculty: undefined
        }
    });

    useEffect(() => {
        if (open) {
            reset();
        }
    }, [open, reset]);

    const onFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <FormModal
            title={t('subjects.addTitle')}
            open={open}
            onCancel={onCancel}
            onSubmit={handleSubmit(onFormSubmit)}
            loading={loading}
            width={600}
        >
            <Form layout="vertical">
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item label={t('subjects.code')} required validateStatus={errors.code ? 'error' : ''} help={<ErrorMessage error={errors.code?.message} />}>
                            <Controller name="code" control={control} render={({ field }) => <Input {...field} placeholder="e.g. IT101" style={{ textTransform: 'uppercase' }} />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label={t('subjects.name')} required validateStatus={errors.name ? 'error' : ''} help={<ErrorMessage error={errors.name?.message} />}>
                            <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder={t('subjects.namePlaceholder')} />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label={t('subjects.credits')} required validateStatus={errors.credits ? 'error' : ''} help={<ErrorMessage error={errors.credits?.message} />}>
                            <Controller name="credits" control={control} render={({ field }) => <InputNumber {...field} min={1} max={10} style={{ width: '100%' }} />} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item label="Khoa quản lý" required validateStatus={errors.faculty ? 'error' : ''} help={<ErrorMessage error={errors.faculty?.message} />}>
                            <Controller name="faculty" control={control} render={({ field }) => (
                                <Select {...field} showSearch optionFilterProp="children" placeholder="Chọn Khoa">
                                    {faculties.map(f => <Option key={f._id} value={f._id}>{f.name}</Option>)}
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item label={t('common.status')} required validateStatus={errors.status ? 'error' : ''} help={<ErrorMessage error={errors.status?.message} />}>
                            <Controller name="status" control={control} render={({ field }) => (
                                <Select {...field}>
                                    <Option value="Active">{t('teachers.status.active') || 'Active'}</Option>
                                    <Option value="Inactive">{t('teachers.status.inactive') || 'Inactive'}</Option>
                                </Select>
                            )} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </FormModal>
    );
};

export default AddSubjectModal;
