import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Form, App } from 'antd';
import dayjs from 'dayjs';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useOrdersLogic,
    useCustomerProfile,
    useExportOrdersMutation
} from '@repo/hooks';
import { useTranslation } from '@repo/i18n';

/**
 * Điều phối (Orchestration) đặc thù cho trang Đơn hàng trên Web
 * - Đồng bộ trạng thái với URL
 * - Xử lý Form Ant Design
 */
export const useOrdersPage = () => {
    const { t } = useTranslation();
    const { notification } = App.useApp();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [isAdvancedFilterOpen, setAdvancedFilterOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({
        form
    });
    const filterSignature = JSON.stringify(filters);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(filters);
    }, [filterSignature, form]);

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

        if (next.typeSearch === 'equal' && next.handlingTimeFrom !== undefined && next.handlingTimeFrom !== null && next.handlingTimeFrom !== '') {
            next.handlingTimeTo = next.handlingTimeFrom;
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
        const values = form.getFieldsValue(true);
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

    const { data: profile } = useCustomerProfile();
    const exportMutation = useExportOrdersMutation();

    const closeExportModal = () => {
        setExportOpen(false);
    };

    const handleExport = async (secret: string) => {
        if (!secret) {
            notification.error({ message: t("cartCheckout.incorrect_pin") });
            return;
        }

        try {
            const username = profile?.username || "";
            const response = await exportMutation.mutateAsync({
                params: {
                    ...logic.apiParams,
                    refCustomerCode: username,
                },
                secret,
            });

            // download blob
            const disposition = response.headers?.["content-disposition"] || "";
            const fileName =
                disposition.split("filename=")[1]?.replaceAll('"', "") || `orders_${Date.now()}.xlsx`;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", decodeURIComponent(fileName));
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setExportOpen(false);
        } catch (error: any) {
            const data = error?.response?.data;
            let title = "";
            if (data instanceof Blob) {
                try {
                    const text = await data.text();
                    title = JSON.parse(text)?.title;
                } catch {
                    title = "";
                }
            } else {
                title = data?.title || error?.title;
            }
            notification.error({
                message:
                    title === "invalid_pin" || title === "invalid_password"
                        ? t("cartCheckout.incorrect_pin")
                        : t("shipments.export_error") || "Lỗi xuất file"
            });
        }
    };

    const syncFiltersToForm = () => {
        form.resetFields();
        form.setFieldsValue(filters);
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
        syncFiltersToForm,
        navigateToDetail,
        navigateToCreateDelivery,
        isAdvancedFilterOpen,
        toggleAdvancedFilter,
        exportOpen,
        setExportOpen,
        handleExport,
        closeExportModal,
        exportMutation
    };
};
