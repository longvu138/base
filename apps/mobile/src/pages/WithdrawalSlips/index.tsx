import { Form } from 'antd';
import { usePaginationWithURL, useFilterWithURL, useWithdrawalSlipsLogic } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

const modules = import.meta.glob('./*.tsx');

const WithdrawalSlipsPage = () => {
    const [form] = Form.useForm();
    const variant = useVariant('withdrawal-slips');

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useWithdrawalSlipsLogic({ page, pageSize, filters });

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Phiếu rút tiền</h1>
                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="WithdrawalSlipsStyle1"
                    featureName="WithdrawalSlips"
                    componentProps={{
                        data: logic.listData,
                        isLoading: logic.isWithdrawalSlipsLoading,
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

export default WithdrawalSlipsPage;
