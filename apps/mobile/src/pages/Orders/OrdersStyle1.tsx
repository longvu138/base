import { Table } from 'antd';
import { TableComponent, Status, Pagination } from '@repo/ui';
import { useTranslation } from '@repo/i18n';

interface OrdersStyleProps {
    data: any;
    isLoading: boolean;
    statuses?: any[];
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export const OrdersStyle1 = ({ data, isLoading, statuses, page, pageSize, setPage, setPageSize }: OrdersStyleProps) => {
    const { t } = useTranslation();
    const columns = [
        {
            title: t('orders.columns.code'),
            dataIndex: 'code',
            width: 120,
            render: (text: string) => <span className="font-medium text-primary">{text}</span>
        },
        {
            title: t('orders.columns.status'),
            dataIndex: 'status',
            width: 120,
            render: (s: string) => <Status status={s} statuses={statuses} />
        },
        {
            title: t('orders.columns.total'),
            dataIndex: 'grandTotal',
            width: 120,
            align: 'right' as const,
            render: (v: number) => <span className="font-semibold">{v?.toLocaleString()}đ</span>
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
                className="pb-20"
                showSizeChanger={false}
            />
        </div>
    );
};
