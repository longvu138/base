import { Form } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useWithdrawalSlipsLogic 
} from '@repo/hooks';

const WITHDRAWAL_SLIP_DATE_RANGE_PARAMS = {
    createdAtRange: { from: 'timestampFrom', to: 'timestampTo' },
};

/**
 * Điều phối (Orchestration) đặc thù cho trang Phiếu rút tiền trên Web
 */
export const useWithdrawalSlipsPage = () => {
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({
        form,
        dateRangeParamMap: WITHDRAWAL_SLIP_DATE_RANGE_PARAMS,
    });

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
