import React, { Suspense, useMemo } from 'react';
import { Spin } from 'antd';

interface DynamicVariantProps {
    variantName: string;
    modules: Record<string, () => Promise<any>>;
    fallbackName: string;
    featureName: string; // Để log lỗi cho dễ debug
    componentProps?: any;
}

/**
 * Thành phần hỗ trợ Load giao diện động dựa trên cấu hình từ API
 */
export const DynamicVariant: React.FC<DynamicVariantProps> = ({
    variantName,
    modules,
    fallbackName,
    featureName,
    componentProps
}) => {
    const Component = useMemo(() => {
        // Tìm file tương ứng trong danh sách glob modules
        const importFn = modules[`./${variantName}.tsx`];

        if (!importFn) {
            console.warn(`[DynamicVariant] ${featureName}: Không tìm thấy file ./${variantName}.tsx. Đang dùng fallback: ${fallbackName}`);
            const fallbackFn = modules[`./${fallbackName}.tsx`];
            return React.lazy(async () => {
                const mod = await fallbackFn();
                return { default: mod.default || mod[fallbackName] };
            });
        }

        return React.lazy(async () => {
            const mod = await importFn();
            // Hỗ trợ cả export default và named export (const Name = ...)
            return { default: mod.default || mod[variantName] };
        });
    }, [variantName, modules, fallbackName, featureName]);

    return (
        <Suspense fallback={
            <div className="min-h-[400px] flex items-center justify-center">
                <Spin size="large" tip={`Đang tải giao diện ${featureName}...`} />
            </div>
        }>
            <Component {...componentProps} />
        </Suspense>
    );
};
