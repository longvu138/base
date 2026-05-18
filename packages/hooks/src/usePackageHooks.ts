import { useMutation, useQuery } from "@tanstack/react-query";
import { PackageApi } from "@repo/api";
import { notification } from "antd";

export const usePackagesQuery = (params: any) => {
  return useQuery({
    queryKey: ["packages.list", params],
    queryFn: async () => {
      const res = await PackageApi.getPackages(params);
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

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.response?.data?.title || fallback;

export const useExportPackagesMutation = () => {
  return useMutation({
    mutationFn: ({ params, secret }: { params: any; secret: string }) =>
      PackageApi.exportPackages(params, { secret }),
    onError: (error: any) => {
      notification.error({
        message: getErrorMessage(error, "Không thể xuất Excel do mã pin sai"),
      });
    },
  });
};

export const usePackageStatusesQuery = () => {
  return useQuery({
    queryKey: ["packages.statuses"],
    queryFn: async () => {
      const res = await PackageApi.getPackageStatuses();
      return res.data;
    },
  });
};

export const useParcelStatusesQuery = () => {
  return useQuery({
    queryKey: ["parcels.statuses"],
    queryFn: async () => {
      const res = await PackageApi.getParcelStatuses();
      return res.data;
    },
  });
};

export const useParcelMilestonesQuery = (
  parcelCode: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["parcels.milestones", parcelCode],
    queryFn: async () => {
      const res = await PackageApi.getParcelMilestones(parcelCode);
      return res.data;
    },
    enabled: !!parcelCode && enabled,
  });
};

export const usePackageMilestonesQuery = (
  packageCode: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["packages.milestones", packageCode],
    queryFn: async () => {
      const res = await PackageApi.getPackageMilestones(packageCode);
      return res.data;
    },
    enabled: !!packageCode && enabled,
  });
};

export const usePackageIOHistoriesQuery = (
  packageCode: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["packages.io-histories", packageCode],
    queryFn: async () => {
      const res = await PackageApi.getPackageIOHistories(packageCode);
      return res.data;
    },
    enabled: !!packageCode && enabled,
  });
};
