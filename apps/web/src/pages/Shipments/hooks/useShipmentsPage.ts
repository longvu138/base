import { Form } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useShipmentsLogic 
} from '@repo/hooks';
import { useTranslation } from '@repo/i18n';

/**
 * Web-specific orchestration for Shipments Page
 * - Syncs state with URL
 * - Handles Ant Design Form
 */
export const useShipmentsPage = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    // Use the shared logic from @repo/hooks
    const logic = useShipmentsLogic({ page, pageSize, filters });

    const handleSearch = () => {
        const values = form.getFieldsValue();
        applyFilters(values);
    };

    const handleReset = () => {
        clearFilters();
    };

    return {
        t,
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        ...logic,
        handleSearch,
        handleReset,
        filters,
        applyFilters,
        clearFilters
    };
};
