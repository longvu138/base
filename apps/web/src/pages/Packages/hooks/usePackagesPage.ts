import { useEffect, useState } from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { 
    useExportPackagesMutation,
    useFilterWithURL, 
    usePaginationWithURL,
    usePackagesLogic 
} from '@repo/hooks';
import { useTranslation } from '@repo/i18n';

const getExportFilename = (headers: Record<string, any>) => {
    const disposition = headers?.['content-disposition'] || '';
    const matched = /filename\*?=(?:UTF-8'')?("?)([^";]+)\1/i.exec(disposition);
    return matched?.[2] ? decodeURIComponent(matched[2]) : undefined;
};

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Điều phối (Orchestration) đặc thù cho trang Kiện hàng trên Web
 */
export const usePackagesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [exportOpen, setExportOpen] = useState(false);

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    // Sử dụng logic nghiệp vụ dùng chung từ @repo/hooks
    const logic = usePackagesLogic({ page, pageSize, filters });
    const exportMutation = useExportPackagesMutation();
    const filterSignature = JSON.stringify(filters);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterSignature, form]);

    const normalizeFilters = (values: Record<string, any>) => {
        const next = { ...values };

        if (dayjs.isDayjs(next.createdFrom)) {
            next.createdFrom = next.createdFrom.startOf('day').toISOString();
        }
        if (dayjs.isDayjs(next.createdTo)) {
            next.createdTo = next.createdTo.endOf('day').toISOString();
        }
        if (Array.isArray(next.statuses) && next.statuses.length === 0) {
            delete next.statuses;
        }

        if (next.typeSearch === 'equal' && next.handlingTimeFrom !== undefined && next.handlingTimeFrom !== null && next.handlingTimeFrom !== '') {
            next.handlingTimeTo = next.handlingTimeFrom;
        }

        return next;
    };

    const handleSearch = () => {
        applyFilters(normalizeFilters(form.getFieldsValue(true)));
    };

    const handleReset = () => {
        clearFilters();
    };

    const handleExport = async (secret: string) => {
        const res = await exportMutation.mutateAsync({
            params: logic.apiParams,
            secret,
        });
        downloadBlob(
            res.data,
            getExportFilename(res.headers) || `packages-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`,
        );
        setExportOpen(false);
    };

    const navigateToOrder = (record: any) => {
        const code = record?.orderCode;
        if (!code) return;
        navigate(record?.isShipment ? `/shipments/${code}` : `/orders/${code}`);
    };

    return {
        t,
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        filters,
        exportOpen,
        isExporting: exportMutation.isPending,
        ...logic,
        handleSearch,
        handleReset,
        handleExport,
        setExportOpen,
        handleExportOpen: () => setExportOpen(true),
        navigateToOrder,
        applyFilters,
        normalizeFilters
    };
};
