export const sortByPosition = <T extends { position?: number | string }>(
  items: T[] = [],
) =>
  [...items].sort(
    (a, b) => Number(a.position || 0) - Number(b.position || 0),
  );

export const getCustomerVisibleShipmentServices = (services: any[] = []) =>
  sortByPosition(services).filter((service: any) => service.onlyStaff !== true);

export const getShipmentServicesWithoutGroup = (services: any[] = []) =>
  sortByPosition(services.filter((service: any) => !service.serviceGroup));

export const getShipmentServicesInGroup = (
  services: any[] = [],
  groupCode?: string,
) =>
  sortByPosition(
    services.filter((service: any) => service.serviceGroup?.code === groupCode),
  );

export const getVisibleShipmentServiceGroups = (
  serviceGroups: any[] = [],
  services: any[] = [],
) =>
  sortByPosition(serviceGroups).filter((group: any) =>
    services.some((service: any) => service.serviceGroup?.code === group.code),
  );
