export type ClaimFilters = Record<string, any>;

export const normalizeClaimFilters = (values: ClaimFilters): ClaimFilters => {
  const next = { ...values };
  if (Array.isArray(next.ticketType)) {
    next.ticketType = next.ticketType[0];
  }
  return next;
};

export const buildClaimApiParams = ({
  page,
  pageSize,
  filters,
}: {
  page: number;
  pageSize: number;
  filters: ClaimFilters;
}) => {
  const params: Record<string, any> = {
    page: page - 1,
    size: pageSize,
    sort: "createdAt:desc",
    ...filters,
  };

  ["publicStates", "solutionCode"].forEach((key) => {
    if (Array.isArray(params[key])) {
      params[key] = params[key].join(",");
    }
  });

  if (Array.isArray(params.ticketType)) {
    params.ticketType = params.ticketType[0];
  }

  return params;
};
