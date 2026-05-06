import { Form } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useDeliveryNotesLogic 
} from '@repo/hooks';

/**
 * Điều phối (Orchestration) đặc thù cho trang Phiếu giao hàng trên Web
 */
export const useDeliveryNotesPage = () => {
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    const logic = useDeliveryNotesLogic({ page, pageSize, filters });

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

