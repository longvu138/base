import { useQuery } from "@tanstack/react-query";
import { StatisticApi, type StatisticType } from "@repo/api";

export type { StatisticType } from "@repo/api";

export type StatisticPeriod = "monthly" | "yearly";

export type StatisticSummary = {
  orderCount: number;
  expenditure: number;
  [key: string]: any;
};

type StatisticSummaryQueryParams = {
  type: StatisticType;
  period: StatisticPeriod;
  year: string;
  month?: string;
  tenantCode?: string;
  enabled?: boolean;
};

const normalizeClarkSummary = (data: any): StatisticSummary => ({
  ...data,
  orderCount: data?.orderCount ?? data?.total ?? 0,
  expenditure: data?.expenditure ?? data?.totalSpending ?? 0,
});

const normalizeStatisticSummary = (data: any): StatisticSummary => ({
  ...data,
  orderCount: data?.orderCount ?? 0,
  expenditure: data?.expenditure ?? 0,
});

export const useStatisticSummaryQuery = ({
  type,
  period,
  year,
  month,
  tenantCode,
  enabled = true,
}: StatisticSummaryQueryParams) => {
  return useQuery({
    queryKey: ["statistics.summary", type, period, year, month, tenantCode],
    enabled: enabled && !!type && !!year && (period === "yearly" || !!month),
    queryFn: async () => {
      if (type === "request_payment") {
        const res =
          period === "monthly"
            ? await StatisticApi.getStatisticClarkMonthly(year, month || "", tenantCode)
            : await StatisticApi.getStatisticClarkYearly(year, tenantCode);

        return normalizeClarkSummary(res.data);
      }

      const res =
        period === "monthly"
          ? await StatisticApi.getStatisticMonthly(type, year, month || "")
          : await StatisticApi.getStatisticYearly(type, year);

      return normalizeStatisticSummary(res.data);
    },
  });
};
