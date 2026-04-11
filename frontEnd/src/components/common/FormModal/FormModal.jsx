import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from '../../../hooks/useTranslation';

/**
 * Reusable FormModal wrapper
 */
const FormModal = ({
    open,
    title,
    onCancel,
    onSubmit,
    loading = false,
    children,
    width = 600,
    okText,
    cancelText
}) => {
    const { t } = useTranslation();

    return (
        <Modal
            title={title}
            open={open}
            onCancel={onCancel}
            width={width}
            onOk={onSubmit}
            confirmLoading={loading}
            okText={okText || t('common.save') || "Save"}
            cancelText={cancelText || t('common.cancel') || "Cancel"}
            destroyOnHidden
            mask={{ closable: !loading }}
            keyboard={!loading}
            styles={{ body: { paddingTop: '20px' } }}
        >
            {children}
        </Modal>
    );
};

export default FormModal;
