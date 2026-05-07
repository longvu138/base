import { Form } from 'antd';
import { usePaginationWithURL, useFilterWithURL, useDeliveryRequestsLogic } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

const modules = import.meta.glob('./*.tsx');

const DeliveryRequestsPage = () => {
    const [form] = Form.useForm();
    const variant = useVariant('delivery-requests');

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useDeliveryRequestsLogic({ page, pageSize, filters });

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold mb-0">Yêu cầu giao hàng</h1>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>

                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="DeliveryRequestsStyle1"
                    featureName="DeliveryRequests"
                    componentProps={{
                        data: logic.listData,
                        isLoading: logic.isDeliveryRequestsLoading,
                        statusData: logic.statusData,
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

export default DeliveryRequestsPage;
