import React from 'react';
import { useVariant, useVariantCode } from '@repo/theme-provider';
import { Shipments as BaseShipments } from './Shipments';
import { OrdersCombined } from '../Orders/OrdersCombined';

const ShipmentsPage: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
    const variantCode = useVariantCode();

    // Nếu là Gobiz thì hiển thị trang gộp với tab Shipments
    if (variantCode === 'gd3' && !isTabView) {
        return <OrdersCombined defaultTab="shipments" />;
    }

    return <BaseShipments isTabView={isTabView} />;
};

export const Shipments = ShipmentsPage;
