import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import imageCompression from 'browser-image-compression';

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

const beforeUpload = async (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
        return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
        return Upload.LIST_IGNORE;
    }

    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        message.error('Error compressing image');
        return Upload.LIST_IGNORE;
    }
};

/**
 * Reusable Image/Avatar Upload component
 * @param {string} value - Current image URL (if any)
 * @param {function} onChange - Callback with base64 string or file when uploaded
 */
const ImageUpload = ({ value, onChange }) => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(value);

    const handleChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done' || info.file.status === 'error') {
            // In a real app, you might upload this to a server first and get back a URL.
            // Here we just convert it to base64 for preview.
            getBase64(info.file.originFileObj, (url) => {
                setLoading(false);
                setImageUrl(url);
                if (onChange) {
                    onChange(info.file.originFileObj); // or url depending on backend needs
                }
            });
        }
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)} // Mock successful upload
        >
            {imageUrl ? (
                <img src={imageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                uploadButton
            )}
        </Upload>
    );
};

export default ImageUpload;
