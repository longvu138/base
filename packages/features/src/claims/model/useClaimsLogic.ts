import { useMemo } from "react";
import {
  useClaimStatusesQuery,
  useListClaimQuery,
  useSolutionsQuery,
} from "@repo/hooks";
import { buildClaimApiParams } from "../domain/filters";
import {
  buildClaimSolutionOptions,
  buildClaimStatusOptions,
} from "../domain/options";

export type UseClaimsLogicProps = {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
};

export const useClaimsLogic = ({
  page,
  pageSize,
  filters,
}: UseClaimsLogicProps) => {
  const apiParams = useMemo(
    () => buildClaimApiParams({ page, pageSize, filters }),
    [page, pageSize, filters],
  );

  const { data: listData, isLoading: isClaimLoading } =
    useListClaimQuery(apiParams);
  const { data: statusData } = useClaimStatusesQuery();
  const { data: solutionData } = useSolutionsQuery();

  const statusOptions = useMemo(
    () => buildClaimStatusOptions(statusData),
    [statusData],
  );

  const solutionOptions = useMemo(
    () => buildClaimSolutionOptions(solutionData),
    [solutionData],
  );

  return {
    listData,
    isClaimLoading,
    isClaimsLoading: isClaimLoading,
    statusData,
    solutionData,
    statusOptions,
    solutionOptions,
    apiParams,
  };
};
