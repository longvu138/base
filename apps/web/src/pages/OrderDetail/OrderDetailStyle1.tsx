import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Skeleton, Tag, Tabs, Divider, Button, Typography } from 'antd';
import {
    ArrowLeftOutlined, ShoppingCartOutlined, EditOutlined,
} from '@ant-design/icons';
import { useOrderDetailQuery, useOrderStatusesQuery, useUpdateOrderMutation } from '@repo/hooks';

const { Text } = Typography;
import { ChatPanel } from '../../components/Common/ChatPanel';
import { ProductTab } from './tabs/ProductTab';
import { PackageTab } from './tabs/PackageTab';
import { TransactionTab } from './tabs/TransactionTab';
import { HistoryTab } from './tabs/HistoryTab';
import { ClaimTab } from './tabs/ClaimTab';
import { FeeTab } from './tabs/FeeTab';

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
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'products';

    const { data: order, isLoading, isError } = useOrderDetailQuery(code || '');
    const { data: statusData } = useOrderStatusesQuery();
    const updateOrderMutation = useUpdateOrderMutation();
    const [editingField, setEditingField] = useState<string | null>(null);

    const handleUpdate = (field: string, value: string, originalValue?: string) => {
        if (code && value !== originalValue) {
            updateOrderMutation.mutate({ code, data: { [field]: value } });
        }
    };

    const handleTabChange = (key: string) => {
        searchParams.set('tab', key);
        setSearchParams(searchParams, { replace: true });
    };

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


    return (
        <div className="min-h-screen flex dark:bg-gray-950">
            {/* Left side: Main Content */}
            <div className="flex-1 min-w-0 flex flex-col bg-white rounded-xl">
                {/* Back bar */}
                <div className="dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
                    <span
                        onClick={() => navigate('/orders')}
                        className="flex cursor-pointer items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium"
                    >
                        <ArrowLeftOutlined /> Danh sách đơn hàng
                    </span>
                    <Button type="primary">Đặt lại đơn</Button>
                </div>

                {/* Main content area */}
                <div>
                    {/* Header card */}
                    <div className="dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5">
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
                         <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Thu hộ BiFin: </span>
                                <span className="font-semibold text-blue-500">{money(order.bifin ?? order.bifInAmount)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Tổng tiền cần thanh toán: </span>
                                <span className="font-bold text-red-500 text-base">{money(order.grandTotal)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Dịch vụ: </span>
                                <span className="font-medium text-gray-800 dark:text-gray-100">{services || '---'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Địa chỉ giao hàng: </span>
                                <span className="font-medium text-gray-800 dark:text-gray-100">
                                    {d(order.deliveryAddress ?? order.shippingAddress?.full ?? order.shippingAddress?.address)}
                                </span>
                            </div>
                             <div className="flex items-center gap-2 group min-h-[32px]">
                                {editingField !== 'note' && (
                                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Ghi chú cá nhân: </span>
                                )}
                                <div className="flex-1">
                                    <Text
                                        editable={{
                                            icon: <EditOutlined className="text-blue-500 ml-1 transition-colors hover:text-blue-600" />,
                                            tooltip: 'Sửa ghi chú',
                                            onStart: () => setEditingField('note'),
                                            onCancel: () => setEditingField(null),
                                            onChange: (val) => {
                                                handleUpdate('note', val, order.note);
                                                setEditingField(null);
                                            },
                                            autoSize: { minRows: 1, maxRows: 3 },
                                        }}
                                        className="italic text-gray-600 dark:text-gray-300 custom-editable-text w-full"
                                    >
                                        {order.note || 'Trống'}
                                    </Text>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 group min-h-[32px]">
                                {editingField !== 'refCustomerCode' && (
                                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Mã khách hàng: </span>
                                )}
                                <div className="flex-1">
                                    <Text
                                        editable={{
                                            icon: <EditOutlined className="text-blue-500 ml-1 transition-colors hover:text-blue-600" />,
                                            tooltip: 'Sửa mã khách hàng',
                                            onStart: () => setEditingField('refCustomerCode'),
                                            onCancel: () => setEditingField(null),
                                            onChange: (val) => {
                                                handleUpdate('refCustomerCode', val, order.customerCode || order.refCustomerCode);
                                                setEditingField(null);
                                            },
                                        }}
                                        className="font-medium text-gray-800 dark:text-gray-100 custom-editable-text w-full"
                                    >
                                        {order.customerCode || order.refCustomerCode || '---'}
                                    </Text>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 group min-h-[32px]">
                                {editingField !== 'refOrderCode' && (
                                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Mã đơn hàng khách: </span>
                                )}
                                <div className="flex-1">
                                    <Text
                                        editable={{
                                            icon: <EditOutlined className="text-blue-500 ml-1 transition-colors hover:text-blue-600" />,
                                            tooltip: 'Sửa mã đơn hàng khách',
                                            onStart: () => setEditingField('refOrderCode'),
                                            onCancel: () => setEditingField(null),
                                            onChange: (val) => {
                                                handleUpdate('refOrderCode', val, order.customerOrderCode || order.refOrderCode);
                                                setEditingField(null);
                                            },
                                        }}
                                        className="font-medium text-gray-800 dark:text-gray-100 custom-editable-text w-full"
                                    >
                                        {order.customerOrderCode || order.refOrderCode || '---'}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        .custom-editable-text {
                            display: block !important;
                            width: 100% !important;
                        }
                        .custom-editable-text .ant-typography-edit-content {
                            inset-inline-start: 0 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100%;
                            position: relative !important;
                            display: block !important;
                        }
                        .custom-editable-text .ant-input {
                            font-size: 13px !important;
                            padding: 4px 12px !important;
                            border-radius: 6px !important;
                            width: 100% !important;
                            border: 1px solid #d9d9d9 !important;
                            background: #fff !important;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
                        }
                        .custom-editable-text .ant-typography-edit {
                            vertical-align: middle !important;
                            margin-left: 8px !important;
                        }
                    `}</style>

                    {/* Tabs */}
                    <div className="dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Tabs
                            className="px-4"
                            activeKey={activeTab}
                            onChange={handleTabChange}
                            items={[
                                {
                                    key: 'products',
                                    label: 'Sản phẩm',
                                    children: (
                                        <div className="pb-4">
                                            <ProductTab orderCode={code || ''} />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'financial',
                                    label: 'Tài chính đơn',
                                    children: (
                                        <div className="pb-4">
                                            <FeeTab orderCode={code || ''} order={order} />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'packages',
                                    label: 'Kiện hàng',
                                    children: (
                                        <div className="pb-4">
                                            <PackageTab orderCode={code || ''} />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'transactions',
                                    label: 'Giao dịch',
                                    children: (
                                        <div className="pb-4">
                                            <TransactionTab orderCode={code || ''} />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'claims',
                                    label: 'Khiếu nại',
                                    children: (
                                        <div className="pb-4">
                                            <ClaimTab orderCode={code || ''} />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'history',
                                    label: 'Lịch sử',
                                    children: (
                                        <div className="pb-4">
                                            <HistoryTab orderCode={code || ''} />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'log',
                                    label: 'Log',
                                    children: <div className="pb-4 px-4 py-8 text-center text-gray-400 text-sm">Không có log</div>,
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Right side: Chat panel */}
            <div className="w-1/4 min-w-[320px] flex-shrink-0 sticky top-0 h-screen border-l border-gray-200 dark:border-gray-700 z-10 px-4">
                <ChatPanel entityType="orders" entityCode={code || ''} rounded="square" />
            </div>
        </div>

    );
};
