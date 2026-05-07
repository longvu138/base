import React from 'react';
import { Table } from 'antd';
import { TableComponent, Status, Pagination } from '@repo/ui';
import { useTranslation } from '@repo/i18n';

interface PackagesStyle1Props {
    data: any;
    isLoading: boolean;
    statusData?: any[];
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export const PackagesStyle1: React.FC<PackagesStyle1Props> = ({
    data, isLoading, statusData,
    page, pageSize, setPage, setPageSize
}) => {
    useTranslation();

    const columns = [
        {
            title: 'Mã kiện',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-bold text-primary">{text}</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => <Status status={s} statuses={statusData} />
        },
        {
            title: 'Cân nặng',
            dataIndex: 'weight',
            key: 'weight',
            render: (v: number) => <span>{v || 0} kg</span>
        }
    ];

    return (
        <div className="space-y-4">
            <TableComponent
                loading={isLoading}
                totalCount={data?.total || 0}
                showEmpty={!data?.data?.length}
            >
                <Table
                    columns={columns}
                    dataSource={data?.data || []}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    scroll={{ x: 300 }}
                />
            </TableComponent>

            <Pagination
                current={page}
                pageSize={pageSize}
                total={data?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
                className="pb-10"
                showSizeChanger={false}
            />
        </div>
    );
};
