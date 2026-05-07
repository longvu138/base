import { Form } from 'antd';
import { usePaginationWithURL, useFilterWithURL, useTransactionsLogic } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

const modules = import.meta.glob('./*.tsx');

const TransactionsPage = () => {
    const [form] = Form.useForm();
    const variant = useVariant('transactions');

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useTransactionsLogic({ page, pageSize, filters });

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold mb-0">Giao dịch tài chính</h1>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>

                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="TransactionsStyle1"
                    featureName="Transactions"
                    componentProps={{
                        data: logic.transactionData,
                        isLoading: logic.isTransactionLoading,
                        typeData: logic.transactionTypeOptions,
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

export default TransactionsPage;
