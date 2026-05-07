import { Form } from 'antd';
import { usePaginationWithURL, useFilterWithURL, useDeliveryNotesLogic } from '@repo/hooks';
import { useTranslation } from '@repo/i18n';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

// Stable reference
const modules = import.meta.glob('./*.tsx');

export const DeliveryNotesPage = () => {
    useTranslation();
    const [form] = Form.useForm();
    const variant = useVariant('deliveryNotes');

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useDeliveryNotesLogic({ page, pageSize, filters });

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold mb-0">Phiếu giao hàng</h1>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>

                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="DeliveryNoteStyle3"
                    featureName="DeliveryNotes"
                    componentProps={{
                        listData: logic.listData,
                        isLoading: logic.isDeliveryNotesLoading,
                        page,
                        pageSize,
                        setPage,
                        setPageSize,
                        form,
                        applyFilters,
                        handleReset: clearFilters,
                        filters
                    }}
                />
            </div>
        </div>
    );
};

export default DeliveryNotesPage;
