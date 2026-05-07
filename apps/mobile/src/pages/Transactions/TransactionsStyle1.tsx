import { Table } from 'antd';
import { TableComponent, Pagination } from '@repo/ui';

interface TransactionsStyle1Props {
    data: any;
    isLoading: boolean;
    statusData?: any[];
    typeData?: any[];
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export const TransactionsStyle1: React.FC<TransactionsStyle1Props> = ({
    data, isLoading, typeData,
    page, pageSize, setPage, setPageSize
}) => {

    const columns = [
        {
            title: 'Mã GD',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-bold text-primary">{text}</span>
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (v: number) => <span className={v > 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{v?.toLocaleString()}đ</span>
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (v: string) => <span>{typeData?.find(t => t.code === v)?.name || v}</span>
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
                    scroll={{ x: 400 }}
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
