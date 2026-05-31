export const buildOrderStatusOptions = (
  statuses: any[] = [],
  statistics: any[] = [],
) =>
  statuses.map((status: any) => {
    const statistic = statistics.find((item: any) => item.status === status.code);
    return {
      label: status.name,
      value: status.code,
      count: statistic ? statistic.total : "0",
    };
  });

export const getDeliveryReadyCount = (statistics: any[] = []) => {
  const statistic =
    statistics.find((item: any) => item.status === "DELIVERY_READY") ||
    statistics.find((item: any) => item.status === "READY_FOR_DELIVERY");
  return Number(statistic?.total || 0);
};
