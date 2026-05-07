import React from 'react';
import { Tabs } from 'antd';
import { ShoppingCartOutlined, CarOutlined } from '@ant-design/icons';
import { OrdersStyle3 } from './OrdersStyle3';
import { ShipmentsPage } from '../Shipments';
import { useTranslation } from '@repo/i18n';
import { useSearchParams } from 'react-router-dom';

/**
 * Giao diện Combined (Orders + Shipments) cho Mobile
 * Đồng bộ với bản Web của Gobiz
 */
export const OrdersCombined: React.FC<any> = (props) => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'orders';

    const handleTabChange = (key: string) => {
        setSearchParams({ tab: key }, { replace: true });
    };

    const items = [
        {
            key: 'orders',
            label: (
                <div className="flex items-center gap-2">
                    <ShoppingCartOutlined />
                    <span>{t('orders.title')}</span>
                </div>
            ),
            children: <OrdersStyle3 {...props} isTabView={true} />,
        },
        {
            key: 'shipments',
            label: (
                <div className="flex items-center gap-2">
                    <CarOutlined />
                    <span>{t('shipments.title')}</span>
                </div>
            ),
            children: <ShipmentsPage isTabView={true} />,
        },
    ];

    return (
        <div className="orders-combined-mobile pb-24">
            <Tabs
                activeKey={activeTab}
                items={items}
                onChange={handleTabChange}
                centered
                className="custom-combined-tabs"
                size="large"
                tabBarStyle={{ 
                    background: '#fff', 
                    margin: 0, 
                    padding: '0 16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    borderBottom: '1px solid #f0f0f0'
                }}
            />
        </div>
    );
};
