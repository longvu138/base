import { Table } from 'antd';
import { TableComponent, Pagination } from '@repo/ui';
import { useTranslation } from '@repo/i18n';

interface DeliveryNoteStyleProps {
    listData: any;
    isLoading: boolean;
    page: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export const DeliveryNoteStyle1 = ({ 
    listData, isLoading, page, pageSize, setPage, setPageSize 
}: DeliveryNoteStyleProps) => {
    useTranslation();
    
    const columns = [
        {
            title: 'Mã phiếu',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-medium text-primary">{text}</span>
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            align: 'right' as const,
            render: (v: number) => <span className="font-semibold">{v?.toLocaleString()}đ</span>
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
