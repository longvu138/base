import { useMemo } from "react";
import {
  useOrderLogsInfiniteQuery,
  usePackageStatusesQuery,
} from "@repo/hooks";
import { type OrderLogTranslator, parseLogs } from "../domain/logs";

export type UseOrderLogsModelParams = {
  order: any;
  orderCode: string;
  t: OrderLogTranslator;
};

export const useOrderLogsModel = ({
  order,
  orderCode,
  t,
}: UseOrderLogsModelParams) => {
  const logQuery = useOrderLogsInfiniteQuery(orderCode);
  const { data: packageStatuses = [] } = usePackageStatusesQuery();

  const rawLogs = useMemo(
    () => logQuery.data?.pages.flatMap((page) => page.data) || [],
    [logQuery.data],
  );

  const logs = useMemo(
    () => parseLogs(rawLogs, order, t, packageStatuses),
    [rawLogs, order, t, packageStatuses],
  );

  return {
    logs,
    isLoading: logQuery.isLoading,
    isError: logQuery.isError,
    isFetchingNextPage: logQuery.isFetchingNextPage,
    hasNextPage: logQuery.hasNextPage,
    fetchNextPage: logQuery.fetchNextPage,
  };
};
