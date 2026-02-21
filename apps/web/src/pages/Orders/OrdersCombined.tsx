import React, { useMemo } from 'react';
import { Tabs, Card } from 'antd';
import { ShoppingCartOutlined, CarOutlined } from '@ant-design/icons';
import { OrdersStyle3 } from './OrdersStyle3';
import { Shipments } from '../Shipments';
import { useTranslation } from '@repo/i18n';

/**
 * Giao diện Combined (Orders + Shipments) - Dành cho Gobiz
 * Sử dụng Tabs để phân chia nội dung
 */
import { useSearchParams } from 'react-router-dom';

export const OrdersCombined: React.FC<{ defaultTab?: string }> = ({ defaultTab = 'orders' }) => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Luôn ưu tiên lấy tab từ URL, nếu không có thì mới dùng default
    const activeTab = searchParams.get('tab') || defaultTab;

    const handleTabChange = (key: string) => {
        // Cập nhật URL khi đổi tab
        // Sử dụng object mới để tránh giữ lại các params rác nếu có
        setSearchParams({ tab: key }, { replace: true });
    };

    const items = [
        {
            key: 'orders',
            label: (
                <span className="flex items-center gap-2 px-2 py-1">
                    <ShoppingCartOutlined />
                    {t('orders.title')}
                </span>
            ),
            children: <OrdersStyle3 isTabView={true} />,
        },
        {
            key: 'shipments',
            label: (
                <span className="flex items-center gap-2 px-2 py-1">
                    <CarOutlined />
                    {t('shipments.title')}
                </span>
            ),
            children: <Shipments isTabView={true} />,
        },
    ];

    return (
        <div className="space-y-6">
            {/* <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                    Quản lý doanh nghiệp Gobiz
                </h1>
                <p className="text-gray-500 text-sm">Giao diện quản lý tập trung Đơn hàng và Vận chuyển.</p>
            </div> */}

            <Tabs
                activeKey={activeTab}
                items={items}
                onChange={handleTabChange}
                type="card"
                // className="custom-combined-tabs"
                size="large"
            />

            {/* <style>{`
                .custom-combined-tabs .ant-tabs-nav {
                    margin-bottom: 24px;
                    border-bottom: none;
                }
                .custom-combined-tabs .ant-tabs-tab {
                    border-radius: 12px !important;
                    border: 1px solid #e5e7eb !important;
                    margin-right: 8px !important;
                    background: #fff !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #4b5563 !important;
                    font-weight: 500 !important;
                }
                .dark .custom-combined-tabs .ant-tabs-tab {
                    background: #1f1f1f !important;
                    border-color: #374151 !important;
                    color: #9ca3af !important;
                }
                .custom-combined-tabs .ant-tabs-tab-active {
                    background: var(--tenant-primary-color, #722ed1) !important;
                    border-color: var(--tenant-primary-color, #722ed1) !important;
                    box-shadow: 0 4px 12px rgba(var(--tenant-primary-rgb), 0.25);
                }
                .custom-combined-tabs .ant-tabs-tab-active .anticon,
                .custom-combined-tabs .ant-tabs-tab-active span {
                    color: #fff !important;
                    font-weight: 700 !important;
                }
                .custom-combined-tabs .ant-tabs-tab:hover:not(.ant-tabs-tab-active) {
                    border-color: var(--tenant-primary-color, #722ed1) !important;
                    color: var(--tenant-primary-color, #722ed1) !important;
                }
                .custom-combined-tabs .ant-tabs-nav::before {
                    display: none;
                }
            `}</style> */}
        </div>
    );
};
