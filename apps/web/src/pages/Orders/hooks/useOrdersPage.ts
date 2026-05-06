import { useNavigate } from 'react-router-dom';
import { Form } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useOrdersLogic 
} from '@repo/hooks';
import { useTranslation } from '@repo/i18n';

/**
 * Điều phối (Orchestration) đặc thù cho trang Đơn hàng trên Web
 * - Đồng bộ trạng thái với URL
 * - Xử lý Form Ant Design
 */
export const useOrdersPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({
        form
    });

    // Use the shared logic from @repo/hooks
    const logic = useOrdersLogic({ page, pageSize, filters });

    const handleSearch = () => {
        const values = form.getFieldsValue();
        applyFilters(values);
    };

    const handleReset = () => {
        clearFilters();
    };

    const navigateToDetail = (code: string) => {
        navigate(`/orders/${code}`);
    };

    return {
        t,
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        filters,
        applyFilters,
        ...logic,
        handleSearch,
        handleReset,
        navigateToDetail
    };
};
