import React from 'react';
import { Table, Empty } from 'antd';

/**
 * Reusable DataTable component
 * @param {Array} columns - Ant Design table columns definition
 * @param {Array} data - Data to render
 * @param {boolean} loading - Loading state
 * @param {Object} pagination - Pagination configuration OR false
 * @param {function} onChange - Handle sorting/pagination changes
 * @param {string} rowKey - Unique key for each row (default 'id')
 * @param {string|ReactNode} emptyText - Custom empty text or node
 */
const DataTable = ({
    columns,
    data,
    loading = false,
    pagination = { defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] },
    onChange,
    rowKey = 'id',
    emptyText = 'No data available',
    ...rest
}) => {
    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={pagination ? { ...pagination, position: ['bottomRight'] } : false}
            onChange={onChange}
            rowKey={rowKey}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <Empty description={emptyText} /> }}
            {...rest}
        />
    );
};

export default React.memo(DataTable);
