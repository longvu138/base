import React from 'react';
import { Card, Space, Tabs, Typography, theme } from 'antd';
import { BarcodeOutlined, InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import { PackageStyle3 } from './PackageStyle3';
import { DeliveryRequestsStyle3 } from '../DeliveryRequests/DeliveryRequestsStyle3';
import { DeliveryNoteStyle3 } from '../DeliveryNotes/DeliveryNoteStyle3';
import { useSearchParams } from 'react-router-dom';

/**
 * PackagesStyle3 — Trang "Quản lý giao hàng" dành cho Gobiz (gd3)
 *
 * Gom Danh sách kiện hàng + Yêu cầu giao hàng + Phiếu xuất vào một trang với Tabs,
 * giống cách OrdersCombined.tsx gom Orders + Shipments.
 *
 * Tên export = PackagesStyle3 để DynamicVariant resolve đúng:
 *   useVariant('packages') + variantCode 'gd3' → 'PackagesStyle3'
 */
export const PackagesStyle3: React.FC = () => {
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
            children: <PackageStyle3 isTabView={true} />,
        },
        {
            key: 'delivery',
            label: (
                <Space>
                    <InboxOutlined />
                    <span>Yêu cầu giao hàng</span>
                </Space>
            ),
            children: <DeliveryRequestsStyle3 isTabView={true} />,
        },
        {
            key: 'delivery-notes',
            label: (
                <Space>
                    <FileTextOutlined />
                    <span>Phiếu xuất</span>
                </Space>
            ),
            children: <DeliveryNoteStyle3 isTabView={true} />,
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
