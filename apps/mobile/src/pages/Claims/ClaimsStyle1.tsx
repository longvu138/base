import { Table } from 'antd';
import { TableComponent, Status, Pagination } from '@repo/ui';
import { useTranslation } from '@repo/i18n';

interface ClaimsStyleProps {
    listData: any;
    isLoading: boolean;
    statusData?: any[];
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export const ClaimsStyle1 = ({ 
    listData, isLoading, statusData, page, pageSize, setPage, setPageSize 
}: ClaimsStyleProps) => {
    useTranslation();
    
    const columns = [
        {
            title: 'Mã khiếu nại',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-medium text-primary">{text}</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => <Status status={s} statuses={statusData} />
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (v: string) => <span className="text-xs text-gray-500">{v}</span>
        },
    ];

    return (
        <div className="mt-4">
            <TableComponent
                loading={isLoading}
                totalCount={listData?.total || 0}
                showEmpty={!listData?.data?.length}
            >
                <Table
                    columns={columns}
                    dataSource={listData?.data || []}
                    pagination={false}
                    rowKey="id"
                    size="small"
                />
            </TableComponent>
            <Pagination
                current={page}
                pageSize={pageSize}
                total={listData?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
                className="pb-20"
                showSizeChanger={false}
            />
        </div>
    );
};
