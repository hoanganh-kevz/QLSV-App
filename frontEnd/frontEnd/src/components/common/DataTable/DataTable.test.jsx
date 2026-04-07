import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable from './DataTable';

// Mock matchMedia for Ant Design
if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

describe('DataTable Component', () => {
    const mockColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Age', dataIndex: 'age', key: 'age' },
    ];

    const mockData = [
        { id: 1, name: 'John Doe', age: 30 },
        { id: 2, name: 'Jane Smith', age: 25 },
    ];

    it('should render table with data', () => {
        render(<DataTable columns={mockColumns} data={mockData} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        // Ant Design wraps cells, sometimes better to check existence in the document
        expect(screen.getByText('30')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should display empty text when no data is provided', () => {
        const emptyText = 'No users found';
        render(<DataTable columns={mockColumns} data={[]} emptyText={emptyText} />);

        // Ant Design Empty component might put text in different places, check for existence
        expect(screen.getByText(emptyText)).toBeInTheDocument();
    });
});
