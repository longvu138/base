import React from 'react';
import { Table, Empty, Skeleton } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useOrderFinancialsQuery } from '@repo/hooks';

dayjs.extend(relativeTime);
dayjs.locale('vi');


interface TransactionTabProps {
    orderCode: string;
}

export const TransactionTab: React.FC<TransactionTabProps> = ({ orderCode }) => {
    const { data: financials, isLoading } = useOrderFinancialsQuery(orderCode);

    if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
    
    const data = Array.isArray(financials) ? financials : (financials ? [financials] : []);
    if (data.length === 0) return <Empty description="Không có giao dịch" />;

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            render: (v: string) => (
                <div className="text-sm text-gray-900">
                    {dayjs(v).format('HH:mm DD/MM/YYYY')}
                </div>
            ),
        },
        {
            title: 'Giá trị',
            dataIndex: 'amount',
            key: 'amount',
            width: 150,
            render: (v: number) => (
                <span className={`text-sm ${v < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {v.toLocaleString('vi-VN')}₫
                </span>
            ),
        },
        {
            title: 'Loại giao dịch',
            dataIndex: ['type', 'name'],
            key: 'type',
            width: 180,
            render: (v: string) => <span className="text-sm text-gray-900">{v || 'Giao dịch'}</span>,
        },
        {
            title: 'Nội dung',
            key: 'content',
            render: (_: any, r: any) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <DatabaseOutlined className="text-[14px]" />
                        <span>Mã: {r.txid}</span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                        {r.memo || '---'}
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="transaction-tab-container px-2">
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={false}
                size="middle"
                className="custom-transaction-table"
                rowClassName="hover:bg-gray-50 transition-colors"
            />
        </div>
    );
};
