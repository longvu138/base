import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryApi, ShipmentApi } from "@repo/api";

export const useListShipmentQuery = (params: any) => {
  return useQuery({
    queryKey: ["shipments.list", params],
    queryFn: async () => {
      const res = await ShipmentApi.getShipments(params);
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

export const useShipmentStatusesQuery = () => {
  return useQuery({
    queryKey: ["shipments.statuses"],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentStatuses();
      return res.data;
    },
  });
};

export const useShipmentStatisticQuery = () => {
  return useQuery({
    queryKey: ["shipments.statistic"],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentStatistic();
      return res.data;
    },
  });
};

export const useDraftShipmentQuery = () => {
  return useQuery({
    queryKey: ["shipments.draft"],
    queryFn: async () => {
      const res = await ShipmentApi.getDraftShipment();
      return res.data;
    },
  });
};

export const useCreateDraftShipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await ShipmentApi.createDraftShipment(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.draft"] });
    },
  });
};

export const useCreateShipmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await ShipmentApi.createShipment(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.list"] });
      queryClient.invalidateQueries({ queryKey: ["shipments.statistic"] });
      queryClient.invalidateQueries({ queryKey: ["shipments.draft"] });
    },
  });
};

export const useShipmentFeeCategoriesQuery = () => {
  return useQuery({
    queryKey: ["shipments.feeCategories"],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentFeeCategories();
      return res.data ?? [];
    },
  });
};

export const useShipmentServiceGroupsQuery = () => {
  return useQuery({
    queryKey: ["shipments.serviceGroups"],
    queryFn: async () => {
      const res = await CategoryApi.getServiceGroups();
      return res.data ?? [];
    },
  });
};

export const useShipmentShippingFeesQuery = (
  configGroupId?: string | number,
  shippingClass?: string | number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["shipments.shippingFees", configGroupId, shippingClass],
    queryFn: async () => {
      const res = await CategoryApi.getShipmentShippingFees(
        configGroupId as string | number,
        shippingClass as string | number,
      );
      return res.data ?? [];
    },
    enabled: !!configGroupId && !!shippingClass && enabled,
  });
};

export const useShipmentServicesQuery = () => {
  return useQuery({
    queryKey: ["shipments.services"],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentServices();
      return res.data as Array<{
        id: number;
        code: string;
        name: string;
        position: number;
      }>;
    },
    staleTime: Infinity, // Dịch vụ ít thay đổi, cache vĩnh viễn trong session
  });
};

export const useExportShipmentsMutation = () => {
  return useMutation({
    mutationFn: async ({
      params,
      secret,
    }: {
      params: any;
      secret?: string;
    }) => {
      return ShipmentApi.exportShipments(params, { secret });
    },
  });
};

export const useImportShipmentsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      services,
    }: {
      file: File;
      services?: string[];
    }) => {
      const res = await ShipmentApi.importShipments(file, { services });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.list"] });
      queryClient.invalidateQueries({ queryKey: ["shipments.statistic"] });
    },
  });
};

export const useShipmentDetailQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.detail", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentDetail(code);
      return res.data;
    },
    enabled: !!code,
  });
};

export const useUpdateShipmentMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await ShipmentApi.updateShipment(code, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.detail", code] });
      queryClient.invalidateQueries({
        queryKey: ["shipments.activities", code],
      });
    },
  });
};

export const useCancelShipmentMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await ShipmentApi.cancelShipment(code);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.detail", code] });
      queryClient.invalidateQueries({ queryKey: ["shipments.list"] });
      queryClient.invalidateQueries({ queryKey: ["shipments.statistic"] });
      queryClient.invalidateQueries({
        queryKey: ["shipments.activities", code],
      });
    },
  });
};

export const useShipmentProductsQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.products", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentProducts(code);
      return Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
    },
    enabled: !!code,
  });
};

export const useCreateShipmentProductMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await ShipmentApi.createShipmentProduct(code, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.products", code] });
      queryClient.invalidateQueries({ queryKey: ["shipments.detail", code] });
      queryClient.invalidateQueries({
        queryKey: ["shipments.activities", code],
      });
    },
  });
};

export const useUpdateShipmentProductMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productCode,
      payload,
    }: {
      productCode: string;
      payload: any;
    }) => {
      const res = await ShipmentApi.updateShipmentProduct(
        code,
        productCode,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.products", code] });
      queryClient.invalidateQueries({ queryKey: ["shipments.detail", code] });
      queryClient.invalidateQueries({
        queryKey: ["shipments.activities", code],
      });
    },
  });
};

export const useDeleteShipmentProductMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productCode: string) => {
      const res = await ShipmentApi.deleteShipmentProduct(code, productCode);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.products", code] });
      queryClient.invalidateQueries({ queryKey: ["shipments.detail", code] });
      queryClient.invalidateQueries({
        queryKey: ["shipments.activities", code],
      });
    },
  });
};

export const useShipmentFeesQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.fees", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentFees(code);
      return res.data ?? [];
    },
    enabled: !!code,
  });
};

export const useShipmentCouponsQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.coupons", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentCoupons(code);
      return res.data ?? [];
    },
    enabled: !!code,
  });
};

export const useApplyShipmentCouponMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { couponCode?: string }) => {
      const res = await ShipmentApi.applyShipmentCoupon(code, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.detail", code] });
      queryClient.invalidateQueries({ queryKey: ["shipments.coupons", code] });
      queryClient.invalidateQueries({ queryKey: ["shipments.fees", code] });
      queryClient.invalidateQueries({
        queryKey: ["shipments.financial", code],
      });
    },
  });
};

export const useShipmentWaybillsQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.waybills", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentWaybills(code);
      return res.data ?? [];
    },
    enabled: !!code,
  });
};

export const useCreateShipmentWaybillMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (waybillCode: string) => {
      await ShipmentApi.checkShipmentWaybillDuplicate(code, waybillCode);
      const res = await ShipmentApi.createShipmentWaybill(code, {
        code: waybillCode,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.waybills", code] });
      queryClient.invalidateQueries({ queryKey: ["shipments.parcels", code] });
      queryClient.invalidateQueries({
        queryKey: ["shipments.activities", code],
      });
    },
  });
};

export const useDeleteShipmentWaybillMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (waybillCode: string) => {
      const res = await ShipmentApi.deleteShipmentWaybill(code, waybillCode);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments.waybills", code] });
      queryClient.invalidateQueries({ queryKey: ["shipments.parcels", code] });
      queryClient.invalidateQueries({
        queryKey: ["shipments.activities", code],
      });
    },
  });
};

export const useShipmentParcelsQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.parcels", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentParcels(code);
      return res.data ?? [];
    },
    enabled: !!code,
  });
};

export const useShipmentMilestonesQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.milestones", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentMilestones(code);
      return res.data ?? [];
    },
    enabled: !!code,
  });
};

export const useShipmentActivitiesQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.activities", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentActivities(code);
      return {
        data: res.data ?? [],
        total: parseInt(res.headers["x-total-count"] || "0", 10),
      };
    },
    enabled: !!code,
  });
};

export const useShipmentFinancialQuery = (code: string, type?: string) => {
  return useQuery({
    queryKey: ["shipments.financial", code, type ?? "all"],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentFinancial(code, type);
      return res.data ?? [];
    },
    enabled: !!code,
  });
};

export const useShipmentClaimsQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.claims", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentClaims(code);
      return res.data ?? [];
    },
    enabled: !!code,
  });
};

export const useShipmentOriginalReceiptsQuery = (code: string) => {
  return useQuery({
    queryKey: ["shipments.originalReceipts", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentOriginalReceipts(code);
      return res.data ?? [];
    },
    enabled: !!code,
  });
};

export const useAddShipmentOriginalReceiptMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await ShipmentApi.addShipmentOriginalReceipt(code, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shipments.originalReceipts", code],
      });
      queryClient.invalidateQueries({
        queryKey: ["shipments.activities", code],
      });
    },
  });
};

export const useDeleteShipmentOriginalReceiptMutation = (code: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await ShipmentApi.deleteShipmentOriginalReceipt(
        code,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shipments.originalReceipts", code],
      });
      queryClient.invalidateQueries({
        queryKey: ["shipments.activities", code],
      });
    },
  });
};

export const useHarmonizedCommoditiesQuery = () => {
  return useQuery({
    queryKey: ["shipments.harmonizedCommodities"],
    queryFn: async () => {
      const res = await ShipmentApi.getHarmonizedCommodities();
      return res.data ?? [];
    },
    staleTime: Infinity,
  });
};

export const useShipmentCreditsQuery = (code: string, enabled = true) => {
  return useQuery({
    queryKey: ["shipments.credits", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentCredits(code);
      return res.data ?? [];
    },
    enabled: !!code && enabled,
  });
};

export const useShipmentLoansQuery = (code: string, enabled = true) => {
  return useQuery({
    queryKey: ["shipments.loans", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentLoans(code);
      return res.data ?? null;
    },
    enabled: !!code && enabled,
  });
};

export const useShipmentThirdPartyLoansQuery = (
  code: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["shipments.thirdPartyLoans", code],
    queryFn: async () => {
      const res = await ShipmentApi.getShipmentThirdPartyLoans(code);
      return res.data?.loanCredits ?? res.data ?? [];
    },
    enabled: !!code && enabled,
  });
};
