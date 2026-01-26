import React from 'react';

export interface TableComponentProps {
    // Content - render prop for custom table/list
    children: React.ReactNode;

    // Header
    title?: string | React.ReactNode;
    totalCount?: number;

    // Actions
    onExport?: () => void;
    extra?: React.ReactNode; // Custom actions

    // Display options
    hideTotalCount?: boolean;

    // Pagination
    pagination?: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize: number) => void;
        showSizeChanger?: boolean;
        pageSizeOptions?: number[];
    };

    // Loading state
    loading?: boolean;

    // Empty state
    emptyText?: string;
    showEmpty?: boolean;
}
