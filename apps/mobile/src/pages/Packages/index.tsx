import { Form } from 'antd';
import { usePaginationWithURL, useFilterWithURL, usePackagesLogic } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

// Stable reference
const modules = import.meta.glob('./*.tsx');

const PackagesPage = () => {
    const [form] = Form.useForm();
    const variant = useVariant('packages');

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = usePackagesLogic({ page, pageSize, filters });

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold mb-0">Kiện hàng</h1>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>

                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="PackagesStyle1"
                    featureName="Packages"
                    componentProps={{
                        data: logic.packageData,
                        isLoading: logic.isPackagesLoading,
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

export default PackagesPage;
