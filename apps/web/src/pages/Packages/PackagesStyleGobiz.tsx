import React from 'react';
import { Card, Space, Tabs, Typography, theme } from 'antd';
import { BarcodeOutlined, InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import { PackageStyleGobiz } from './PackageStyleGobiz';
import { DeliveryRequestsStyleGobiz } from '../DeliveryRequests/DeliveryRequestsStyleGobiz';
import { DeliveryNoteStyleGobiz } from '../DeliveryNotes/DeliveryNoteStyleGobiz';
import { useSearchParams } from 'react-router-dom';

/**
 * PackagesStyleGobiz — Trang "Quản lý giao hàng" dành cho Gobiz (gobiz)
 *
 * Gom Danh sách kiện hàng + Yêu cầu giao hàng + Phiếu xuất vào một trang với Tabs,
 * giống cách OrdersStyleGobizCombined.tsx gom Orders + Shipments.
 *
 * Tên export = PackagesStyleGobiz để DynamicVariant resolve đúng:
 *   useVariant('packages', 'PackagesStyleDefault') + variantCode 'gobiz' → 'PackagesStyleGobiz'
 */
export const PackagesStyleGobiz: React.FC = () => {
    const { token } = theme.useToken();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get('tab') || 'packages';

    const handleTabChange = (key: string) => {
        // Xoá sạch filter cũ khi chuyển tab
        setSearchParams({ tab: key }, { replace: true });
    };

    const items = [
        {
            key: 'packages',
            label: (
                <Space>
                    <BarcodeOutlined />
                    <span>Kiện hàng</span>
                </Space>
            ),
            children: <PackageStyleGobiz isTabView={true} />,
        },
        {
            key: 'delivery',
            label: (
                <Space>
                    <InboxOutlined />
                    <span>Yêu cầu giao hàng</span>
                </Space>
            ),
            children: <DeliveryRequestsStyleGobiz isTabView={true} />,
        },
        {
            key: 'delivery-notes',
            label: (
                <Space>
                    <FileTextOutlined />
                    <span>Phiếu xuất</span>
                </Space>
            ),
            children: <DeliveryNoteStyleGobiz isTabView={true} />,
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Quản lý Giao hàng
                </Typography.Title>
            </Card>

            <Card bodyStyle={{ paddingTop: token.paddingSM }}>
                <Tabs
                    activeKey={activeTab}
                    items={items}
                    onChange={handleTabChange}
                    type="line"
                    size="large"
                />
            </Card>
        </Space>
    );
};
