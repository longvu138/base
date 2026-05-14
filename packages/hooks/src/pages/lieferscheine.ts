import { useMemo } from "react";
import dayjs from "dayjs";
import {
  useCouriersQuery,
  useLieferscheineDeliveriesQuery,
  useLieferscheinePackagesQuery,
  useLieferscheineQuery,
} from "../useLieferscheineHooks";

export interface UseLieferscheineLogicProps {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
  expandedCode?: string;
}

const STATUS_PARAMS: Record<string, Record<string, boolean>> = {
  prepared: { prepared: true, storekeeper: false, delivered: false, received: false },
  storekeeper: { storekeeper: true, delivered: false, received: false },
  delivered: { delivered: true, received: false },
  received: { received: true },
  cancelled: { cancelled: true },
};

export const useLieferscheineLogic = ({
  page,
  pageSize,
  filters,
  expandedCode,
}: UseLieferscheineLogicProps) => {
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: page - 1,
      size: pageSize,
      sort: "createdAt:desc",
      ...filters,
    };

    if (dayjs.isDayjs(params.issueDateFrom)) {
      params.issueDateFrom = params.issueDateFrom.toISOString();
    }
    if (dayjs.isDayjs(params.issueDateTo)) {
      params.issueDateTo = params.issueDateTo.toISOString();
    }

    if (params.status) {
      Object.assign(params, STATUS_PARAMS[params.status] || {});
      delete params.status;
    }

    return params;
  }, [filters, page, pageSize]);

  const { data: listData, isLoading: isLieferscheineLoading } =
    useLieferscheineQuery(apiParams);
  const { data: packages = [], isLoading: isPackagesLoading } =
    useLieferscheinePackagesQuery(expandedCode);
  const { data: deliveries = [], isLoading: isDeliveriesLoading } =
    useLieferscheineDeliveriesQuery(expandedCode);
  const { data: couriers = [] } = useCouriersQuery();

  return {
    apiParams,
    listData,
    packages,
    deliveries,
    couriers,
    isLieferscheineLoading,
    isPackagesLoading,
    isDeliveriesLoading,
  };
};
