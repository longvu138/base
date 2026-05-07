import { Form } from 'antd';
import { usePaginationWithURL, useFilterWithURL, useClaimsLogic } from '@repo/hooks';
import { useTranslation } from '@repo/i18n';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

// Stable reference
const modules = import.meta.glob('./*.tsx');

export const ClaimsPage = () => {
    useTranslation();
    const [form] = Form.useForm();
    const variant = useVariant('claims');

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useClaimsLogic({ page, pageSize, filters });

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold mb-0">Khiếu nại</h1>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>

                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="ClaimsStyle3"
                    featureName="Claims"
                    componentProps={{
                        listData: logic.listData,
                        isLoading: logic.isClaimsLoading,
                        statusData: logic.statusData,
                        solutionData: logic.solutionData,
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

export default ClaimsPage;
