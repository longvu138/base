import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton, Tag, Tabs, Table, Divider, Button } from 'antd';
import {
    ArrowLeftOutlined, ShoppingCartOutlined,
    FundOutlined, HistoryOutlined, FileProtectOutlined,
    SwapOutlined, InboxOutlined,
} from '@ant-design/icons';
import { useOrderDetailQuery, useOrderStatusesQuery } from '@repo/hooks';
import { ChatPanel } from '../../components/Common/ChatPanel';

/** Trả về '---' nếu value là null/undefined/''/NaN */
const d = (val: any, suffix = ''): string => {
    if (val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val))) return '---';
    return `${val}${suffix}`;
};
const money = (val: any): string => {
    if (val === null || val === undefined || isNaN(Number(val))) return '---';
    return Number(val).toLocaleString('vi-VN') + ' đ';
};
const pct = (val: any): string => {
    if (val === null || val === undefined) return '---';
    return `${Math.round(Number(val) * 100)}%`;
};

export const OrderDetailStyle1 = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { data: order, isLoading, isError } = useOrderDetailQuery(code || '');
    const { data: statusData } = useOrderStatusesQuery();

    if (isLoading) {
        return (
            <div className="p-6 max-w-[1200px] mx-auto">
                <Skeleton active paragraph={{ rows: 12 }} />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-gray-400">
                <ShoppingCartOutlined className="text-5xl mb-4" />
                <p className="text-lg">Không tìm thấy đơn hàng</p>
                <Button onClick={() => navigate('/orders')} className="mt-4">Quay lại danh sách</Button>
            </div>
        );
    }

    const statusInfo = statusData?.find((s: any) => s.code === order.status);
    const services = Array.isArray(order.services)
        ? order.services.map((s: any) => (typeof s === 'object' ? s.name : s)).filter(Boolean).join(', ')
        : d(order.services);

    const productColumns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            render: (_: any, r: any) => (
                <div className="flex gap-3 items-start">
                    {r.image ? (
                        <img src={r.image} alt={r.name} className="w-12 h-12 object-cover rounded border flex-shrink-0" />
                    ) : (
                        <div className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <ShoppingCartOutlined className="text-gray-300" />
                        </div>
                    )}
                    <div>
                        <div className="font-medium text-sm">{d(r.name)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{d(r.sku || r.code)}</div>
                        {r.properties?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {r.properties.map((p: any, i: number) => (
                                    <span key={i} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">{p.name}: {p.value}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 60,
            align: 'center' as const,
            render: (v: any) => d(v),
        },
        {
            title: 'Đơn giá',
            key: 'unitPrice',
            align: 'right' as const,
            render: (_: any, r: any) => money(r.unitPrice ?? r.price),
        },
        {
            title: 'Tiền hàng',
            key: 'totalPrice',
            align: 'right' as const,
            render: (_: any, r: any) => (
                <span className="font-semibold">{money(r.totalPrice ?? r.total ?? r.amount)}</span>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Back bar */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                    <ArrowLeftOutlined /> Danh sách đơn hàng
                </button>
                <Button type="primary">Đặt lại đơn</Button>
            </div>

            {/* Two-column: main + chat */}
            <div className="flex gap-4 p-6 max-w-[1400px] mx-auto items-start">
                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Header card */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                        {/* Top row */}
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                    <ShoppingCartOutlined className="text-gray-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-gray-900 dark:text-white">#{d(order.code)}</div>
                                    <Tag
                                        color={statusInfo?.color || 'default'}
                                        className="mt-1 text-xs font-semibold"
                                    >
                                        {statusInfo?.name || d(order.status)}
                                    </Tag>
                                </div>
                                <div className="ml-4">
                                    <span className="text-sm text-gray-500">Tổng chi phí: </span>
                                    <span className="font-bold text-lg text-red-500">{money(order.grandTotal)}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button>Khiếu nại đơn</Button>
                                <Button danger>Huỷ đơn</Button>
                            </div>
                        </div>

                        <Divider className="my-3" />

                        {/* Info grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4 text-sm">
                            {[
                                { label: 'Thành viên', value: d(order.customer?.username ?? order.username) },
                                { label: 'Tỷ lệ đặt cọc', value: pct(order.depositRate) },
                                { label: 'Cân nặng tính phí', value: d(order.chargeableWeight, ' kg') },
                                { label: 'Cân nặng thực', value: d(order.actualWeight, ' kg') },
                                { label: 'Cân nặng đóng gói', value: d(order.packageWeight, ' kg') },
                                { label: 'Cân nặng quy đổi', value: d(order.convertedWeight, ' kg') },
                                { label: 'Tổng thể tích', value: d(order.totalVolume) },
                                { label: 'Tỷ giá', value: order.exchangeRate ? `¥1 = ${Number(order.exchangeRate).toLocaleString()}đ` : '---' },
                                { label: 'Giảm giá từ NCC', value: d(order.supplierDiscount) },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">{label}</div>
                                    <div className="font-semibold text-gray-800 dark:text-gray-100">{value}</div>
                                </div>
                            ))}
                        </div>

                        <Divider className="my-3" />

                        {/* Extra info */}
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Thu hộ BiFin: </span>
                                <span className="font-semibold text-blue-500">{money(order.bifin ?? order.bifInAmount)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Tổng tiền cần thanh toán: </span>
                                <span className="font-bold text-red-500 text-base">{money(order.grandTotal)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Dịch vụ: </span>
                                <span className="font-medium text-gray-800 dark:text-gray-100">{services || '---'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Địa chỉ giao hàng: </span>
                                <span className="font-medium text-gray-800 dark:text-gray-100">
                                    {d(order.deliveryAddress ?? order.shippingAddress?.full ?? order.shippingAddress?.address)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Ghi chú cá nhân cho đơn hàng: </span>
                                <span className="italic text-gray-600 dark:text-gray-300">{d(order.note)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Mã khách hàng: </span>
                                <span className="font-medium text-gray-800 dark:text-gray-100">{d(order.customerCode)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Mã đơn hàng khách: </span>
                                <span className="font-medium text-gray-800 dark:text-gray-100">{d(order.customerOrderCode)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Tabs
                            className="px-4"
                            items={[
                                {
                                    key: 'products',
                                    label: <span className="flex items-center gap-1"><ShoppingCartOutlined />Sản phẩm</span>,
                                    children: (
                                        <div className="pb-4">
                                            <Table
                                                columns={productColumns}
                                                dataSource={order.items ?? order.products ?? []}
                                                rowKey={(r: any) => r.id ?? r.code ?? r.sku ?? Math.random().toString()}
                                                pagination={false}
                                                size="middle"
                                                locale={{ emptyText: 'Không có sản phẩm' }}
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'financial',
                                    label: <span className="flex items-center gap-1"><FundOutlined />Tài chính đơn</span>,
                                    children: (
                                        <div className="pb-4 px-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {[
                                                { label: 'Tổng tiền hàng', value: money(order.itemsTotal ?? order.totalAmount) },
                                                { label: 'Phí vận chuyển NB', value: money(order.domesticShippingFee) },
                                                { label: 'Phí dịch vụ', value: money(order.serviceFee) },
                                                { label: 'Giảm giá', value: money(order.discount ?? order.discountAmount) },
                                                { label: 'Thu hộ BiFin', value: money(order.bifin ?? order.bifInAmount) },
                                                { label: 'Tổng thanh toán', value: money(order.grandTotal) },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="border rounded p-3 dark:border-gray-700">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                                                    <div className="font-bold text-gray-800 dark:text-white mt-1">{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'packages',
                                    label: <span className="flex items-center gap-1"><InboxOutlined />Kiện hàng</span>,
                                    children: <div className="pb-4 px-4 py-8 text-center text-gray-400 text-sm">Không có kiện hàng</div>,
                                },
                                {
                                    key: 'transactions',
                                    label: <span className="flex items-center gap-1"><SwapOutlined />Giao dịch</span>,
                                    children: <div className="pb-4 px-4 py-8 text-center text-gray-400 text-sm">Không có giao dịch</div>,
                                },
                                {
                                    key: 'claims',
                                    label: <span className="flex items-center gap-1"><FileProtectOutlined />Khiếu nại</span>,
                                    children: <div className="pb-4 px-4 py-8 text-center text-gray-400 text-sm">Không có khiếu nại</div>,
                                },
                                {
                                    key: 'history',
                                    label: <span className="flex items-center gap-1"><HistoryOutlined />Lịch sử</span>,
                                    children: (
                                        <div className="pb-4 px-4">
                                            {(order.histories ?? order.timelines ?? []).length === 0 ? (
                                                <div className="py-8 text-center text-gray-400 text-sm">Không có lịch sử</div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {(order.histories ?? order.timelines ?? []).map((h: any, i: number) => (
                                                        <div key={i} className="flex gap-3 text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-medium text-gray-800 dark:text-gray-200">{d(h.action ?? h.status ?? h.event)}</div>
                                                                <div className="text-xs text-gray-400 mt-0.5">{d(h.createdAt ?? h.timestamp)}</div>
                                                                {h.note && <div className="text-xs text-gray-500 italic mt-0.5">{h.note}</div>}
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
                <div className="w-[300px] flex-shrink-0 sticky top-[57px]" style={{ height: 'calc(100vh - 73px)' }}>
                    <ChatPanel entityType="orders" entityCode={code || ''} rounded="square" />
                </div>
            </div>
        </div>
    );
};
