import { useStatisticSummaryQuery, type StatisticSummary, type StatisticType } from "@repo/hooks";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type StatisticsTabType = StatisticType;

export type StatisticsTab = {
  key: StatisticsTabType;
  labelKey: string;
};

type CurrentProjectInfo = {
  code?: string;
  tenantConfig?: {
    orderConfig?: { disable?: boolean };
    shipmentConfig?: { enable?: boolean };
    peerPaymentConfig?: { enabled?: boolean };
  };
};

const readCurrentProjectInfo = (): CurrentProjectInfo => {
  try {
    return JSON.parse(localStorage.getItem("currentProjectInfo") || "{}");
  } catch {
    return {};
  }
};

const formatStatisticDate = (date: Dayjs, format: string) => {
  const safeFormat = format || "MM/YYYY";
  return dayjs(date).format(safeFormat);
};

export const useStatisticsPage = () => {
  const { t } = useTranslation();
  const currentProjectInfo = useMemo(readCurrentProjectInfo, []);
  const tenantConfig = currentProjectInfo.tenantConfig || {};

  const tabs = useMemo<StatisticsTab[]>(() => {
    const enableOrder = tenantConfig.orderConfig?.disable !== true;
    const enableShipment = tenantConfig.shipmentConfig?.enable === true;
    const enableRequestPayment = tenantConfig.peerPaymentConfig?.enabled === true;

    return [
      ...(enableOrder ? [{ key: "order" as const, labelKey: "statistic.order" }] : []),
      ...(enableShipment ? [{ key: "shipment" as const, labelKey: "statistic.shipment" }] : []),
      ...(enableRequestPayment
        ? [{ key: "request_payment" as const, labelKey: "statistic.request_payment" }]
        : []),
    ];
  }, [
    tenantConfig.orderConfig?.disable,
    tenantConfig.peerPaymentConfig?.enabled,
    tenantConfig.shipmentConfig?.enable,
  ]);

  return {
    t,
    tenantCode: currentProjectInfo.code,
    tabs,
  };
};

export const useStatisticDetailPage = (type: StatisticType, tenantCode?: string) => {
  const { t } = useTranslation();
  const now = dayjs();
  const previousMonth = now.subtract(1, "month");
  const previousYear = now.subtract(1, "year");

  const currentMonth = useStatisticSummaryQuery({
    type,
    period: "monthly",
    year: now.format("YYYY"),
    month: now.format("MM"),
    tenantCode,
  });
  const currentYear = useStatisticSummaryQuery({
    type,
    period: "yearly",
    year: now.format("YYYY"),
    tenantCode,
  });
  const beforeMonth = useStatisticSummaryQuery({
    type,
    period: "monthly",
    year: previousMonth.format("YYYY"),
    month: previousMonth.format("MM"),
    tenantCode,
  });
  const beforeYear = useStatisticSummaryQuery({
    type,
    period: "yearly",
    year: previousYear.format("YYYY"),
    tenantCode,
  });

  const monthFormat = t("statistic.momentFormatMonthYear");
  const yearFormat = t("statistic.momentFormatYear");

  return {
    t,
    month: {
      title: t("statistic.title", { date: formatStatisticDate(now, monthFormat) }),
      data: currentMonth.data as StatisticSummary | undefined,
      previousData: beforeMonth.data as StatisticSummary | undefined,
      loading: currentMonth.isLoading,
      previousDate: formatStatisticDate(previousMonth, monthFormat),
    },
    year: {
      title: t("statistic.title", { date: formatStatisticDate(now, yearFormat) }),
      data: currentYear.data as StatisticSummary | undefined,
      previousData: beforeYear.data as StatisticSummary | undefined,
      loading: currentYear.isLoading,
      previousDate: formatStatisticDate(previousYear, yearFormat),
    },
  };
};
