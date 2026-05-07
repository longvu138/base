import { usePaginationWithURL, useFilterWithURL, useVouchersLogic } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

const modules = import.meta.glob('./*.tsx');

const VouchersPage = () => {
    const variant = useVariant('vouchers');
    const { page, pageSize } = usePaginationWithURL();
    const { filters } = useFilterWithURL({ form: undefined as any });
    const { vouchersData, isVouchersLoading } = useVouchersLogic({ page, pageSize, filters });

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Mã giảm giá</h1>
                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="VouchersStyle1"
                    featureName="Vouchers"
                    componentProps={{ 
                        vouchers: vouchersData?.data, 
                        isLoading: isVouchersLoading 
                    }}
                />
            </div>
        </div>
    );
};

export default VouchersPage;
