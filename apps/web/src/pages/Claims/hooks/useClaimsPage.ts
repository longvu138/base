import { Form } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useClaimsLogic 
} from '@repo/hooks';

/**
 * Điều phối (Orchestration) đặc thù cho trang Khiếu nại trên Web
 */
export const useClaimsPage = () => {
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useClaimsLogic({ page, pageSize, filters });

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
