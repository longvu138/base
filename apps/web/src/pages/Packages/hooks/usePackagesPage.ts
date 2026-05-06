import { Form } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    usePackagesLogic 
} from '@repo/hooks';
import { useTranslation } from '@repo/i18n';

/**
 * Điều phối (Orchestration) đặc thù cho trang Kiện hàng trên Web
 */
export const usePackagesPage = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    // Sử dụng logic nghiệp vụ dùng chung từ @repo/hooks
    const logic = usePackagesLogic({ page, pageSize, filters });

    const handleSearch = () => {
        applyFilters(form.getFieldsValue());
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
        filters,
        ...logic,
        handleSearch,
        handleReset,
        applyFilters
    };
};

