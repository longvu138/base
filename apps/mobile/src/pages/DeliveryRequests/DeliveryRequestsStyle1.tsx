import { Table } from 'antd';
import { TableComponent, Status, Pagination } from '@repo/ui';

export const DeliveryRequestsStyle1 = ({ data, isLoading, statusData, page, pageSize, setPage, setPageSize }: any) => {
    const columns = [
        {
            title: 'Mã yêu cầu',
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
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
        }
    ];

    return (
        <div className="space-y-4">
            <TableComponent loading={isLoading} totalCount={data?.total || 0}>
                <Table columns={columns} dataSource={data?.data || []} pagination={false} rowKey="id" size="small" scroll={{ x: 300 }} />
            </TableComponent>
            <Pagination current={page} pageSize={pageSize} total={data?.total || 0} onChange={(p: any, s: any) => { setPage(p); if (s !== pageSize) setPageSize(s); }} showSizeChanger={false} />
        </div>
    );
};
