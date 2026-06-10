export type CartServiceWarning =
  | {
      type: "requires";
      serviceName: string;
      requiredNames: string[];
      groupCode?: string;
    }
  | {
      type: "requireGroups";
      serviceName: string;
      requiredNames: string[];
      groupCode?: string;
    }
  | {
      type: "requiredGroup";
      groupName: string;
      groupCode: string;
    }
  | {
      type: "needApprove";
      serviceName: string;
      groupCode?: string;
    };

const getCodes = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => !!item) : [];

const uniqueCodes = (codes: string[]) => Array.from(new Set(codes));

export const isCartServiceDisabled = (
  service: any,
  selectedCodes: string[],
  services: any[],
) => {
  const selectedServices = services.filter((item) =>
    selectedCodes.includes(item.code),
  );

  return selectedServices.some(
    (selected) =>
      getCodes(selected.dependencies).includes(service.code) ||
      getCodes(selected.excludes).includes(service.code) ||
      (!!service?.serviceGroup?.code &&
        getCodes(selected.excludeGroups).includes(service.serviceGroup.code)),
  );
};

export const applyCartServiceSelection = (
  selectedCodes: string[],
  service: any,
  checked: boolean,
  services: any[],
) => {
  let nextCodes = [...selectedCodes];

  if (!checked) {
    nextCodes = nextCodes.filter((code) => code !== service.code);
    nextCodes = nextCodes.filter(
      (code) => !getCodes(service.dependencies).includes(code),
    );

    const removedGroupCode = service?.serviceGroup?.code;
    if (
      removedGroupCode &&
      !services.some(
        (item) =>
          nextCodes.includes(item.code) &&
          item?.serviceGroup?.code === removedGroupCode,
      )
    ) {
      nextCodes = nextCodes.filter((code) => {
        const item = services.find((candidate) => candidate.code === code);
        return !getCodes(item?.requireGroups).includes(removedGroupCode);
      });
    }

    nextCodes = nextCodes.filter((code) => {
      const item = services.find((candidate) => candidate.code === code);
      const requires = getCodes(item?.requires);
      return (
        requires.length === 0 ||
        requires.some((requiredCode) => nextCodes.includes(requiredCode))
      );
    });

    return uniqueCodes(nextCodes);
  }

  nextCodes = nextCodes.filter(
    (code) => !getCodes(service.excludes).includes(code),
  );
  nextCodes = nextCodes.filter((code) => {
    const item = services.find((candidate) => candidate.code === code);
    return !getCodes(service.excludeGroups).includes(
      item?.serviceGroup?.code,
    );
  });

  if (service?.serviceGroup?.single) {
    nextCodes = nextCodes.filter((code) => {
      const item = services.find((candidate) => candidate.code === code);
      return item?.serviceGroup?.code !== service.serviceGroup.code;
    });
  }

  const addWithDependencies = (code: string) => {
    const item = services.find((candidate) => candidate.code === code);
    if (!item || nextCodes.includes(code)) return;
    getCodes(item.dependencies).forEach(addWithDependencies);
    nextCodes.push(code);
  };

  addWithDependencies(service.code);
  return uniqueCodes(nextCodes);
};

export const getCartServiceWarnings = (
  selectedCodes: string[],
  services: any[],
  serviceGroups: any[],
): CartServiceWarning[] => {
  const selectedServices = services.filter((service) =>
    selectedCodes.includes(service.code),
  );
  const warnings: CartServiceWarning[] = [];

  serviceGroups
    .filter(
      (group) =>
        group.required &&
        services.some(
          (service) => service?.serviceGroup?.code === group.code,
        ),
    )
    .forEach((group) => {
      const hasSelectedService = selectedServices.some(
        (service) => service?.serviceGroup?.code === group.code,
      );
      if (!hasSelectedService) {
        warnings.push({
          type: "requiredGroup",
          groupName: group.name || group.code,
          groupCode: group.code,
        });
      }
    });

  selectedServices.forEach((service) => {
    const missingRequiredServices = getCodes(service.requires).filter(
      (code) => !selectedCodes.includes(code),
    );
    if (missingRequiredServices.length > 0) {
      warnings.push({
        type: "requires",
        serviceName: service.name || service.code,
        requiredNames: missingRequiredServices.map((code) => {
          const required = services.find((item) => item.code === code);
          return required?.name || code;
        }),
        groupCode: service?.serviceGroup?.code,
      });
    }

    const missingRequiredGroups = getCodes(service.requireGroups).filter(
      (code) =>
        !selectedServices.some(
          (item) => item?.serviceGroup?.code === code,
        ),
    );
    if (missingRequiredGroups.length > 0) {
      warnings.push({
        type: "requireGroups",
        serviceName: service.name || service.code,
        requiredNames: missingRequiredGroups.map((code) => {
          const group = serviceGroups.find((item) => item.code === code);
          return group?.name || code;
        }),
        groupCode: service?.serviceGroup?.code,
      });
    }

    if (service.needApprove) {
      warnings.push({
        type: "needApprove",
        serviceName: service.name || service.code,
        groupCode: service?.serviceGroup?.code,
      });
    }
  });

  return warnings;
};
