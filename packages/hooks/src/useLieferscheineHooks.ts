import { useQuery } from "@tanstack/react-query";
import { LieferscheineApi } from "@repo/api";

export const useLieferscheineQuery = (params: any) => {
  return useQuery({
    queryKey: ["lieferscheine.list", params],
    queryFn: async () => {
      const res = await LieferscheineApi.getLieferscheine(params);
      return {
        data: res.data || [],
        total: parseInt(res.headers["x-total-count"] || "0", 10),
        pageSize: parseInt(res.headers["x-page-size"] || "0", 10),
        current: parseInt(res.headers["x-page-number"] || "0", 10),
        totalPage: parseInt(res.headers["x-page-count"] || "0", 10),
      };
    },
    enabled: !!params,
  });
};

export const useLieferscheinePackagesQuery = (code?: string) => {
  return useQuery({
    queryKey: ["lieferscheine.packages", code],
    queryFn: async () => {
      const res = await LieferscheineApi.getLieferscheinePackages(code as string);
      return res.data || [];
    },
    enabled: !!code,
  });
};

export const useLieferscheineDeliveriesQuery = (code?: string) => {
  return useQuery({
    queryKey: ["lieferscheine.deliveries", code],
    queryFn: async () => {
      const res = await LieferscheineApi.getLieferscheineDeliveries(code as string);
      return res.data || [];
    },
    enabled: !!code,
  });
};

export const useCouriersQuery = () => {
  return useQuery({
    queryKey: ["categories.couriers"],
    queryFn: async () => {
      const res = await LieferscheineApi.getCouriers();
      return res.data || [];
    },
    staleTime: Infinity,
  });
};
