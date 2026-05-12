import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
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
    const [isAdvancedFilterOpen, setAdvancedFilterOpen] = useState(false);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({
        form
    });

    // Use the shared logic from @repo/hooks
    const logic = useOrdersLogic({ page, pageSize, filters });

    const normalizeOrderFilters = (values: Record<string, any>) => {
        const next = { ...values };
        delete next.dateRange;

        if (dayjs.isDayjs(next.timestampFrom)) {
            next.timestampFrom = next.timestampFrom.startOf('day').toISOString();
        }
        if (dayjs.isDayjs(next.timestampTo)) {
            next.timestampTo = next.timestampTo.endOf('day').toISOString();
        }
        if (dayjs.isDayjs(next.milestoneStatusFrom)) {
            next.milestoneStatusFrom = next.milestoneStatusFrom.startOf('day').toISOString();
        }
        if (dayjs.isDayjs(next.milestoneStatusTo)) {
            next.milestoneStatusTo = next.milestoneStatusTo.endOf('day').toISOString();
        }

        if (!next.milestoneStatusFrom || !next.milestoneStatusTo) {
            delete next.milestoneStatus;
            delete next.milestoneStatusFrom;
            delete next.milestoneStatusTo;
        }

        if (!next.handlingTimeFrom && !next.handlingTimeTo) {
            delete next.typeSearch;
            delete next.cutOffStatus;
            delete next.handlingTimeFrom;
            delete next.handlingTimeTo;
        }

        return next;
    };

    const applyOrderFilters = (values: Record<string, any>) => {
        applyFilters(normalizeOrderFilters(values));
    };

    const handleSearch = () => {
        const values = form.getFieldsValue();
        applyOrderFilters(values);
    };

    const handleReset = () => {
        clearFilters();
    };

    const navigateToDetail = (code: string) => {
        navigate(`/orders/${code}`);
    };

    const navigateToCreateDelivery = () => {
        navigate('/delivery/create');
    };

    const toggleAdvancedFilter = () => {
        setAdvancedFilterOpen(open => !open);
    };

    return {
        t,
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        filters,
        applyFilters: applyOrderFilters,
        ...logic,
        handleSearch,
        handleReset,
        navigateToDetail,
        navigateToCreateDelivery,
        isAdvancedFilterOpen,
        toggleAdvancedFilter
    };
};
