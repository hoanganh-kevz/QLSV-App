import React, { useState } from 'react';
import { Modal, Button, Upload, Table, Result, Space, Alert, Typography } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;
const { Text } = Typography;

const BulkImportModal = ({ open, onCancel, onImport, templateData, title, fileName }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importResult, setImportResult] = useState(null); // { success: [], failed: [] }

    const resetState = () => {
        setFile(null);
        setPreviewData([]);
        setColumns([]);
        setImportResult(null);
        setLoading(false);
    };

    const handleCancel = () => {
        resetState();
        onCancel();
    };

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([templateData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, `${fileName}_Template.xlsx`);
    };

    const handleFileUpload = (info) => {
        const uploadedFile = info.file;
        setFile(uploadedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                
                if (json.length > 0) {
                    const cols = Object.keys(json[0]).map(key => ({
                        title: key,
                        dataIndex: key,
                        key: key,
                        ellipsis: true,
                    }));
                    setColumns(cols);
                }
                setPreviewData(json.map((item, index) => ({ ...item, key: index })));
            } catch (error) {
                console.error("Error parsing file:", error);
                setPreviewData([]);
            }
        };
        reader.readAsBinaryString(uploadedFile);
        return false; // Prevent auto-upload
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;
        setLoading(true);
        // Call the parent's import API
        // Removing 'key' property that was added for table rendering
        const payload = previewData.map(item => {
            const { key, ...rest } = item;
            return rest;
        });

        const result = await onImport(payload);
        if (result.success) {
            setImportResult({
                success: result.data.success || [],
                failed: result.data.failed || [],
                message: result.data.message || 'Import completed.'
            });
        } else {
            setImportResult({
                success: [],
                failed: payload.map(item => ({ row: item, reason: result.message || 'Server error' })),
                message: result.message || 'Import failed entirely.'
            });
        }
        setLoading(false);
    };

    const renderResult = () => (
        <Result
            status={importResult.failed.length > 0 ? (importResult.success.length > 0 ? 'warning' : 'error') : 'success'}
            title={importResult.message}
            subTitle={`Thành công: ${importResult.success.length} - Thất bại: ${importResult.failed.length}`}
            extra={[
                <Button key="close" type="primary" onClick={handleCancel}>
                    Đóng
                </Button>
            ]}
        >
            {importResult.failed.length > 0 && (
                <div style={{ textAlign: 'left', background: '#fafafa', padding: 16, borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}>
                    <Typography.Title level={5} type="danger">Chi tiết lỗi:</Typography.Title>
                    <ul style={{ paddingLeft: 20 }}>
                        {importResult.failed.map((fail, idx) => (
                            <li key={idx}>
                                <Text strong>Dòng lỗi:</Text> {JSON.stringify(fail.row)} <br />
                                <Text type="danger">Nguyên nhân:</Text> {fail.reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Result>
    );

    return (
        <Modal
            title={title || "Nhập dữ liệu hàng loạt"}
            open={open}
            onCancel={handleCancel}
            width={850}
            footer={importResult ? null : [
                <Button key="cancel" onClick={handleCancel}>Hủy</Button>,
                <Button 
                    key="import" 
                    type="primary" 
                    onClick={handleImport} 
                    loading={loading} 
                    disabled={previewData.length === 0}
                >
                    Tiến hành Import ({previewData.length} dòng)
                </Button>
            ]}
        >
            {importResult ? (
                renderResult()
            ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Alert
                        message="Hướng dẫn"
                        description={
                            <div>
                                Vui lòng tải xuống file mẫu, điền dữ liệu theo đúng định dạng cột, sau đó upload file lên đây.
                                Hệ thống hỗ trợ file .xlsx và .csv.
                                <br />
                                <Button type="link" icon={<DownloadOutlined />} onClick={handleDownloadTemplate} style={{ padding: 0, marginTop: 8 }}>
                                    Tải xuống File mẫu
                                </Button>
                            </div>
                        }
                        type="info"
                        showIcon
                    />

                    <Dragger
                        accept=".xlsx, .xls, .csv"
                        beforeUpload={() => false}
                        onChange={handleFileUpload}
                        showUploadList={false}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Nhấp hoặc kéo thả file vào khu vực này</p>
                        <p className="ant-upload-hint">
                            Hỗ trợ file Excel (.xlsx) hoặc CSV.
                        </p>
                        {file && <p style={{ color: '#1890ff', marginTop: 8 }}>Đã chọn: {file.name}</p>}
                    </Dragger>

                    {previewData.length > 0 && (
                        <div>
                            <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                Xem trước dữ liệu ({previewData.length} dòng):
                            </div>
                            <Table 
                                dataSource={previewData} 
                                columns={columns} 
                                size="small" 
                                scroll={{ x: 'max-content', y: 300 }}
                                pagination={false}
                                bordered
                            />
                        </div>
                    )}
                </Space>
            )}
        </Modal>
    );
};

export default BulkImportModal;
