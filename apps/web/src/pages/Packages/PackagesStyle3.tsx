import React from 'react';
import { Tabs } from 'antd';
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
                <span className="flex items-center gap-2 px-4 py-1">
                    <BarcodeOutlined />
                    Kiện hàng
                </span>
            ),
            children: <PackageStyle3 isTabView={true} />,
        },
        {
            key: 'delivery',
            label: (
                <span className="flex items-center gap-2 px-4 py-1">
                    <InboxOutlined />
                    Yêu cầu giao hàng
                </span>
            ),
            children: <DeliveryRequestsStyle3 isTabView={true} />,
        },
        {
            key: 'delivery-notes',
            label: (
                <span className="flex items-center gap-2 px-4 py-1">
                    <FileTextOutlined />
                    Phiếu xuất
                </span>
            ),
            children: <DeliveryNoteStyle3 isTabView={true} />,
        },
    ];

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6 pt-2">
            <div className="mb-2">
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                    Quản lý Giao hàng
                </h1>
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

