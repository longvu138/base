import { useMemo } from "react";
import { useAddressesQuery } from "../useAddressHooks";
import {
  useCancelCashRequestMutation,
  useCashRequestsQuery,
  useCreateCashRequestMutation,
} from "../useCashRequestHooks";

export interface UseCashRequestsLogicProps {
  page: number;
  pageSize: number;
  enabled?: boolean;
}

export const useCashRequestsLogic = ({
  page,
  pageSize,
  enabled = true,
}: UseCashRequestsLogicProps) => {
  const apiParams = useMemo(
    () => ({
      offset: page - 1,
      limit: pageSize,
    }),
    [page, pageSize],
  );

  const addressParams = useMemo(
    () => ({
      page: 0,
      size: 10000,
      sort: "defaultAddress:desc,createdAt:desc",
    }),
    [],
  );

  const cashRequestsQuery = useCashRequestsQuery(enabled ? apiParams : null);
  const addressesQuery = useAddressesQuery(addressParams);
  const createCashRequestMutation = useCreateCashRequestMutation();
  const cancelCashRequestMutation = useCancelCashRequestMutation();

  return {
    apiParams,
    addressParams,
    listData: cashRequestsQuery.data,
    addresses: Array.isArray(addressesQuery.data?.data) ? addressesQuery.data.data : [],
    isCashRequestsLoading: cashRequestsQuery.isLoading,
    isAddressesLoading: addressesQuery.isLoading,
    createCashRequestMutation,
    cancelCashRequestMutation,
  };
};
