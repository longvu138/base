import React from 'react';
import { Timeline, Empty, Skeleton } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useOrderMilestonesQuery, useOrderStatusesQuery } from '@repo/hooks';


interface HistoryTabProps {
    orderCode: string;
}

const statusMap: Record<string, string> = {
    'DELIVERING': 'Đang giao',
    'PUTAWAY': 'Hàng về kho',
    'SHIPPED': 'Người bán giao',
    'PURCHASED': 'Đã mua hàng',
    'PROCESSING': 'Đang xử lý',
    'RECEIVED': 'Đã tiếp nhận',
    'DEPOSITED': 'Đã đặt cọc',
    'WAITING_FOR_DELIVERY': 'Chờ vận chuyển',
    'COMPLETED': 'Hoàn thành',
};

export const HistoryTab: React.FC<HistoryTabProps> = ({ orderCode }) => {
    const { data: milestones, isLoading } = useOrderMilestonesQuery(orderCode);
    const { data: statusData } = useOrderStatusesQuery();

    if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;
    if (!milestones || milestones.length === 0) return <Empty description="Không có lịch sử" />;

    // Sort milestones DESC to have latest at top for the red icon
    const sortedMilestones = [...milestones].sort((a: any, b: any) => 
        dayjs(b.timestamp).unix() - dayjs(a.timestamp).unix()
    );

    const getStatusName = (code: string) => {
        const found = statusData?.find((s: any) => s.code === code);
        return found?.name || statusMap[code] || code;
    };

    return (
        <div className="history-tab-container py-8 px-4 max-w-[900px] mx-auto">
            <Timeline mode="alternate">
                {sortedMilestones.map((m: any, index: number) => {
                    const isLatest = index === 0;
                    const statusName = getStatusName(m.status);
                    
                    return (
                        <Timeline.Item 
                            key={m.id}
                            dot={isLatest ? 
                                <ClockCircleOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} /> : 
                                <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-white" />
                            }
                        >
                            <div className={`flex flex-col ${index % 2 === 0 ? 'items-start' : 'items-end'}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${isLatest ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {statusName}:
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {dayjs(m.timestamp).format('HH:mm DD/MM')}
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">
                                        ({m.handlingTime !== null ? `${m.handlingTime} ngày` : 'Chưa xác định'})
                                    </span>
                                </div>
                            </div>
                        </Timeline.Item>
                    );
                })}
            </Timeline>
        </div>
    );
};
