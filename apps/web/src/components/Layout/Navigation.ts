import React from 'react';
import {
    HomeOutlined,
    ShoppingCartOutlined,
    WalletOutlined,
    CarOutlined,
    InboxOutlined,
    FileProtectOutlined,
    CreditCardOutlined,
    DeliveredProcedureOutlined,
    FileTextOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import { useTheme, useActiveVariantConfig } from '@repo/theme-provider';

export interface MenuItem {
    key: string;
    icon: React.ReactNode;
    label: string;
    path: string;
}

/**
 * Menu dùng chung cho tất cả variant (Style 1, 2, ...).
 * Giao diện 3 (Gobiz) sẽ gom Kiện hàng + Yêu cầu giao thành 1 mục.
 */
const BASE_MENU_ITEMS: MenuItem[] = [
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
        key: '/packages',
        icon: React.createElement(InboxOutlined),
        label: 'Kiện hàng',
        path: '/packages',
    },
    {
        key: '/delivery-notes',
        icon: React.createElement(FileTextOutlined),
        label: 'Phiếu xuất',
        path: '/delivery-notes',
    },
    {
        key: '/waybills',
        icon: React.createElement(TagsOutlined),
        label: 'Mã vận đơn',
        path: '/waybills',
    },
    {
        key: '/withdrawal-slips',
        icon: React.createElement(CreditCardOutlined),
        label: 'Rút tiền',
        path: '/withdrawal-slips',
    },
];

/**
 * Menu riêng cho Gobiz (gd3): gom Kiện hàng + Yêu cầu giao hàng thành
 * 1 mục duy nhất "Quản lý giao hàng" trỏ đến /packages (PackageStyle3).
 * Mục /delivery-requests được ẩn vì đã được tích hợp vào /packages.
 */
const GOBIZ_MENU_ITEMS: MenuItem[] = [
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
    // Gom /packages + /delivery-requests thành 1 mục
    {
        key: '/packages',
        icon: React.createElement(DeliveredProcedureOutlined),
        label: 'Quản lý giao hàng',
        path: '/packages',
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
        key: '/waybills',
        icon: React.createElement(TagsOutlined),
        label: 'Mã vận đơn',
        path: '/waybills',
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
 * - Với gd3 (Gobiz): dùng GOBIZ_MENU_ITEMS (gom Kiện hàng + Yêu cầu giao)
 * - Với gd1 và các variant khác: dùng BASE_MENU_ITEMS (2 mục riêng)
 *
 * Backend vẫn có thể override qua menu.hiddenKeys và menu.labelOverrides.
 */
export const useNavigation = (): MenuItem[] => {
    const { tenantConfig } = useTheme();
    const themeConfig = tenantConfig?.tenantConfig?.themeConfig;
    const activeVariant = useActiveVariantConfig();

    // Xác định variant code: ưu tiên tenantConfig, sau đó activeVariant
    const variantCode = tenantConfig?.variantCode || 'gd1';

    // Chọn danh sách menu gốc tuỳ variant
    const baseItems = variantCode === 'gd3' ? GOBIZ_MENU_ITEMS : BASE_MENU_ITEMS;

    // Lấy menu config: Ưu tiên tenant override -> rồi đến mẫu hệ thống (activeVariant)
    const tenantMenuConfig = themeConfig?.menu;
    const globalMenuConfig = activeVariant?.config?.menu;
    const activeMenuConfig = tenantMenuConfig || globalMenuConfig;

    // Lọc bỏ các item nằm trong hiddenKeys
    const hiddenKeys = activeMenuConfig?.hiddenKeys ?? [];
    const filtered = baseItems.filter(item => !hiddenKeys.includes(item.key));

    // Đổi tên label theo labelOverrides
    const labelOverrides = activeMenuConfig?.labelOverrides ?? {};
    return filtered.map(item => ({
        ...item,
        label: labelOverrides[item.key] ?? item.label,
    }));
};
