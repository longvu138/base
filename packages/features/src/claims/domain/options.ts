export const buildClaimStatusOptions = (statuses: any[] = []) =>
  statuses.map((status: any) => ({ label: status.name, value: status.code }));

export const buildClaimSolutionOptions = (solutions: any[] = []) =>
  solutions.map((solution: any) => ({
    label: solution.name,
    value: solution.code,
  }));

export const getClaimStatusView = (record: any, statuses: any[] = []) => {
  if (record.publicStateNewView) return record.publicStateNewView;
  if (typeof record.publicState === "object") return record.publicState;
  return statuses.find((item: any) => item.code === record.publicState) || {};
};

export const getClaimSolutionName = (record: any, solutions: any[] = []) => {
  if (record.solutionView?.name) return record.solutionView.name;
  return (
    solutions.find((item: any) => item.code === record.solutionCode)?.name ||
    record.solutionCode ||
    ""
  );
};

export const getClaimSolutionsByTicketType = (
  solutions: any[] = [],
  ticketType?: string,
) => {
  if (ticketType) {
    return solutions.filter((item: any) => item.subject === ticketType);
  }

  return Array.from(
    new Map(
      solutions.map((item: any) => [item.name || item.code, item]),
    ).values(),
  );
};
