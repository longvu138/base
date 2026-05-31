import { useOrderMilestonesQuery } from "@repo/hooks";

export const useOrderMilestonesModel = (code: string, enabled: boolean) => {
  const query = useOrderMilestonesQuery(enabled ? code : "");

  return {
    state: {
      milestones: query.data || [],
      isLoading: query.isLoading,
    },
    query,
  };
};
