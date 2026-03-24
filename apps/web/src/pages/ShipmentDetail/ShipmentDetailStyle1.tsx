import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton, Tag, Tabs, Divider, Button } from 'antd';
import {
    ArrowLeftOutlined, RocketOutlined,
    FundOutlined, HistoryOutlined,
    InboxOutlined,
    EnvironmentOutlined, UserOutlined,
} from '@ant-design/icons';
import { useShipmentDetailQuery, useShipmentStatusesQuery } from '@repo/hooks';
import { ChatPanel } from '../../components/Common/ChatPanel';

/** Trả về '---' nếu value là null/undefined/''/NaN */
const d = (val: any, suffix = ''): string => {
    if (val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val))) return '---';
    return `${val}${suffix}`;
};

const money = (val: any): string => {
    if (val === null || val === undefined || val === '' || isNaN(Number(val))) return '---';
    return Number(val).toLocaleString('vi-VN') + ' đ';
};

export const ShipmentDetailStyle1 = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { data: shipment, isLoading, isError } = useShipmentDetailQuery(code || '');
    const { data: statusData } = useShipmentStatusesQuery();

    if (isLoading) {
        return (
            <div className="p-6 max-w-[1200px] mx-auto">
                <Skeleton active paragraph={{ rows: 12 }} />
            </div>
        );
    }

    if (isError || !shipment) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-gray-400">
                <RocketOutlined className="text-5xl mb-4" />
                <p className="text-lg">Không tìm thấy yêu cầu ký gửi</p>
                <Button onClick={() => navigate('/shipments')} className="mt-4">Quay lại danh sách</Button>
            </div>
        );
    }

    const statusInfo = statusData?.find((s: any) => s.code === shipment.status);
    const services = Array.isArray(shipment.services)
        ? shipment.services.map((s: any) => (typeof s === 'object' ? s.name : s)).filter(Boolean).join(', ')
        : d(shipment.services);

    const parcels = shipment.parcels ?? shipment.items ?? [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Back bar */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={() => navigate('/shipments')}
                    className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                    <ArrowLeftOutlined /> Danh sách ký gửi
                </button>
            </div>

            {/* Two-column: main + chat */}
            <div className="flex gap-4 p-6 max-w-[1400px] mx-auto items-start">
                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Header card */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                    <RocketOutlined className="text-primary" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-gray-900 dark:text-white">#{d(shipment.code)}</div>
                                    <Tag
                                        color={statusInfo?.color || 'default'}
                                        className="mt-1 text-xs font-semibold"
                                    >
                                        {statusInfo?.name || d(shipment.status)}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        <Divider className="my-3" />

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
                            <div>
                                <div className="text-gray-500 text-xs mb-0.5">Mã vận đơn</div>
                                <div className="font-semibold text-gray-800 dark:text-gray-200">{d(shipment.waybillCode)}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs mb-0.5">Tên Shop</div>
                                <div className="font-semibold text-gray-800 dark:text-gray-200">{d(shipment.shopName)}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs mb-0.5">Mã đơn hàng KH</div>
                                <div className="font-semibold text-gray-800 dark:text-gray-200">{d(shipment.orderCode)}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs mb-0.5">Cân nặng thực</div>
                                <div className="font-semibold text-gray-800 dark:text-gray-200">{d(shipment.actualWeight, ' kg')}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs mb-0.5">Ngày tạo</div>
                                <div className="font-semibold text-gray-800 dark:text-gray-200">{d(shipment.createdAt)}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs mb-0.5">Dịch vụ</div>
                                <div className="font-semibold text-gray-800 dark:text-gray-200">{services || '---'}</div>
                            </div>
                        </div>

                        <Divider className="my-3" />

                        <div className="space-y-3 text-sm">
                            <div className="flex gap-2">
                                <UserOutlined className="text-gray-400 mt-0.5" />
                                <div>
                                    <span className="text-gray-500">Mã KH: </span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{d(shipment.customerCode)}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <EnvironmentOutlined className="text-gray-400 mt-0.5" />
                                <div>
                                    <span className="text-gray-500">Địa chỉ: </span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{d(shipment.deliveryAddress)}</span>
                                </div>
                            </div>
                            {shipment.note && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/30">
                                    <div className="text-xs text-blue-500 font-bold uppercase mb-1">Ghi chú</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 italic">"{shipment.note}"</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <Tabs
                            className="px-4"
                            items={[
                                {
                                    key: 'parcels',
                                    label: <span className="flex items-center gap-1"><InboxOutlined />Kiện hàng</span>,
                                    children: (
                                        <div className="pb-4">
                                            {parcels.length === 0 ? (
                                                <div className="py-12 text-center text-gray-400 text-sm">Không có dữ liệu kiện hàng</div>
                                            ) : (
                                                <div className="space-y-2 px-2 pt-2">
                                                    {parcels.map((p: any, i: number) => (
                                                        <div key={i} className="flex items-center justify-between p-3 border rounded dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                                                    <InboxOutlined className="text-gray-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-sm">#{d(p.code)}</div>
                                                                    <div className="text-xs text-gray-500 mt-0.5">Cân nặng: {d(p.weight, ' kg')}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <Tag color="processing" className="m-0 text-[10px]">{d(p.status)}</Tag>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'financial',
                                    label: <span className="flex items-center gap-1"><FundOutlined />Tài chính</span>,
                                    children: (
                                        <div className="pb-4 px-2 pt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {[
                                                { label: 'Phí vận chuyển quốc tế', value: money(shipment.internationalShippingFee) },
                                                { label: 'Phí dịch vụ', value: money(shipment.serviceFee) },
                                                { label: 'Phí lưu kho', value: money(shipment.storageFee) },
                                                { label: 'Phí phát sinh', value: money(shipment.otherFee) },
                                                { label: 'Tổng thanh toán', value: money(shipment.totalAmount || shipment.grandTotal) },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="border rounded p-3 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                                    <div className="text-xs text-gray-500">{label}</div>
                                                    <div className="font-bold text-gray-800 dark:text-white mt-1">{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'history',
                                    label: <span className="flex items-center gap-1"><HistoryOutlined />Lịch sử</span>,
                                    children: (
                                        <div className="pb-4 px-2 pt-2">
                                            {(shipment.histories ?? shipment.timelines ?? []).length === 0 ? (
                                                <div className="py-12 text-center text-gray-400 text-sm">Không có lịch sử</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {(shipment.histories ?? shipment.timelines ?? []).map((h: any, i: number) => (
                                                        <div key={i} className="flex gap-3 text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-medium text-gray-800 dark:text-gray-200">{d(h.description ?? h.status ?? h.action)}</div>
                                                                <div className="text-xs text-gray-400 mt-0.5">{d(h.createdAt ?? h.timestamp)}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </div>

                {/* Chat panel — sticky bên phải */}
                <div className="w-[320px] flex-shrink-0 sticky top-[73px]" style={{ height: 'calc(100vh - 93px)' }}>
                    <ChatPanel entityType="shipments" entityCode={code || ''} rounded="square" />
                </div>
            </div>
        </div>
    );
};
