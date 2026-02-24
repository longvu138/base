import React from 'react';
import { Tabs } from 'antd';
import { ShoppingCartOutlined, CarOutlined } from '@ant-design/icons';
import { OrdersStyle3 } from './OrdersStyle3';
import { Shipments } from '../Shipments';
import { useTranslation } from '@repo/i18n';
import { useSearchParams } from 'react-router-dom';

/**
 * Giao diện Combined (Orders + Shipments) - Dành cho Gobiz
 * Sử dụng Tabs để phân chia nội dung với thiết kế Premium
 */
export const OrdersCombined: React.FC<{ defaultTab?: string }> = ({ defaultTab = 'orders' }) => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Luôn ưu tiên lấy tab từ URL, nếu không có thì mới dùng default
    const activeTab = searchParams.get('tab') || defaultTab;

    const handleTabChange = (key: string) => {
        // Khi chuyển tab, xóa sạch tất cả filter params của tab cũ
        // Chỉ giữ lại tab key để tránh "ô nhiễm" giữa hai trang
        setSearchParams({ tab: key }, { replace: true });
    };

    const items = [
        {
            key: 'orders',
            label: (
                <span className="flex items-center gap-2 px-4 py-1">
                    <ShoppingCartOutlined />
                    {t('orders.title')}
                </span>
            ),
            children: <OrdersStyle3 isTabView={true} />,
        },
        {
            key: 'shipments',
            label: (
                <span className="flex items-center gap-2 px-4 py-1">
                    <CarOutlined />
                    {t('shipments.title')}
                </span>
            ),
            children: <Shipments isTabView={true} />,
        },
    ];

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                        Quản lý Tổng hợp
                    </h1>
                    <p className="text-gray-500 text-sm">Giao diện quản lý tập trung Đơn hàng và Vận chuyển dành riêng cho Gobiz.</p>
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                items={items}
                onChange={handleTabChange}
                type="card"
                className="custom-combined-tabs"
                size="large"
                destroyInactiveTabPane={true}
            />

            <style>{`
                .custom-combined-tabs .ant-tabs-nav {
                    margin-bottom: 24px;
                    border-bottom: none;
                }
                .custom-combined-tabs .ant-tabs-tab {
                    border-radius: 16px !important;
                    border: 1px solid #e2e8f0 !important;
                    margin-right: 12px !important;
                    background: #fff !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #64748b !important;
                    font-weight: 600 !important;
                    padding: 12px 20px !important;
                }
                .dark .custom-combined-tabs .ant-tabs-tab {
                    background: #1e293b !important;
                    border-color: #334155 !important;
                    color: #94a3b8 !important;
                }
                .custom-combined-tabs .ant-tabs-tab-active {
                    background: var(--tenant-primary-color, #722ed1) !important;
                    border-color: var(--tenant-primary-color, #722ed1) !important;
                    box-shadow: 0 10px 15px -3px rgba(var(--tenant-primary-rgb), 0.3) !important;
                }
                .custom-combined-tabs .ant-tabs-tab-active .anticon,
                .custom-combined-tabs .ant-tabs-tab-active span {
                    color: #fff !important;
                    font-weight: 800 !important;
                }
                .custom-combined-tabs .ant-tabs-tab:hover:not(.ant-tabs-tab-active) {
                    border-color: var(--tenant-primary-color, #722ed1) !important;
                    color: var(--tenant-primary-color, #722ed1) !important;
                    transform: translateY(-2px);
                }
                .custom-combined-tabs .ant-tabs-nav::before {
                    display: none;
                }
                .custom-combined-tabs .ant-tabs-tab-btn {
                    transition: none !important;
                }
            `}</style>
        </div>
    );
};
