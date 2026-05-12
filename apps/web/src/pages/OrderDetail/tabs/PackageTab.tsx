import React from 'react';
import { Table, Tag, Empty, Skeleton } from 'antd';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useOrderPackagesQuery, usePackageMilestonesQuery, usePackageStatusesQuery } from '@repo/hooks';

interface PackageTabProps {
    orderCode: string;
}

const statusColors: Record<string, string> = {
    'DELIVERING': 'orange',
    'RECEIVED': 'blue',
    'COMPLETED': 'green',
    'CANCELLED': 'red',
};

const PackageTimeline = ({ packageCode }: { packageCode: string }) => {
    const { data: milestones, isLoading } = usePackageMilestonesQuery(packageCode);

    if (isLoading) return <div className="p-8"><Skeleton active paragraph={{ rows: 1 }} /></div>;
    if (!milestones) return <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-lg">Không có dữ liệu hành trình</div>;

    const steps = [
        { key: 'WAITING_FOR_DELIVERY', label: 'Chờ vận chuyển' },
        { key: 'PUTAWAY', label: 'Kiện về kho' },
        { key: 'TRANSPORTING', label: 'Vận chuyển' },
        { key: 'READY_TO_DELIVERY', label: 'Sẵn sàng giao' },
        { key: 'DELIVERY_REQUEST', label: 'Yêu cầu giao' },
        { key: 'DELIVERING', label: 'Đang giao' },
        { key: 'DELIVERED', label: 'Đã giao' },
        { key: 'CUSTOMER_RECEIVED', label: 'Khách nhận' },
    ];

    const lastCompletedIndex = steps.reduce((last, step, index) => {
        return milestones.some((m: any) => m.status === step.key) ? index : last;
    }, -1);

    return (
        <div className="py-10 px-6 bg-white border border-blue-50/50 rounded-xl my-2 mx-4 shadow-sm">
            <div className="flex items-start justify-between relative">
                {/* Background Line */}
                <div className="absolute top-[11px] left-[5%] right-[5%] h-[3px] bg-gray-100 z-0 rounded-full" />
                
                {/* Active Progress Line */}
                {lastCompletedIndex !== -1 && (
                    <div 
                        className="absolute top-[11px] left-[5%] h-[3px] bg-blue-500 z-0 transition-all duration-700 rounded-full"
                        style={{ width: `${(lastCompletedIndex / (steps.length - 1)) * 90}%` }}
                    />
                )}
                
                {steps.map((step, index) => {
                    const milestone = milestones.find((m: any) => m.status === step.key);
                    const isCompleted = !!milestone;
                    const isLastCompleted = index === lastCompletedIndex;
                    
                    return (
                        <div key={step.key} className="flex flex-col items-center relative z-10 flex-1 px-1">
                            {/* Dot */}
                            <div className={`
                                w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all duration-300
                                ${isCompleted ? 'bg-blue-500 shadow-lg shadow-blue-200' : 'bg-white border-2 border-gray-200'}
                                ${isLastCompleted ? 'ring-4 ring-blue-100 scale-110' : ''}
                            `}>
                                {isCompleted ? (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                ) : (
                                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                                )}
                            </div>

                            {/* Label & Time */}
                            <div className="mt-4 text-center min-h-[60px]">
                                <div className={`text-[12px] font-bold transition-colors duration-300 ${isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {step.label}
                                </div>
                                {isCompleted ? (
                                    <div className="mt-1.5">
                                        <div className="text-[11px] font-semibold text-gray-800">
                                            {dayjs(milestone.timestamp).format('HH:mm DD/MM')}
                                        </div>
                                        {milestone.handlingTime !== undefined && (
                                            <div className="text-[10px] text-gray-500 mt-0.5 bg-gray-50 px-1.5 py-0.5 rounded-full inline-block border border-gray-100">
                                                {milestone.handlingTime} ngày
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-gray-300 mt-1 italic font-medium uppercase tracking-tight">Chưa tới</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const PackageTab: React.FC<PackageTabProps> = ({ orderCode }) => {
    const { data: packages, isLoading } = useOrderPackagesQuery(orderCode);
    const { data: statuses } = usePackageStatusesQuery();

    if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
    if (!packages || packages.length === 0) return <Empty description="Không có kiện hàng" />;

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Mã kiện',
            dataIndex: 'code',
            key: 'code',
            render: (v: string) => <span className="font-semibold text-gray-900">{v}</span>,
        },
        {
            title: 'Mã vận đơn',
            dataIndex: 'trackingNumber',
            key: 'trackingNumber',
            render: (v: string) => <span className="text-gray-700">{v || '---'}</span>,
        },
        {
            title: 'Cân nặng',
            dataIndex: 'actualWeight',
            key: 'actualWeight',
            render: (v: number) => <span>{v} kg</span>,
        },
        {
            title: 'Thông số',
            key: 'specs',
            render: (_: any, r: any) => (
                <div className="text-xs text-gray-500 leading-relaxed">
                    <div>Dài: {r.length || 0} cm</div>
                    <div>Rộng: {r.width || 0} cm</div>
                    <div>Cao: {r.height || 0} cm</div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (v: string) => {
                const statusInfo = statuses?.find((s: any) => s.code === v);
                return (
                    <Tag 
                        color={statusColors[v] || 'default'} 
                        className="rounded-full px-4 border-none text-[11px] font-semibold"
                    >
                        {statusInfo?.name || v}
                    </Tag>
                );
            },
        },
        {
            title: 'Cập nhật',
            dataIndex: 'lastStatusTime',
            key: 'lastStatusTime',
            align: 'right' as const,
            render: (v: string) => (
                <div className="text-xs text-gray-500">
                    {v ? dayjs(v).format('HH:mm DD/MM') : '---'}
                </div>
            ),
        },
    ];

    return (
        <div className="package-tab-container px-2">
            <Table
                columns={columns}
                dataSource={packages}
                rowKey="id"
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => <PackageTimeline packageCode={record.code} />,
                    expandIcon: ({ expanded, onExpand, record }) =>
                        expanded ? (
                            <DownOutlined className="cursor-pointer text-gray-400 mr-2" onClick={e => onExpand(record, e)} />
                        ) : (
                            <RightOutlined className="cursor-pointer text-gray-400 mr-2" onClick={e => onExpand(record, e)} />
                        ),
                }}
                className="custom-package-table"
                size="middle"
            />
        </div>
    );
};
