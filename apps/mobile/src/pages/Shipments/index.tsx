import { Form } from 'antd';
import { usePaginationWithURL, useFilterWithURL, useShipmentsLogic } from '@repo/hooks';
import { useTranslation } from '@repo/i18n';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

// Stable reference
const modules = import.meta.glob('./*.tsx');

export const ShipmentsPage = ({ isTabView = false }: { isTabView?: boolean }) => {
    useTranslation();
    const [form] = Form.useForm();
    const variant = useVariant('shipments');

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useShipmentsLogic({ page, pageSize, filters });

    const content = (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="ShipmentsStyle3"
            featureName="Shipments"
            componentProps={{
                data: logic.shipmentData,
                isLoading: logic.isShipmentLoading,
                statusData: logic.statusData,
                statusOptions: logic.statusOptions,
                servicesData: logic.servicesData,
                page,
                pageSize,
                setPage,
                setPageSize,
                form,
                applyFilters,
                handleReset: clearFilters,
                filters,
                isTabView
            }}
        />
    );

    if (isTabView) {
        return content;
    }

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold mb-0">Ký gửi</h1>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>
                {content}
            </div>
        </div>
    );
};

export default ShipmentsPage;
