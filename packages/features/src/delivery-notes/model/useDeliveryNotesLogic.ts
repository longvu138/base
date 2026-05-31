import { useMemo } from "react";
import { useDeliveryNotesQuery } from "@repo/hooks";
import { buildDeliveryNoteApiParams } from "../domain/filters";

export interface UseDeliveryNotesLogicProps {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}

export const useDeliveryNotesLogic = ({
  page,
  pageSize,
  filters,
}: UseDeliveryNotesLogicProps) => {
  const apiParams = useMemo(
    () => buildDeliveryNoteApiParams({ page, pageSize, filters }),
    [page, pageSize, filters],
  );

  const { data: listData, isLoading: isDeliveryNoteLoading } =
    useDeliveryNotesQuery(apiParams);

  return {
    listData,
    isDeliveryNoteLoading,
    isDeliveryNotesLoading: isDeliveryNoteLoading,
    apiParams,
  };
};
