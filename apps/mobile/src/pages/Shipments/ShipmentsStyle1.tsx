import { Table } from 'antd';
import { TableComponent, Status, Pagination } from '@repo/ui';
import { useTranslation } from '@repo/i18n';

interface ShipmentsStyleProps {
    data: any;
    isLoading: boolean;
    statusData?: any[];
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export const ShipmentsStyle1 = ({ 
    data, isLoading, statusData, page, pageSize, setPage, setPageSize 
}: ShipmentsStyleProps) => {
    useTranslation();
    
    const columns = [
        {
            title: 'Mã vận đơn',
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
            title: 'Khối lượng',
            dataIndex: 'weight',
            key: 'weight',
            align: 'right' as const,
            render: (v: number) => <span>{v} kg</span>
        },
    ];

    return (
        <div className="mt-4">
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
                className="pb-20"
                showSizeChanger={false}
            />
        </div>
    );
};
