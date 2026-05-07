import { Form } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useFaqsLogic 
} from '@repo/hooks';

/**
 * Orchestration hook for FAQs Page on Web
 */
export const useFaqsPage = () => {
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useFaqsLogic({ page, pageSize, filters });

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
        applyFilters,
        ...logic,
        handleSearch,
        handleReset
    };
};
