import dayjs from "dayjs";

export const normalizeOrderFilters = (values: Record<string, any>) => {
  const next = { ...values };
  delete next.dateRange;

  if (dayjs.isDayjs(next.timestampFrom)) {
    next.timestampFrom = next.timestampFrom.startOf("day").toISOString();
  }
  if (dayjs.isDayjs(next.timestampTo)) {
    next.timestampTo = next.timestampTo.endOf("day").toISOString();
  }
  if (dayjs.isDayjs(next.milestoneStatusFrom)) {
    next.milestoneStatusFrom = next.milestoneStatusFrom
      .startOf("day")
      .toISOString();
  }
  if (dayjs.isDayjs(next.milestoneStatusTo)) {
    next.milestoneStatusTo = next.milestoneStatusTo.endOf("day").toISOString();
  }

  if (!next.milestoneStatusFrom || !next.milestoneStatusTo) {
    delete next.milestoneStatus;
    delete next.milestoneStatusFrom;
    delete next.milestoneStatusTo;
  }

  if (
    next.typeSearch === "equal" &&
    next.handlingTimeFrom !== undefined &&
    next.handlingTimeFrom !== null &&
    next.handlingTimeFrom !== ""
  ) {
    next.handlingTimeTo = next.handlingTimeFrom;
  }

  if (!next.handlingTimeFrom && !next.handlingTimeTo) {
    delete next.typeSearch;
    delete next.cutOffStatus;
    delete next.handlingTimeFrom;
    delete next.handlingTimeTo;
  }

  return next;
};

export const buildOrderApiParams = ({
  page,
  pageSize,
  filters,
}: {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}) => {
  const params: Record<string, any> = {
    page: page - 1,
    size: pageSize,
    sort: "createdAt:desc",
    ...filters,
  };

  ["statuses", "marketplaces", "services"].forEach((key) => {
    if (Array.isArray(params[key])) {
      params[key] = params[key].join(",");
    }
  });

  return params;
};
