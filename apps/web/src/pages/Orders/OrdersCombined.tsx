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
                        Quản lý Đơn
                    </h1>
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                items={items}
                onChange={handleTabChange}
                type="line"
                size="large"
            />
        </div>
    );
};
