import { Form } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useWithdrawalSlipsLogic 
} from '@repo/hooks';

/**
 * Điều phối (Orchestration) đặc thù cho trang Phiếu rút tiền trên Web
 */
export const useWithdrawalSlipsPage = () => {
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useWithdrawalSlipsLogic({ page, pageSize, filters });

    const handleSearch = () => {
        applyFilters(form.getFieldsValue());
    };

    const handleReset = () => {
        clearFilters();
    };

    return {
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        filters,
        ...logic,
        handleSearch,
        handleReset,
        applyFilters
    };
};

