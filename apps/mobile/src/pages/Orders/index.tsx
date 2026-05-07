import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';
import { useOrdersMobile } from './hooks/useOrdersMobile';

// Stable reference for glob
const modules = import.meta.glob('./*.tsx');

export const OrdersPage = () => {
    const variant = useVariant('orders');
    const ordersLogic = useOrdersMobile();

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold mb-0">{ordersLogic.t('orders.title')}</h1>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>

                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="OrdersStyle1"
                    featureName="Orders"
                    componentProps={{
                        data: ordersLogic.orderData,
                        isLoading: ordersLogic.isLoading,
                        statuses: ordersLogic.statusData,
                        page: ordersLogic.page,
                        pageSize: ordersLogic.pageSize,
                        setPage: ordersLogic.setPage,
                        setPageSize: ordersLogic.setPageSize,
                        form: ordersLogic.form,
                        applyFilters: ordersLogic.applyFilters,
                        handleReset: ordersLogic.clearFilters,
                        filters: ordersLogic.filters,
                        statusOptions: ordersLogic.statusOptions,
                        marketplacesData: ordersLogic.marketplacesData,
                        servicesData: ordersLogic.servicesData
                    }}
                />
            </div>
        </div>
    );
};

export default OrdersPage;
