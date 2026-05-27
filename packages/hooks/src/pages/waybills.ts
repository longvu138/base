import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Form, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@repo/i18n';
import {
    useCreateWaybillsMutation,
    useDeleteWaybillMutation,
    useExportWaybillsMutation,
    useUpdateWaybillMutation,
    useWaybillsInfiniteQuery,
    useWaybillsQuery,
    useWaybillStatusesQuery,
} from '../useWaybillHooks';
import { useFilterWithURL } from '../useFilterWithURL';
import { usePaginationWithURL } from '../usePaginationWithURL';

export interface UseWaybillsLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

const splitWaybillCodes = (value: string) =>
    value
        .trim()
        .split(/[^A-Za-z0-9]/)
        .map((item) => item.trim())
        .filter(Boolean);

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

const normalizeWaybillFilters = (values: Record<string, any>) => {
    const next = { ...values };

    if (next.receivedTimeRange) {
        next.receivedTimeFrom = next.receivedTimeRange[0]?.toISOString();
        next.receivedTimeTo = next.receivedTimeRange[1]?.toISOString();
        delete next.receivedTimeRange;
    }
    if (dayjs.isDayjs(next.receivedTimeFrom)) {
        next.receivedTimeFrom = next.receivedTimeFrom.startOf('day').toISOString();
    }
    if (dayjs.isDayjs(next.receivedTimeTo)) {
        next.receivedTimeTo = next.receivedTimeTo.endOf('day').toISOString();
    }
    if (Array.isArray(next.statuses) && next.statuses.length === 0) {
        delete next.statuses;
    }

    return next;
};

const buildWaybillParams = (page: number, pageSize: number, filters: Record<string, any>) => {
    const params: Record<string, any> = {
        page: page - 1,
        size: pageSize,
        sort: 'createdAt:desc',
        ...normalizeWaybillFilters(filters),
    };

    if (Array.isArray(params.statuses)) {
        params.statuses = params.statuses.join(',');
    }

    return params;
};

export const useWaybillsLogic = ({ page, pageSize, filters }: UseWaybillsLogicProps) => {
    const apiParams = useMemo(
        () => buildWaybillParams(page, pageSize, filters),
        [page, pageSize, filters],
    );

    const { data: listData, isLoading: isWaybillLoading } = useWaybillsQuery(apiParams);
    const { data: statusData } = useWaybillStatusesQuery();

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => ({ label: s.name, value: s.code }));
    }, [statusData]);

    return {
        listData,
        isWaybillLoading,
        isWaybillsLoading: isWaybillLoading,
        statusData,
        statusOptions,
        apiParams,
    };
};

export const useWaybillsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [createOpen, setCreateOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [deletingCode, setDeletingCode] = useState<string>();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 25,
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
    const logic = useWaybillsLogic({ page, pageSize, filters });
    const createMutation = useCreateWaybillsMutation();
    const updateMutation = useUpdateWaybillMutation();
    const deleteMutation = useDeleteWaybillMutation();
    const exportMutation = useExportWaybillsMutation();
    const filterSignature = JSON.stringify(filters);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(filters);
    }, [filterSignature, form, filters]);

    const handleSearch = () => {
        applyFilters(normalizeWaybillFilters(form.getFieldsValue(true)));
    };

    const handleReset = () => {
        clearFilters();
    };

    const syncFiltersToForm = () => {
        form.resetFields();
        form.setFieldsValue(filters);
    };

    const handleCreateOpen = () => {
        createForm.resetFields();
        setCreateOpen(true);
    };

    const handleCreate = async () => {
        const values = await createForm.validateFields();
        const waybillNumbers = splitWaybillCodes(values.waybillNumbers || '');

        if (waybillNumbers.length === 0) {
            createForm.setFields([
                { name: 'waybillNumbers', errors: ['Vui lòng nhập mã vận đơn'] },
            ]);
            return;
        }
        if (waybillNumbers.length > 30) {
            createForm.setFields([
                { name: 'waybillNumbers', errors: ['Tối đa 30 mã vận đơn mỗi lần'] },
            ]);
            return;
        }

        await createMutation.mutateAsync({
            waybillNumbers,
            description: values.description,
        });
        setCreateOpen(false);
    };

    const handleDescriptionChange = (record: any, description: string) => {
        if (!record?.id || record.description === description) return;
        if (description && description.length > 255) {
            notification.error({ message: 'Ghi chú không được vượt quá 255 ký tự' });
            return;
        }
        updateMutation.mutate({ id: record.id, data: { description } });
    };

    const handleDelete = async (code: string) => {
        setDeletingCode(code);
        try {
            await deleteMutation.mutateAsync(code);
        } finally {
            setDeletingCode(undefined);
        }
    };

    const handleExportOpen = () => {
        const start = filters.receivedTimeFrom ? dayjs(filters.receivedTimeFrom) : null;
        const end = filters.receivedTimeTo ? dayjs(filters.receivedTimeTo) : null;

        if (!start || !end || start.add(3, 'month').isBefore(end.startOf('day'))) {
            notification.error({
                message: 'Vui lòng chọn tìm kiếm thời gian trong khoảng 3 tháng để xuất file',
            });
            return;
        }

        setExportOpen(true);
    };

    const handleExport = async (secret: string) => {
        const res = await exportMutation.mutateAsync({
            params: logic.apiParams,
            secret,
        });
        downloadBlob(
            res.data,
            getExportFilename(res.headers) || `waybills-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`,
        );
        setExportOpen(false);
    };

    const selectedStatuses = useMemo(() => {
        const statusValue = filters.statuses;
        return Array.isArray(statusValue)
            ? statusValue
            : statusValue
              ? [statusValue]
              : [];
    }, [filters.statuses]);

    return {
        t,
        form,
        createForm,
        page,
        pageSize,
        setPage,
        setPageSize,
        filters,
        selectedStatuses,
        createOpen,
        exportOpen,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        deletingCode,
        isExporting: exportMutation.isPending,
        ...logic,
        handleSearch,
        handleReset,
        syncFiltersToForm,
        handleCreateOpen,
        handleCreate,
        setCreateOpen,
        setExportOpen,
        handleExportOpen,
        handleDescriptionChange,
        handleDelete,
        handleExport,
        navigateToShipment: (code: string) => navigate(`/shipments/${code}`),
    };
};

export const useWaybillsMobilePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [createOpen, setCreateOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [deletingCode, setDeletingCode] = useState<string>();
    const pageSize = 25;

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
    const { data: statusData } = useWaybillStatusesQuery();
    const createMutation = useCreateWaybillsMutation();
    const updateMutation = useUpdateWaybillMutation();
    const deleteMutation = useDeleteWaybillMutation();
    const exportMutation = useExportWaybillsMutation();
    const filterSignature = JSON.stringify(filters);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(filters);
    }, [filterSignature, form, filters]);

    const apiParams = useMemo(
        () => buildWaybillParams(1, pageSize, filters),
        [filterSignature, filters],
    );

    const infiniteQuery = useWaybillsInfiniteQuery(apiParams);
    const pages = infiniteQuery.data?.pages || [];
    const rows = pages.flatMap((page) => page.data || []);
    const firstPage = pages[0];

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => ({ label: s.name, value: s.code }));
    }, [statusData]);

    const handleSearch = () => {
        applyFilters(normalizeWaybillFilters(form.getFieldsValue(true)));
    };

    const handleReset = () => {
        clearFilters();
    };

    const syncFiltersToForm = () => {
        form.resetFields();
        form.setFieldsValue(filters);
    };

    const handleCreateOpen = () => {
        createForm.resetFields();
        setCreateOpen(true);
    };

    const handleCreate = async () => {
        const values = await createForm.validateFields();
        const waybillNumbers = splitWaybillCodes(values.waybillNumbers || '');

        if (waybillNumbers.length === 0) {
            createForm.setFields([
                { name: 'waybillNumbers', errors: ['Vui lòng nhập mã vận đơn'] },
            ]);
            return;
        }
        if (waybillNumbers.length > 30) {
            createForm.setFields([
                { name: 'waybillNumbers', errors: ['Tối đa 30 mã vận đơn mỗi lần'] },
            ]);
            return;
        }

        await createMutation.mutateAsync({
            waybillNumbers,
            description: values.description,
        });
        setCreateOpen(false);
    };

    const handleDescriptionChange = (record: any, description: string) => {
        if (!record?.id || record.description === description) return;
        if (description && description.length > 255) {
            notification.error({ message: 'Ghi chú không được vượt quá 255 ký tự' });
            return;
        }
        updateMutation.mutate({ id: record.id, data: { description } });
    };

    const handleDelete = async (code: string) => {
        setDeletingCode(code);
        try {
            await deleteMutation.mutateAsync(code);
        } finally {
            setDeletingCode(undefined);
        }
    };

    const handleExportOpen = () => {
        const start = filters.receivedTimeFrom ? dayjs(filters.receivedTimeFrom) : null;
        const end = filters.receivedTimeTo ? dayjs(filters.receivedTimeTo) : null;

        if (!start || !end || start.add(3, 'month').isBefore(end.startOf('day'))) {
            notification.error({
                message: 'Vui lòng chọn tìm kiếm thời gian trong khoảng 3 tháng để xuất file',
            });
            return;
        }

        setExportOpen(true);
    };

    const handleExport = async (secret: string) => {
        const res = await exportMutation.mutateAsync({
            params: apiParams,
            secret,
        });
        downloadBlob(
            res.data,
            getExportFilename(res.headers) || `waybills-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`,
        );
        setExportOpen(false);
    };

    const selectedStatuses = useMemo(() => {
        const statusValue = filters.statuses;
        return Array.isArray(statusValue)
            ? statusValue
            : statusValue
              ? [statusValue]
              : [];
    }, [filters.statuses]);

    return {
        t,
        form,
        createForm,
        page: 1,
        pageSize,
        setPage: () => undefined,
        setPageSize: () => undefined,
        filters,
        selectedStatuses,
        createOpen,
        exportOpen,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        deletingCode,
        isExporting: exportMutation.isPending,
        listData: {
            data: rows,
            total: firstPage?.total || 0,
            pageSize: firstPage?.pageSize || pageSize,
            current: firstPage?.current || 0,
            totalPage: firstPage?.totalPage || 0,
        },
        isWaybillLoading: infiniteQuery.isLoading,
        isWaybillsLoading: infiniteQuery.isLoading,
        isFetchingNextPage: infiniteQuery.isFetchingNextPage,
        hasNextPage: infiniteQuery.hasNextPage,
        fetchNextPage: infiniteQuery.fetchNextPage,
        statusData,
        statusOptions,
        apiParams,
        handleSearch,
        handleReset,
        syncFiltersToForm,
        handleCreateOpen,
        handleCreate,
        setCreateOpen,
        setExportOpen,
        handleExportOpen,
        handleDescriptionChange,
        handleDelete,
        handleExport,
        navigateToShipment: (code: string) => navigate(`/shipments/${code}`),
    };
};
