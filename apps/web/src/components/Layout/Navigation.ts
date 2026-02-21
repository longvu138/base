import React from 'react';
import {
    HomeOutlined,
    ShoppingCartOutlined,
    WalletOutlined,
    CarOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import { useVariantCode } from '@repo/theme-provider';

export interface MenuItem {
    key: string;
    icon: React.ReactNode;
    label: string;
    path: string;
}

const BASE_MENU: MenuItem[] = [
    {
        key: '/dashboard',
        icon: React.createElement(HomeOutlined),
        label: 'Dashboard',
        path: '/dashboard'
    },
    {
        key: '/orders',
        icon: React.createElement(ShoppingCartOutlined),
        label: 'Đơn hàng',
        path: '/orders'
    },
    {
        key: '/shipments',
        icon: React.createElement(CarOutlined),
        label: 'Vận chuyển',
        path: '/shipments'
    },
    {
        key: '/delivery-requests',
        icon: React.createElement(InboxOutlined),
        label: 'Yêu cầu giao',
        path: '/delivery-requests'
    },
    {
        key: '/transactions',
        icon: React.createElement(WalletOutlined),
        label: 'Giao dịch',
        path: '/transactions'
    },
];

/**
 * Hook để lấy danh sách menu tùy biến theo Variant (không phải theo TenantCode)
 * Giúp code sạch và có thể scale cho hàng trăm tenant dùng chung 1 variant.
 */
export const useNavigation = (): MenuItem[] => {
    const variantCode = useVariantCode();
    // Nếu variant là 'gd3' (Center Hub), chúng ta ẩn Shipments vì đã gộp vào Orders
    if (variantCode === 'gd3') {
        return BASE_MENU
            .filter(item => item.key !== '/shipments')
            .map(item => {
                // Tùy biến label cho phù hợp với Hub trung tâm
                if (item.key === '/orders') return { ...item, label: 'Quản lý Tổng hợp' };
                return item;
            });
    }

    // Mặc định trả về menu chuẩn
    return BASE_MENU;
};
