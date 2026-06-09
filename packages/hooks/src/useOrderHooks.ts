import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { CategoryApi, OrderApi } from "@repo/api";
import { notification } from "antd";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useListOrderQuery = (params: any) => {
  return useQuery({
    queryKey: ["orders.list", params],
    queryFn: async () => {
      const res = await OrderApi.getOrders(params);
      return {
        data: res.data,
        total: parseInt(res.headers["x-total-count"] || "0", 10),
        pageSize: parseInt(res.headers["x-page-size"] || "0", 10),
        current: parseInt(res.headers["x-page-number"] || "0", 10),
        totalPage: parseInt(res.headers["x-page-count"] || "0", 10),
      };
    },
    enabled: !!params,
  });
};

const normalizeOrderListResponse = (res: any, pageParam = 0, fallbackSize = 20) => ({
  data: Array.isArray(res.data) ? res.data : [],
  total: parseInt(res.headers["x-total-count"] || "0", 10),
  pageSize: parseInt(res.headers["x-page-size"] || String(fallbackSize), 10),
  current: parseInt(res.headers["x-page-number"] || String(pageParam), 10),
  totalPage: parseInt(res.headers["x-page-count"] || "0", 10),
});

export const useOrdersInfiniteQuery = (params: any) => {
  return useInfiniteQuery({
    queryKey: ["orders.list.infinite", params],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await OrderApi.getOrders({
        ...params,
        page: Number(pageParam),
      });
      return normalizeOrderListResponse(res, Number(pageParam), params?.size || 25);
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
      if (!lastPage.data.length) return undefined;
      if (lastPage.total && loaded >= lastPage.total) return undefined;
      if (lastPage.totalPage && lastPage.current + 1 >= lastPage.totalPage) return undefined;
      if (lastPage.pageSize && lastPage.data.length < lastPage.pageSize) return undefined;
      return lastPage.current + 1;
    },
    enabled: !!params,
  });
};

export const useOrderStatusesQuery = () => {
  return useQuery({
    queryKey: ["orders.statuses"],
    queryFn: async () => {
      const res = await OrderApi.getOrderStatuses();
      return res.data;
    },
  });
};

export const useOrderStatisticQuery = () => {
  return useQuery({
    queryKey: ["orders.statistic"],
    queryFn: async () => {
      const res = await OrderApi.getOrderStatistic();
      return res.data;
    },
  });
};

export const useWarehouseQuery = (delivered: boolean) => {
  return useQuery({
    queryKey: ["orders.warehouses", delivered],
    queryFn: async () => {
      const res = await OrderApi.getWarehouse(delivered);
      return res.data;
    },
  });
};

export const useOrderServicesQuery = () => {
  return useQuery({
    queryKey: ["orders.services"],
    queryFn: async () => {
      const res = await OrderApi.getOrderServices();
      return res.data;
    },
  });
};

export const useMarketplacesQuery = () => {
  return useQuery({
    queryKey: ["orders.marketplaces"],
    queryFn: async () => {
      const res = await OrderApi.getMarketplaces();
      return res.data;
    },
  });
};

export const useOrderDetailQuery = (code: string) => {
  return useQuery({
    queryKey: ["orders.detail", code],
    queryFn: async () => {
      const res = await OrderApi.getOrderDetail(code);
      return res.data;
    },
    enabled: !!code,
  });
};

export const useOrderCommentsQuery = (code: string) => {
  return useQuery({
    queryKey: ["orders.comments", code],
    queryFn: async () => {
      const res = await OrderApi.getOrderComments(code);
      return res.data ?? [];
    },
    enabled: !!code,
    refetchInterval: 15000, // auto-refresh mỗi 15s
  });
};

export const useCreateOrderCommentMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      OrderApi.createOrderComment(code, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders.comments", code] });
    },
  });
};

export const useUpdateOrderNoteMutation = () => {
  const queryClient = useQueryClient();
  const ordersListQueryFilter = {
    predicate: (query: any) =>
      String(query.queryKey?.[0] || "").startsWith("orders.list"),
  };
  const updateOrderNoteInCache = (old: any, newOrder: { code: string; note: string }) => {
    if (!old) return old;

    const updateItem = (item: any) =>
      item?.code === newOrder.code ? { ...item, note: newOrder.note } : item;

    if (Array.isArray(old.data)) {
      return {
        ...old,
        data: old.data.map(updateItem),
      };
    }

    if (Array.isArray(old.pages)) {
      return {
        ...old,
        pages: old.pages.map((page: any) =>
          page && Array.isArray(page.data)
            ? { ...page, data: page.data.map(updateItem) }
            : page,
        ),
      };
    }

    return old;
  };

  return useMutation({
    mutationFn: ({ code, note }: { code: string; note: string }) =>
      OrderApi.patchOrder(code, { note }),
    onMutate: async (newOrder) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(ordersListQueryFilter);

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData(ordersListQueryFilter);

      // Optimistically update to the new value in all matching queries
      queryClient.setQueriesData(ordersListQueryFilter, (old: any) =>
        updateOrderNoteInCache(old, newOrder),
      );

      // Return a context object with the snapshotted value
      return { previousQueries };
    },
    onError: (_err, _newOrder, context: any) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, value]: any) => {
          queryClient.setQueryData(queryKey, value);
        });
      }
    },
    onSuccess: (_, variables) => {
      notification.success({
        message: "Cập nhật thành công",
        description: `Ghi chú cho đơn hàng #${variables.code} đã được cập nhật.`,
        placement: "topRight",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to keep server sync
      queryClient.invalidateQueries(ordersListQueryFilter);
    },
  });
};

export const useCancelOrderMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await OrderApi.cancelOrder(code);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders.detail", code] });
      queryClient.invalidateQueries({ queryKey: ["orders.list"] });
      queryClient.invalidateQueries({ queryKey: ["orders.statistic"] });
      queryClient.invalidateQueries({ queryKey: ["orders.logs", code] });
      queryClient.invalidateQueries({ queryKey: ["orders.milestones", code] });
      queryClient.invalidateQueries({ queryKey: ["orders.financials", code] });
    },
  });
};

export const useReorderMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await OrderApi.reorderProductsToCart(code);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer.cart.statistics"] });
      queryClient.invalidateQueries({ queryKey: ["customer.cart.items"] });
    },
  });
};

export const useOrderProductsQuery = (code: string) => {
  return useQuery({
    queryKey: ["orders.products", code],
    queryFn: async () => {
      const res = await OrderApi.getOrderProducts(code);
      return res.data;
    },
    enabled: !!code,
  });
};

export const useOrderPackagesQuery = (code: string) => {
  return useQuery({
    queryKey: ["orders.packages", code],
    queryFn: async () => {
      const res = await OrderApi.getOrderPackages(code);
      return res.data;
    },
    enabled: !!code,
  });
};

export const useOrderFinancialsQuery = (code: string) => {
  return useQuery({
    queryKey: ["orders.financials", code],
    queryFn: async () => {
      const res = await OrderApi.getOrderFinancials(code);
      return res.data;
    },
    enabled: !!code,
  });
};

export const useOrderLogsInfiniteQuery = (code: string) => {
  return useInfiniteQuery({
    queryKey: ["orders.logs", code],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await OrderApi.getOrderLogs(code, Number(pageParam));
      const metadata = {
        pageCount: parseInt(res.headers["x-page-count"] || "0", 10),
        page: parseInt(res.headers["x-page-number"] || String(pageParam), 10),
        size: parseInt(res.headers["x-page-size"] || "25", 10),
        total: parseInt(res.headers["x-total-count"] || "0", 10),
      };

      return {
        data: res.data ?? [],
        metadata,
      };
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.metadata.page + 1;
      return nextPage < lastPage.metadata.pageCount ? nextPage : undefined;
    },
    enabled: !!code,
    retry: false,
  });
};

export const useOrderMilestonesQuery = (code: string) => {
  return useQuery({
    queryKey: ["orders.milestones", code],
    queryFn: async () => {
      const res = await OrderApi.getOrderMilestones(code);
      return res.data;
    },
    enabled: !!code,
  });
};

export const useOrderFeesQuery = (code: string) => {
  return useQuery({
    queryKey: ["orders.fees", code],
    queryFn: async () => {
      const res = await OrderApi.getOrderFees(code);
      return res.data;
    },
    enabled: !!code,
    retry: false,
  });
};

export const useOrderCouponsQuery = (code: string) => {
  return useQuery({
    queryKey: ["orders.coupons", code],
    queryFn: async () => {
      const res = await OrderApi.getOrderCoupons(code);
      return res.data ?? [];
    },
    enabled: !!code,
    retry: false,
  });
};

export const useApplyOrderCouponMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { couponCode?: string }) => {
      const res = await OrderApi.applyOrderCoupon(code, body);
      return res.data;
    },
    onSuccess: () => {
      delay(500).then(() => {
        queryClient.invalidateQueries({ queryKey: ["orders.detail", code] });
        queryClient.invalidateQueries({ queryKey: ["orders.coupons", code] });
        queryClient.invalidateQueries({ queryKey: ["orders.fees", code] });
        queryClient.invalidateQueries({
          queryKey: ["orders.financials", code],
        });
        queryClient.invalidateQueries({ queryKey: ["orders.logs", code] });
      });
    },
  });
};

export const useOrderFeesConfigGroupQuery = (
  configGroupId?: string | number,
) => {
  return useQuery({
    queryKey: ["orders.fees_config_group", configGroupId],
    queryFn: async () => {
      const res = await OrderApi.getOrderFeesConfigGroup(
        configGroupId as string | number,
      );
      return res.data;
    },
    enabled: !!configGroupId,
    retry: false,
  });
};

export const useOrderShippingFeesQuery = (
  configGroupId?: string | number,
  shippingClass?: string | number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["orders.shipping_fees", configGroupId, shippingClass],
    queryFn: async () => {
      const res = await CategoryApi.getOrderShippingFees(
        configGroupId as string | number,
        shippingClass as string | number,
      );
      return res.data ?? [];
    },
    enabled: !!configGroupId && !!shippingClass && enabled,
    retry: false,
  });
};
export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: any }) =>
      OrderApi.patchOrder(code, data),
    onMutate: async ({ code, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orders.detail", code] });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData(["orders.detail", code]);

      // Optimistically update to the new value
      queryClient.setQueryData(["orders.detail", code], (old: any) => {
        if (!old) return old;
        // Map refCustomerCode to customerCode and refOrderCode to customerOrderCode for local display consistency
        const displayUpdate: any = { ...data };
        if (data.refCustomerCode)
          displayUpdate.customerCode = data.refCustomerCode;
        if (data.refOrderCode)
          displayUpdate.customerOrderCode = data.refOrderCode;

        return { ...old, ...displayUpdate };
      });

      return { previousOrder };
    },
    onError: (_err, variables, context: any) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          ["orders.detail", variables.code],
          context.previousOrder,
        );
      }
      notification.error({
        message: "Cập nhật thất bại",
        description: "Vui lòng thử lại sau.",
      });
    },
    onSuccess: () => {
      notification.success({
        message: "Cập nhật thành công",
        placement: "topRight",
      });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["orders.detail", variables.code],
      });
      queryClient.invalidateQueries({ queryKey: ["orders.list"] });
    },
  });
};

export const useExportOrdersMutation = () => {
  return useMutation({
    mutationFn: async ({
      params,
      secret,
    }: {
      params: any;
      secret?: string;
    }) => {
      return OrderApi.exportOrders(params, { secret });
    },
  });
};

export const useExportOrderProductsMutation = (code: string) => {
  return useMutation({
    mutationFn: async ({ secret }: { secret?: string }) => {
      return OrderApi.exportOrderProducts(code, { secret });
    },
  });
};
