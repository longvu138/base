import { useMemo, useState } from "react";
import { useCartFeesQuery } from "@repo/hooks";
import { sameCodes } from "../cartViewModel";

export const useCartSellerPanel = (group: any, logic: any) => {
  const [feesOpen, setFeesOpen] = useState(false);
  const [servicesCollapsed, setServicesCollapsed] = useState(true);
  const { data: fees = [], isFetching: isFeesFetching } = useCartFeesQuery(
    String(group.id),
    feesOpen,
  );

  const groupId = String(group.id);
  const selectedCodes =
    logic.serviceDrafts[groupId] ??
    (Array.isArray(group.services)
      ? group.services.map((service: any) => service.code).filter(Boolean)
      : []);
  const originalCodes = Array.isArray(group.services)
    ? group.services.map((service: any) => service.code).filter(Boolean)
    : [];

  const selectedServices = useMemo(
    () =>
      logic.orderServices.filter((service: any) =>
        selectedCodes.includes(service.code),
      ),
    [logic.orderServices, selectedCodes],
  );

  const ungroupedServices = useMemo(
    () => logic.orderServices.filter((service: any) => !service.serviceGroup),
    [logic.orderServices],
  );

  return {
    groupId,
    draft: logic.cartGroupDrafts[groupId] || {},
    fees,
    feesOpen,
    isFeesFetching,
    selectedCodes,
    selectedServices,
    servicesChanged: !sameCodes(selectedCodes, originalCodes),
    servicesCollapsed,
    ungroupedServices,
    setFeesOpen,
    setServicesCollapsed,
  };
};
