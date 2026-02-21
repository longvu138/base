import React from 'react';
import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../Common/DynamicVariant';

/**
 * Layout Factory - Trái tim của kiến trúc Layout đa Tenant
 * Tự động chọn Layout (VerticalLayout, SpecializedLayout, ...) dựa trên cấu hình từ API
 */
const Layout: React.FC = () => {
    // Lấy tên Layout từ cấu hình Tenant (Mặc định là VerticalLayout)
    const layoutName = useVariant('layout');

    // Quét tất cả file .tsx trong thư mục này để load động
    const modules = import.meta.glob('./*.tsx');

    return (
        <DynamicVariant
            variantName={layoutName}
            modules={modules}
            fallbackName="VerticalLayout"
            featureName="Layout"
        />
    );
};

export default Layout;
