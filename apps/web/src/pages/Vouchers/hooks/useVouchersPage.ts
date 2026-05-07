import { useState } from 'react';
import { Form, message } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useVouchersLogic 
} from '@repo/hooks';

/**
 * Orchestration hook for Vouchers Page on Web
 */
export const useVouchersPage = () => {
    const [form] = Form.useForm();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useVouchersLogic({ page, pageSize, filters });

    const handleSearch = () => {
        applyFilters(form.getFieldsValue());
    };

    const handleReset = () => {
        clearFilters();
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code);
            message.success('Đã sao chép mã!');
            setTimeout(() => setCopiedCode(null), 2000);
        });
    };

    return {
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        filters,
        applyFilters,
        copiedCode,
        ...logic,
        handleSearch,
        handleReset,
        handleCopy
    };
};
