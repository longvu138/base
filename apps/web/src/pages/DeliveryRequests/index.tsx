import React from 'react';
import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../../components/Common/DynamicVariant';

export const DeliveryRequests = () => {
    // Lấy tên style từ cấu hình Tenant (Ví dụ: 'DeliveryRequestsStyle1', 'DeliveryRequestsStyle3')
    const variant = useVariant('deliveryRequests');

    // Quét tất cả file .tsx trong thư mục này để load động
    const modules = import.meta.glob('./*.tsx');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="DeliveryRequestsStyle1"
            featureName="DeliveryRequests"
        />
    );
};
