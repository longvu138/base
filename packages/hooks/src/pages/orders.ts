import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { App, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@repo/i18n';
import {
    useExportOrdersMutation,
    useListOrderQuery,
    useOrdersInfiniteQuery,
    useOrderStatusesQuery,
    useOrderStatisticQuery,
    useOrderServicesQuery,
    useMarketplacesQuery,
    useUpdateOrderNoteMutation
} from '../useOrderHooks';
import { useCustomerProfile } from '../useCustomerHooks';
import { useFilterWithURL } from '../useFilterWithURL';

export interface UseOrdersLogicProps {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

const MOBILE_PAGE_SIZE = 25;

export const normalizeOrderFilters = (values: Record<string, any>) => {
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

    if (
        next.typeSearch === 'equal' &&
        next.handlingTimeFrom !== undefined &&
        next.handlingTimeFrom !== null &&
        next.handlingTimeFrom !== ''
    ) {
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

export const buildOrderApiParams = ({
    page,
    pageSize,
    filters,
}: {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}) => {
    const params: Record<string, any> = {
        page: page - 1,
        size: pageSize,
        sort: 'createdAt:desc',
        ...filters,
    };

    ['statuses', 'marketplaces', 'services'].forEach((key) => {
        if (Array.isArray(params[key])) {
            params[key] = params[key].join(',');
        }
    });

    return params;
};

const downloadOrdersBlob = (response: any) => {
    const disposition = response.headers?.['content-disposition'] || '';
    const fileName =
        disposition.split('filename=')[1]?.replaceAll('"', '') ||
        `orders_${Date.now()}.xlsx`;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', decodeURIComponent(fileName));
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const getExportErrorTitle = async (error: any) => {
    const data = error?.response?.data;
    if (data instanceof Blob) {
        try {
            const text = await data.text();
            return JSON.parse(text)?.title;
        } catch {
            return '';
        }
    }
    return data?.title || error?.title;
};

/**
 * Logic dùng chung cho trang Danh sách Đơn hàng - có thể dùng cho cả Web và Mobile
 * Nó điều phối việc lấy dữ liệu và tạo state phái sinh.
 */
export const useOrdersLogic = ({ page, pageSize, filters }: UseOrdersLogicProps) => {
    // 1. Định dạng tham số cho API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            ...buildOrderApiParams({ page, pageSize, filters }),
        };

        return params;
    }, [page, pageSize, filters]);

    // 2. Lấy dữ liệu
    const { data: orderData, isLoading: isOrderLoading } = useListOrderQuery(apiParams);
    const { data: statusData } = useOrderStatusesQuery();
    const { data: statisticData } = useOrderStatisticQuery();
    const { data: servicesData } = useOrderServicesQuery();
    const { data: marketplacesData } = useMarketplacesQuery();
    const updateOrderNote = useUpdateOrderNoteMutation();

    // 3. State phái sinh: Các tùy chọn trạng thái kèm số lượng
    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((s: any) => {
            const statistic = statisticData?.find((item: any) => item.status === s.code);
            const count = statistic ? statistic.total : '0';
            return {
                label: s.name,
                value: s.code,
                count
            };
        });
    }, [statusData, statisticData]);

    const deliveryReadyCount = useMemo(() => {
        const statistic =
            statisticData?.find((item: any) => item.status === 'DELIVERY_READY') ||
            statisticData?.find((item: any) => item.status === 'READY_FOR_DELIVERY');
        return Number(statistic?.total || 0);
    }, [statisticData]);

    return {
        orderData,
        isOrderLoading,
        isOrdersLoading: isOrderLoading, // alias cho StyleGobiz
        statusData,
        statisticData,
        servicesData,
        marketplacesData,
        statusOptions,
        deliveryReadyCount,
        apiParams,
        updateOrderNote
    };
};

export const useOrdersMobilePage = () => {
    const { t } = useTranslation();
    const { notification } = App.useApp();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const pageSize = MOBILE_PAGE_SIZE;
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
    const filterSignature = JSON.stringify(filters);

    useEffect(() => {
        form.resetFields();
        form.setFieldsValue(filters);
    }, [filterSignature, form]);

    const apiParams = useMemo(
        () => buildOrderApiParams({ page: 1, pageSize, filters }),
        [filterSignature, filters, pageSize],
    );

    const infiniteQuery = useOrdersInfiniteQuery(apiParams);
    const { data: statusData } = useOrderStatusesQuery();
    const { data: statisticData } = useOrderStatisticQuery();
    const { data: servicesData } = useOrderServicesQuery();
    const { data: marketplacesData } = useMarketplacesQuery();
    const updateOrderNote = useUpdateOrderNoteMutation();
    const { data: profile } = useCustomerProfile();
    const exportMutation = useExportOrdersMutation();
    const pages = infiniteQuery.data?.pages || [];
    const rows = pages.flatMap((page) => page.data || []);
    const firstPage = pages[0];

    const statusOptions = useMemo(() => {
        if (!statusData) return [];
        return statusData.map((status: any) => {
            const statistic = statisticData?.find((item: any) => item.status === status.code);
            return {
                label: status.name,
                value: status.code,
                count: statistic ? statistic.total : '0',
            };
        });
    }, [statusData, statisticData]);

    const deliveryReadyCount = useMemo(() => {
        const statistic =
            statisticData?.find((item: any) => item.status === 'DELIVERY_READY') ||
            statisticData?.find((item: any) => item.status === 'READY_FOR_DELIVERY');
        return Number(statistic?.total || 0);
    }, [statisticData]);

    const applyOrderFilters = (values: Record<string, any>) => {
        applyFilters(normalizeOrderFilters(values));
    };

    const handleSearch = () => {
        applyOrderFilters(form.getFieldsValue(true));
    };

    const handleReset = () => {
        clearFilters();
    };

    const handleExport = async (secret: string) => {
        if (!secret) {
            notification.error({ message: t('cartCheckout.incorrect_pin') });
            return;
        }

        try {
            const response = await exportMutation.mutateAsync({
                params: {
                    ...apiParams,
                    refCustomerCode: profile?.username || '',
                },
                secret,
            });
            downloadOrdersBlob(response);
        } catch (error: any) {
            const title = await getExportErrorTitle(error);
            notification.error({
                message:
                    title === 'invalid_pin' || title === 'invalid_password'
                        ? t('cartCheckout.incorrect_pin')
                        : t('shipments.export_error') || 'Lỗi xuất file',
            });
        }
    };

    return {
        t,
        form,
        filters,
        applyFilters: applyOrderFilters,
        handleSearch,
        handleReset,
        orderData: {
            data: rows,
            total: firstPage?.total || 0,
            pageSize: firstPage?.pageSize || pageSize,
            current: firstPage?.current || 0,
            totalPage: firstPage?.totalPage || 0,
        },
        isOrderLoading: infiniteQuery.isLoading,
        isOrdersLoading: infiniteQuery.isLoading,
        isFetchingNextPage: infiniteQuery.isFetchingNextPage,
        hasNextPage: infiniteQuery.hasNextPage,
        fetchNextPage: infiniteQuery.fetchNextPage,
        statusData,
        statisticData,
        servicesData,
        marketplacesData,
        statusOptions,
        deliveryReadyCount,
        apiParams,
        updateOrderNote,
        navigateToDetail: (code: string) => navigate(`/orders/${code}`),
        navigateToCreateDelivery: () => navigate('/delivery/create'),
        handleExport,
        exportMutation,
    };
};
