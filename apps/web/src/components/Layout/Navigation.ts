import React from 'react';
import {
    HomeOutlined,
    ShoppingCartOutlined,
    WalletOutlined,
    CarOutlined,
    InboxOutlined,
    FileProtectOutlined,
    CreditCardOutlined,
} from '@ant-design/icons';
import { useTheme, useActiveVariantConfig } from '@repo/theme-provider';

export interface MenuItem {
    key: string;
    icon: React.ReactNode;
    label: string;
    path: string;
}

/**
 * Danh sách menu đầy đủ (tất cả tenant đều có).
 * Backend dùng menu.hiddenKeys để ẩn bớt, menu.labelOverrides để đổi tên.
 */
const ALL_MENU_ITEMS: MenuItem[] = [
    {
        key: '/dashboard',
        icon: React.createElement(HomeOutlined),
        label: 'Dashboard',
        path: '/dashboard',
    },
    {
        key: '/orders',
        icon: React.createElement(ShoppingCartOutlined),
        label: 'Đơn hàng',
        path: '/orders',
    },
    {
        key: '/shipments',
        icon: React.createElement(CarOutlined),
        label: 'Vận chuyển',
        path: '/shipments',
    },
    {
        key: '/delivery-requests',
        icon: React.createElement(InboxOutlined),
        label: 'Yêu cầu giao',
        path: '/delivery-requests',
    },
    {
        key: '/transactions',
        icon: React.createElement(WalletOutlined),
        label: 'Giao dịch',
        path: '/transactions',
    },
    {
        key: '/claims',
        icon: React.createElement(FileProtectOutlined),
        label: 'Khiếu nại',
        path: '/claims',
    },
    {
        key: '/withdrawal-slips',
        icon: React.createElement(CreditCardOutlined),
        label: 'Rút tiền',
        path: '/withdrawal-slips',
    },
];

/**
 * Hook lấy danh sách menu — hoàn toàn data-driven từ config backend.
 *
 * Backend config mẫu (trong tenant-server):
 * ```json
 * "menu": {
 *   "hiddenKeys": ["/shipments"],
 *   "labelOverrides": { "/orders": "Quản lý Tổng hợp" }
 * }
 * ```
 *
 * Client không cần biết tenant nào dùng variant gì — chỉ đọc config.
 */
export const useNavigation = (): MenuItem[] => {
    const { tenantConfig } = useTheme();
    const themeConfig = tenantConfig?.tenantConfig?.themeConfig;
    const activeVariant = useActiveVariantConfig();

    // 1. Lấy menu config: Ưu tiên tenant override -> rồi đến mẫu hệ thống (activeVariant)
    const tenantMenuConfig = themeConfig?.menu;
    const globalMenuConfig = activeVariant?.config?.menu;

    const activeMenuConfig = tenantMenuConfig || globalMenuConfig;

    // 2. Lọc bỏ các item nằm trong hiddenKeys
    const hiddenKeys = activeMenuConfig?.hiddenKeys ?? [];
    const filtered = ALL_MENU_ITEMS.filter(item => !hiddenKeys.includes(item.key));

    // 3. Đổi tên label theo labelOverrides
    const labelOverrides = activeMenuConfig?.labelOverrides ?? {};
    return filtered.map(item => ({
        ...item,
        label: labelOverrides[item.key] ?? item.label,
    }));
};
