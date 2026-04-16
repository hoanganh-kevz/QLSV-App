import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

/**
 * SearchBar with debounce
 * @param {string} placeholder - Placeholder text
 * @param {function} onSearch - Callback triggered after debounce
 * @param {number} delay - Debounce delay in ms
 */
const SearchBar = ({ placeholder = "Search...", onSearch, delay = 500, style }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (onSearch) {
                onSearch(searchTerm);
            }
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, delay, onSearch]);

    return (
        <Input
            placeholder={placeholder}
            prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: '100%', maxWidth: '400px', ...style }}
            size="large"
        />
    );
};

export default SearchBar;
