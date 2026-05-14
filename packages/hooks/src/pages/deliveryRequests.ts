import { useMemo } from "react";
import dayjs from "dayjs";
import {
  useListDeliveryRequestQuery,
  useDeliveryRequestPackagesQuery,
  useDeliveryRequestStatusesQuery,
} from "../useDeliveryRequestHooks";

export interface UseDeliveryRequestsLogicProps {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
  expandedCode?: string;
}

/**
 * Shared logic for Delivery Requests Page
 */
export const useDeliveryRequestsLogic = ({
  page,
  pageSize,
  filters,
  expandedCode,
}: UseDeliveryRequestsLogicProps) => {
  // 1. Format params for API
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: page - 1,
      size: pageSize,
      sort: "createdAt:desc",
      ...filters,
    };
    ["createdFrom", "createdTo"].forEach((key) => {
      if (dayjs.isDayjs(params[key])) {
        params[key] = params[key].toISOString();
      }
    });
    ["statuses"].forEach((key) => {
      if (Array.isArray(params[key])) {
        params[key] = params[key].join(",");
      }
    });
    return params;
  }, [page, pageSize, filters]);

  // 2. Fetch data
  const { data: listData, isLoading: isDeliveryRequestLoading } =
    useListDeliveryRequestQuery(apiParams);
  const { data: statusData } = useDeliveryRequestStatusesQuery();
  const { data: deliveryPackages = [], isLoading: isDeliveryPackagesLoading } =
    useDeliveryRequestPackagesQuery(expandedCode, !!expandedCode);

  // 3. Derived State
  const statusOptions = useMemo(() => {
    if (!statusData) return [];
    return statusData.map((s: any) => ({ label: s.name, value: s.code }));
  }, [statusData]);

  return {
    listData,
    isDeliveryRequestLoading,
    isDeliveryRequestsLoading: isDeliveryRequestLoading, // alias cho UI
    statusData,
    statusOptions,
    deliveryPackages,
    isDeliveryPackagesLoading,
    apiParams,
  };
};
