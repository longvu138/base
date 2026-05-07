import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton, Tag, Tabs, Divider } from 'antd';
import {
    ArrowLeftOutlined, RocketOutlined, FundOutlined,
    HistoryOutlined, FileProtectOutlined, EnvironmentOutlined,
    TagOutlined, UserOutlined, InboxOutlined, SwapOutlined,
} from '@ant-design/icons';
import { useShipmentDetailQuery, useShipmentStatusesQuery } from '@repo/hooks';
import { ChatPanel } from '../../components/Common/ChatPanel';
import './ShipmentDetailStyle2.css';

const d = (val: any, suffix = ''): string => {
    if (val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val))) return '---';
    return `${val}${suffix}`;
};

const money = (val: any): string => {
    if (val === null || val === undefined || val === '' || isNaN(Number(val))) return '---';
    return Number(val).toLocaleString('vi-VN') + ' đ';
};

const kg = (val: any): string => {
    if (val === null || val === undefined) return 'Chưa xác định';
    return `${val} kg`;
};

export const ShipmentDetailStyle2 = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { data: shipment, isLoading, isError } = useShipmentDetailQuery(code || '');
    const { data: statusData } = useShipmentStatusesQuery();

    if (isLoading) {
        return (
            <div className="sd2-wrapper p-6 flex gap-6">
                <div className="sd2-left-content">
                    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
                    <Skeleton active className="mt-6" />
                </div>
                <div className="w-[320px] h-[600px] bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
            </div>
        );
    }

    if (isError || !shipment) {
        return (
            <div className="sd2-wrapper flex flex-col items-center justify-center min-h-[500px]">
                <RocketOutlined className="text-5xl text-gray-200 mb-4" />
                <p className="text-xl font-bold text-gray-400">Không tìm thấy yêu cầu ký gửi</p>
                <button onClick={() => navigate('/shipments')} className="mt-6 sd2-btn-primary px-6 py-2 rounded-xl text-sm font-bold">
                    ← Quay lại danh sách
                </button>
            </div>
        );
    }

    const statusInfo = statusData?.find((s: any) => s.code === shipment.status);
    const services = Array.isArray(shipment.services)
        ? shipment.services.map((s: any) => (typeof s === 'object' ? s.name : s)).filter(Boolean)
        : [];
    const parcels = shipment.parcels ?? shipment.items ?? [];
    const histories = shipment.histories ?? shipment.timelines ?? [];

    const tabItems = [
        {
            key: 'parcels',
            label: (
                <span className="sd2-tab-label">
                    <InboxOutlined />
                    Kiện hàng
                    {parcels.length > 0 && <span className="sd2-tab-badge">{parcels.length}</span>}
                </span>
            ),
            children: (
                <div className="sd2-tab-content space-y-3">
                    {parcels.length === 0 ? (
                        <div className="sd2-empty">Không có kiện hàng nào</div>
                    ) : parcels.map((item: any, idx: number) => (
                        <div key={item.id ?? item.code ?? idx} className="sd2-parcel-card">
                            <div className="sd2-parcel-icon">
                                <InboxOutlined />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm">#{d(item.code)}</div>
                                <div className="text-[11px] text-gray-400 mt-1">
                                    Cân nặng: <span className="font-bold text-gray-600 dark:text-gray-300">{d(item.weight, ' kg')}</span>
                                </div>
                            </div>
                            <Tag color="blue" className="rounded-lg m-0">{d(item.status)}</Tag>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: 'financial',
            label: <span className="sd2-tab-label"><FundOutlined />Tài chính</span>,
            children: (
                <div className="sd2-tab-content grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Phí vận chuyển QT', val: shipment.internationalShippingFee },
                        { label: 'Phí dịch vụ', val: shipment.serviceFee },
                        { label: 'Phí lưu kho', val: shipment.storageFee },
                        { label: 'Phí phát sinh', val: shipment.otherFee },
                        { label: 'Tổng thanh toán', val: shipment.grandTotal || shipment.totalAmount, isPrimary: true },
                    ].map(({ label, val, isPrimary }) => (
                        <div key={label} className="sd2-fin-card">
                            <div className="sd2-fin-label">{label}</div>
                            <div className={`sd2-fin-val ${isPrimary ? 'text-primary' : ''}`}>{money(val)}</div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: 'history',
            label: <span className="sd2-tab-label"><HistoryOutlined />Lịch sử</span>,
            children: (
                <div className="sd2-tab-content">
                    {histories.length === 0 ? (
                        <div className="sd2-empty">Chưa có lịch sử cập nhật</div>
                    ) : (
                        <div className="relative pl-6">
                            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-700" />
                            <div className="space-y-6">
                                {histories.map((h: any, i: number) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-white dark:bg-gray-800 border-2 border-primary" />
                                        <div className="font-bold text-sm">{d(h.description ?? h.status ?? h.action)}</div>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            {h.createdAt || h.timestamp ? dayjs(h.createdAt ?? h.timestamp).format('HH:mm DD/MM/YYYY') : '---'}
                                        </div>
                                        {h.note && <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs italic">"{h.note}"</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="sd2-wrapper">
            <div className="sd2-topbar">
                <button onClick={() => navigate('/shipments')} className="sd2-back-btn">
                    <ArrowLeftOutlined />
                    <span>Danh sách ký gửi</span>
                </button>
            </div>

            <div className="sd2-body">
                <div className="sd2-left-content">
                    {/* Premium Info Card */}
                    <div className="sd2-info-card">
                        <div className="sd2-info-header">
                            <div className="sd2-header-main">
                                <div className="sd2-id-badge">
                                    <RocketOutlined />
                                    <span>#{d(shipment.code)}</span>
                                </div>
                                <Tag color={statusInfo?.color || 'default'} className="sd2-premium-tag">
                                    {statusInfo?.name || d(shipment.status)}
                                </Tag>
                            </div>
                            <div className="sd2-header-price">
                                <div className="sd2-price-label">Tổng thanh toán</div>
                                <div className="sd2-price-val">{money(shipment.grandTotal || shipment.totalAmount)}</div>
                            </div>
                        </div>

                        <Divider className="my-6 opacity-40" />

                        <div className="sd2-info-grid">
                            <div className="sd2-info-group">
                                <div className="sd2-group-title">Thông tin ký gửi</div>
                                <div className="space-y-4">
                                    <div className="sd2-info-item">
                                        <SwapOutlined className="sd2-item-icon" />
                                        <div className="sd2-item-body">
                                            <div className="sd2-item-label">Mã vận đơn</div>
                                            <div className="sd2-item-val">{d(shipment.waybillCode)}</div>
                                        </div>
                                    </div>
                                    <div className="sd2-info-item">
                                        <UserOutlined className="sd2-item-icon" />
                                        <div className="sd2-item-body">
                                            <div className="sd2-item-label">Tên Shop</div>
                                            <div className="sd2-item-val">{d(shipment.shopName)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sd2-info-group">
                                <div className="sd2-group-title">Dịch vụ & Định danh</div>
                                <div className="space-y-4">
                                    <div className="sd2-info-item">
                                        <EnvironmentOutlined className="sd2-item-icon" />
                                        <div className="sd2-item-body">
                                            <div className="sd2-item-label">Địa chỉ nhận hàng</div>
                                            <div className="sd2-item-val text-xs leading-snug">{d(shipment.deliveryAddress)}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                        <div className="sd2-sub-item">
                                            <div className="sd2-sub-label">Mã KH</div>
                                            <div className="sd2-sub-val">{d(shipment.customerCode)}</div>
                                        </div>
                                        <div className="sd2-sub-item">
                                            <div className="sd2-sub-label">Đơn hàng gốc</div>
                                            <div className="sd2-sub-val">{d(shipment.orderCode)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sd2-info-group">
                                <div className="sd2-group-title">Thông số vận hành</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="sd2-compact-metric">
                                        <div className="sd2-metric-top"><InboxOutlined /> Cân nặng</div>
                                        <div className="sd2-metric-bottom">{kg(shipment.actualWeight)}</div>
                                    </div>
                                    <div className="sd2-compact-metric">
                                        <div className="sd2-metric-top"><TagOutlined /> Dịch vụ</div>
                                        <div className="sd2-metric-bottom text-[10px]">{services.length > 0 ? services[0] : 'Cơ bản'}</div>
                                    </div>
                                    <div className="sd2-compact-metric">
                                        <div className="sd2-metric-top"><HistoryOutlined /> Ngày tạo</div>
                                        <div className="sd2-metric-bottom text-[10px]">
                                            {shipment.createdAt ? dayjs(shipment.createdAt).format('HH:mm DD/MM/YYYY') : '---'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {shipment.note && (
                            <div className="sd2-info-note">
                                <div className="sd2-note-head"><FileProtectOutlined /> Ghi chú yêu cầu</div>
                                <p className="sd2-note-text">{shipment.note}</p>
                            </div>
                        )}
                    </div>

                    {/* Tabs section */}
                    <div className="sd2-main-card mt-6">
                        <Tabs
                            className="sd2-tabs"
                            size="large"
                            items={tabItems}
                        />
                    </div>
                </div>

                {/* Chat Column */}
                <div className="sd2-chat-col">
                    <ChatPanel entityType="shipments" entityCode={code || ''} rounded="round" />
                </div>
            </div>
        </div>
    );
};
