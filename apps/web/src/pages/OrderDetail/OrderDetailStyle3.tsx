import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton, Tag, Tabs, Divider } from 'antd';
import {
    ArrowLeftOutlined, ShoppingCartOutlined, FundOutlined,
    HistoryOutlined, FileProtectOutlined, EnvironmentOutlined,
    TagOutlined, UserOutlined, InboxOutlined, SwapOutlined,
    CheckCircleFilled, ClockCircleFilled,
} from '@ant-design/icons';
import { useOrderDetailQuery, useOrderStatusesQuery } from '@repo/hooks';
import { ChatPanel } from '../../components/Common/ChatPanel';
import './OrderDetailStyle3.css';

const d = (val: any, suffix = ''): string => {
    if (val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val))) return '---';
    return `${val}${suffix}`;
};
const money = (val: any): string => {
    if (val === null || val === undefined || val === '' || isNaN(Number(val))) return '---';
    return Number(val).toLocaleString('vi-VN') + ' đ';
};
const pct = (val: any): string => {
    if (val === null || val === undefined) return '---';
    return `${Math.round(Number(val) * 100)}%`;
};
const kg = (val: any): string => {
    if (val === null || val === undefined) return 'Chưa xác định';
    return `${val} kg`;
};

export const OrderDetailStyle3 = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { data: order, isLoading, isError } = useOrderDetailQuery(code || '');
    const { data: statusData } = useOrderStatusesQuery();

    /* ── Loading skeleton ── */
    if (isLoading) {
        return (
            <div className="od3-wrapper p-6 flex gap-6">
                <div className="od3-sidebar">
                    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
                    <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse mt-4" />
                </div>
                <div className="flex-1">
                    <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-4" />
                    <Skeleton active paragraph={{ rows: 10 }} />
                </div>
            </div>
        );
    }

    /* ── Error / not found ── */
    if (isError || !order) {
        return (
            <div className="od3-wrapper flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                    <ShoppingCartOutlined className="text-4xl text-gray-300" />
                </div>
                <p className="text-xl font-bold text-gray-400 mb-2">Không tìm thấy đơn hàng</p>
                <p className="text-sm text-gray-300 mb-6">Mã đơn không tồn tại hoặc bạn không có quyền xem.</p>
                <button onClick={() => navigate('/orders')} className="od3-btn-primary px-6 py-2.5 rounded-2xl text-sm font-bold">
                    ← Quay lại danh sách
                </button>
            </div>
        );
    }

    const statusInfo = statusData?.find((s: any) => s.code === order.status);
    const services = Array.isArray(order.services)
        ? order.services.map((s: any) => (typeof s === 'object' ? s.name : s)).filter(Boolean)
        : [];
    const shopName = d(order.shopName ?? order.shop?.name ?? order.supplier?.name);
    const deliveryAddr = d(order.deliveryAddress ?? order.shippingAddress?.full ?? order.shippingAddress?.address);
    const productItems = order.items ?? order.products ?? [];
    const histories = order.histories ?? order.timelines ?? [];


    /* ── Tab items ── */
    const tabItems = [
        {
            key: 'products',
            label: (
                <span className="od3-tab-label">
                    <ShoppingCartOutlined />
                    Sản phẩm
                    {productItems.length > 0 && <span className="od3-tab-badge">{productItems.length}</span>}
                </span>
            ),
            children: (
                <div className="od3-tab-content space-y-3">
                    {productItems.length === 0 ? (
                        <div className="od3-empty">Không có sản phẩm</div>
                    ) : productItems.map((item: any, idx: number) => (
                        <div key={item.id ?? item.code ?? idx} className="od3-product-card">
                            <div className="od3-product-img">
                                {item.image ? (
                                    <img src={item.image} alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                ) : (
                                    <ShoppingCartOutlined className="text-gray-300 text-xl" />
                                )}
                                {item.quantity != null && (
                                    <span className="od3-qty-badge">{item.quantity}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-800 dark:text-gray-100 line-clamp-2 text-sm">{d(item.name)}</div>
                                <div className="text-[11px] text-gray-400 font-mono mt-0.5">{d(item.sku ?? item.code)}</div>
                                {item.properties?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {item.properties.map((p: any, i: number) => (
                                            <span key={i} className="od3-prop-tag">{d(p.name)}: {d(p.value)}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 mt-1.5">
                                    {d(item.quantity)} × {money(item.unitPrice ?? item.price)}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-base font-black od3-price">{money(item.totalPrice ?? item.total ?? item.amount)}</div>
                                <div className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">VNĐ</div>
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: 'financial',
            label: <span className="od3-tab-label"><FundOutlined />Tài chính đơn</span>,
            children: (
                <div className="od3-tab-content">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Tổng tiền hàng', val: order.itemsTotal ?? order.totalAmount, color: 'text-gray-800 dark:text-gray-100' },
                            { label: 'Phí vận chuyển NB', val: order.domesticShippingFee, color: 'text-orange-500' },
                            { label: 'Phí dịch vụ', val: order.serviceFee, color: 'text-purple-500' },
                            { label: 'Giảm giá NCC', val: order.supplierDiscount ?? order.discount, color: 'text-green-500' },
                            { label: 'Thu hộ BiFin', val: order.bifin ?? order.bifInAmount, color: 'text-blue-500' },
                            { label: 'Tổng thanh toán', val: order.grandTotal, color: 'text-primary font-extrabold' },
                        ].map(({ label, val, color }) => (
                            <div key={label} className="od3-fin-card">
                                <div className="od3-fin-label">{label}</div>
                                <div className={`od3-fin-value ${color}`}>{money(val)}</div>
                            </div>
                        ))}
                    </div>
                    <Divider />
                    <div className="flex justify-end">
                        <div className="text-right">
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">Tổng cần thanh toán</div>
                            <div className="text-4xl font-black od3-price mt-1">{money(order.grandTotal)}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'packages',
            label: <span className="od3-tab-label"><InboxOutlined />Kiện hàng</span>,
            children: <div className="od3-empty">Không có kiện hàng</div>,
        },
        {
            key: 'transactions',
            label: <span className="od3-tab-label"><SwapOutlined />Giao dịch</span>,
            children: <div className="od3-empty">Không có giao dịch</div>,
        },
        {
            key: 'claims',
            label: <span className="od3-tab-label"><FileProtectOutlined />Khiếu nại</span>,
            children: <div className="od3-empty">Không có khiếu nại</div>,
        },
        {
            key: 'history',
            label: <span className="od3-tab-label"><HistoryOutlined />Lịch sử</span>,
            children: (
                <div className="od3-tab-content">
                    {histories.length === 0 ? (
                        <div className="od3-empty">Không có lịch sử</div>
                    ) : (
                        <div className="relative">
                            {/* Timeline connector */}
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-700" />
                            <div className="space-y-4">
                                {histories.map((h: any, i: number) => (
                                    <div key={i} className="od3-timeline-item">
                                        <div className="od3-timeline-dot">
                                            {i === 0
                                                ? <CheckCircleFilled className="text-green-500 text-lg" />
                                                : <ClockCircleFilled className="text-gray-300 text-lg" />
                                            }
                                        </div>
                                        <div className="od3-timeline-body">
                                            <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                                                {d(h.action ?? h.status ?? h.event ?? h.description)}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">{d(h.createdAt ?? h.timestamp)}</div>
                                            {h.note && <p className="text-xs text-gray-500 italic mt-1 border-l-2 border-gray-200 dark:border-gray-600 pl-2">{h.note}</p>}
                                        </div>
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
        <div className="od3-wrapper">
            {/* ── Back breadcrumb ── */}
            <div className="od3-topbar">
                <button onClick={() => navigate('/orders')} className="od3-back-btn">
                    <ArrowLeftOutlined />
                    <span>Danh sách đơn hàng</span>
                </button>
                <div className="od3-topbar-actions">
                    <button className="od3-btn-ghost">Khiếu nại đơn</button>
                    <button className="od3-btn-danger">Huỷ đơn</button>
                    <button className="od3-btn-primary">Đặt lại đơn</button>
                </div>
            </div>

            {/* ════ Two-column layout: Info+Tabs (Left) | Chat (Right) ════ */}
            <div className="od3-body-style3">
                {/* ════ LEFT COLUMN (Info & Tabs) ════ */}
                <div className="od3-left-content">
                    <aside className="od3-sidebar">
                        <div className="od3-info-card">
                            {/* ── HEADER: ID & Status ── */}
                            <div className="od3-info-header">
                                <div className="od3-header-main">
                                    <div className="od3-id-badge">
                                        <ShoppingCartOutlined />
                                        <span>#{d(order.code)}</span>
                                    </div>
                                    <Tag color={statusInfo?.color || 'default'} className="od3-premium-tag">
                                        <span className="od3-tag-dot" />
                                        {statusInfo?.name || d(order.status)}
                                    </Tag>
                                </div>
                                <div className="od3-header-price">
                                    <div className="od3-price-label">Tổng thanh toán</div>
                                    <div className="od3-price-val">{money(order.grandTotal)}</div>
                                </div>
                            </div>

                            <Divider className="my-5 opacity-40" />

                            {/* ── CONTENT: 3-Column Detail Grid ── */}
                            <div className="od3-info-grid">
                                {/* Group 1: Parties */}
                                <div className="od3-info-group">
                                    <div className="od3-group-title">Đối tác & Dịch vụ</div>
                                    <div className="od3-info-item">
                                        <UserOutlined className="od3-item-icon" />
                                        <div className="od3-item-body">
                                            <div className="od3-item-label">Người bán</div>
                                            <div className="od3-item-val">{shopName}</div>
                                        </div>
                                    </div>
                                    {services.length > 0 && (
                                        <div className="od3-info-item mt-3">
                                            <TagOutlined className="od3-item-icon" />
                                            <div className="od3-item-body">
                                                <div className="od3-item-label">Dịch vụ đi kèm</div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {services.map((s: string, i: number) => (
                                                        <span key={i} className="od3-mini-badge">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Group 2: Shipping & Codes */}
                                <div className="od3-info-group">
                                    <div className="od3-group-title">Giao hàng & Định danh</div>
                                    <div className="od3-info-item">
                                        <EnvironmentOutlined className="od3-item-icon" />
                                        <div className="od3-item-body">
                                            <div className="od3-item-label">Địa chỉ nhận hàng</div>
                                            <div className="od3-item-val text-xs leading-snug">{deliveryAddr}</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="od3-sub-item">
                                            <div className="od3-sub-label">Mã khách hàng</div>
                                            <div className="od3-sub-val">{d(order.customerCode)}</div>
                                        </div>
                                        <div className="od3-sub-item">
                                            <div className="od3-sub-label">Mã đơn KH</div>
                                            <div className="od3-sub-val">{d(order.customerOrderCode)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Group 3: Metrics */}
                                <div className="od3-info-group">
                                    <div className="od3-group-title">Thông số vận hành</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="od3-compact-metric">
                                            <div className="od3-metric-top">
                                                <UserOutlined /> <span>Thành viên</span>
                                            </div>
                                            <div className="od3-metric-bottom">{d(order.customer?.username ?? order.username)}</div>
                                        </div>
                                        <div className="od3-compact-metric">
                                            <div className="od3-metric-top">
                                                <ClockCircleFilled /> <span>Đặt cọc</span>
                                            </div>
                                            <div className="od3-metric-bottom">{pct(order.depositRate)}</div>
                                        </div>
                                        <div className="od3-compact-metric">
                                            <div className="od3-metric-top">
                                                <InboxOutlined /> <span>Cân nặng</span>
                                            </div>
                                            <div className="od3-metric-bottom">{kg(order.actualWeight)}</div>
                                        </div>
                                        <div className="od3-compact-metric">
                                            <div className="od3-metric-top">
                                                <SwapOutlined /> <span>Tỷ giá</span>
                                            </div>
                                            <div className="od3-metric-bottom">{order.exchangeRate ? Number(order.exchangeRate).toLocaleString() : '---'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── FOOTER: Note ── */}
                            {d(order.note) !== '---' && (
                                <div className="od3-info-note">
                                    <div className="od3-note-head">
                                        <FileProtectOutlined /> <span>Ghi chú đơn hàng</span>
                                    </div>
                                    <p className="od3-note-text">{order.note}</p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Tabs logic */}
                    <main className="od3-main mt-4">
                        <div className="od3-card h-full">
                            <Tabs
                                className="od3-tabs h-full"
                                size="large"
                                items={tabItems}
                            />
                        </div>
                    </main>
                </div>

                {/* ════ RIGHT COLUMN (Chat) ════ */}
                <div className="od3-chat-col">
                    <ChatPanel entityType="orders" entityCode={code || ''} rounded="round" />
                </div>
            </div>
        </div>
    );
};
