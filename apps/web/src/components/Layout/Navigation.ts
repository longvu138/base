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
    GiftOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    QuestionCircleOutlined,
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
    {
        key: '/vouchers',
        icon: React.createElement(GiftOutlined),
        label: 'Mã giảm giá',
        path: '/vouchers',
    },
    {
        key: '/address',
        icon: React.createElement(EnvironmentOutlined),
        label: 'Địa chỉ nhận hàng',
        path: '/address',
    },
    {
        key: '/wishlist',
        icon: React.createElement(HeartOutlined),
        label: 'Sản phẩm đã lưu',
        path: '/wishlist',
    },
    {
        key: '/faqs',
        icon: React.createElement(QuestionCircleOutlined),
        label: 'Hướng dẫn',
        path: '/faqs',
    },
];

/**
 * Menu riêng cho Gobiz (gd3):
 * - Gom /packages + /delivery-requests + /delivery-notes → "Quản lý giao hàng"
 * - Gom /transactions + /withdrawal-slips → "Giao dịch"
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
    {
        key: '/packages',
        icon: React.createElement(DeliveredProcedureOutlined),
        label: 'Quản lý giao hàng',
        path: '/packages',
    },
    {
        // Gom /transactions + /withdrawal-slips thành 1 mục "Giao dịch"
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
        key: '/vouchers',
        icon: React.createElement(GiftOutlined),
        label: 'Mã giảm giá',
        path: '/vouchers',
    },
    {
        key: '/address',
        icon: React.createElement(EnvironmentOutlined),
        label: 'Địa chỉ nhận hàng',
        path: '/address',
    },
    {
        key: '/wishlist',
        icon: React.createElement(HeartOutlined),
        label: 'Sản phẩm đã lưu',
        path: '/wishlist',
    },
    {
        key: '/faqs',
        icon: React.createElement(QuestionCircleOutlined),
        label: 'Hướng dẫn',
        path: '/faqs',
    },
];

/**
 * Hook lấy danh sách menu — hoàn toàn data-driven từ config backend.
 */
export const useNavigation = (): MenuItem[] => {
    const { tenantConfig } = useTheme();
    const themeConfig = tenantConfig?.tenantConfig?.themeConfig;
    const activeVariant = useActiveVariantConfig();

    const variantCode = tenantConfig?.variantCode || 'gd1';
    const baseItems = variantCode === 'gd3' ? GOBIZ_MENU_ITEMS : BASE_MENU_ITEMS;

    const tenantMenuConfig = themeConfig?.menu;
    const globalMenuConfig = activeVariant?.config?.menu;
    const activeMenuConfig = tenantMenuConfig || globalMenuConfig;

    const hiddenKeys = activeMenuConfig?.hiddenKeys ?? [];
    const filtered = baseItems.filter(item => !hiddenKeys.includes(item.key));

    const labelOverrides = activeMenuConfig?.labelOverrides ?? {};
    return filtered.map(item => ({
        ...item,
        label: labelOverrides[item.key] ?? item.label,
    }));
};
