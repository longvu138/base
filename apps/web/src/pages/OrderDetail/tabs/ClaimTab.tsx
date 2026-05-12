import React from 'react';
import { Table, Tag, Button, Empty, Skeleton, Typography, Space } from 'antd';
import { PlusOutlined, WarningOutlined, CommentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useOrderClaimsQuery, useClaimStatusesQuery } from '@repo/hooks';

const { Text, Title } = Typography;

interface ClaimTabProps {
    orderCode: string;
}

export const ClaimTab: React.FC<ClaimTabProps> = ({ orderCode }) => {
    const { data: claims, isLoading, isError } = useOrderClaimsQuery(orderCode);
    const { data: statuses } = useClaimStatusesQuery();

    if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

    const hasClaims = !isError && claims && claims.length > 0;

    const columns = [
        {
            title: 'Mã khiếu nại',
            dataIndex: 'code',
            key: 'code',
            render: (v: string) => <Text strong className="text-blue-500">#{v}</Text>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (v: string) => dayjs(v).format('HH:mm DD/MM/YYYY'),
        },
        {
            title: 'Nội dung khiếu nại',
            dataIndex: 'content',
            key: 'content',
            render: (v: string, r: any) => (
                <div className="max-w-[300px]">
                    <div className="font-medium text-gray-800 line-clamp-1">{r.subject || 'Khiếu nại đơn hàng'}</div>
                    <div className="text-xs text-gray-400 line-clamp-2">{v}</div>
                </div>
            ),
        },
        {
            title: 'Giải pháp',
            dataIndex: ['solution', 'name'],
            key: 'solution',
            render: (v: string) => v || 'Chưa xác định',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (v: any) => {
                const statusName = typeof v === 'object' ? v.name : (statuses?.find(s => s.code === v)?.name || v);
                const color = typeof v === 'object' ? v.color : (statuses?.find(s => s.code === v)?.color || 'blue');
                return <Tag color={color} className="rounded-full px-3">{statusName}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right' as const,
            render: () => (
                <Space>
                    <Button type="link" size="small" icon={<CommentOutlined />}>Chi tiết</Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="claim-tab-container px-2">
            {hasClaims ? (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button type="primary" icon={<PlusOutlined />}>Tạo khiếu nại</Button>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={claims}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        className="custom-claim-table"
                    />
                </div>
            ) : (
                <div className="py-12 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <WarningOutlined className="text-3xl text-gray-300" />
                    </div>
                    <Title level={5} className="mb-2">Chưa có khiếu nại nào cho đơn hàng này</Title>
                    <Text className="text-gray-400 mb-6">Nếu bạn gặp vấn đề với sản phẩm hoặc kiện hàng, hãy tạo khiếu nại để được hỗ trợ.</Text>
                    <Button type="primary" size="large" icon={<PlusOutlined />} className="px-8 h-11 rounded-lg">
                        Tạo khiếu nại ngay
                    </Button>
                </div>
            )}
        </div>
    );
};
