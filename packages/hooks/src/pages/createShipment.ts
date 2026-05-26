import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App as AntdApp, Form } from "antd";
import { useTranslation } from "@repo/i18n";
import {
  useCreateDraftShipmentMutation,
  useCreateShipmentMutation,
  useDraftShipmentQuery,
  useShipmentFeeCategoriesQuery,
  useShipmentServiceGroupsQuery,
  useShipmentServicesQuery,
} from "../useShipmentHooks";
import {
  useAddressesQuery,
  useDeleteAddressMutation,
} from "../useAddressHooks";
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from "../useCustomerHooks";
import {
  getCustomerVisibleShipmentServices,
  getVisibleShipmentServiceGroups,
  sortShipmentServicesByPosition,
} from "./shipments";

export const useCreateShipmentFinancialFields = () => {
  const [financialFieldValues, setFinancialFieldValues] = useState<
    Record<string, any>
  >({});
  const [editingFinancialFields, setEditingFinancialFields] = useState<
    Record<string, boolean>
  >({
    expectedPackages: true,
    refTrackingNumbers: true,
    refShipmentCode: true,
    refCustomerCode: true,
    remark: true,
    note: false,
  });

  const isEmptyField = (value: any) =>
    value === undefined || value === null || String(value).trim() === "";

  const setFinancialFieldEditing = (name: string, value: boolean) => {
    setEditingFinancialFields((current) => ({ ...current, [name]: value }));
  };

  const finishFinancialFieldEditing = (name: string, value: any) => {
    setFinancialFieldValues((current) => ({ ...current, [name]: value }));
    setFinancialFieldEditing(name, isEmptyField(value));
  };

  return {
    editingFinancialFields,
    financialFieldValues,
    finishFinancialFieldEditing,
    isEmptyField,
    setFinancialFieldEditing,
    setFinancialFieldValues,
  };
};

export const addressLocation = (item: any) =>
  item.location?.display ||
  item.location?.displayName ||
  item.locationName ||
  "";

export const useCreateShipmentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notification, modal } = AntdApp.useApp();
  const [form] = Form.useForm();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [draftShipment, setDraftShipment] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState<number | undefined>();
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [returnToAddressList, setReturnToAddressList] = useState(false);
  const [addressDraftSelection, setAddressDraftSelection] = useState<number>();
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>();
  const [trackingError, setTrackingError] = useState(false);
  const [serviceGroupErrors, setServiceGroupErrors] = useState<
    Record<string, boolean>
  >({});

  const { data: services = [], isLoading: isServicesLoading } =
    useShipmentServicesQuery();
  const { data: serviceGroups = [], isLoading: isServiceGroupsLoading } =
    useShipmentServiceGroupsQuery();
  const { data: draft, isLoading: isDraftLoading } = useDraftShipmentQuery();
  const { data: feeCategories = [] } = useShipmentFeeCategoriesQuery();
  const { data: profile } = useCustomerProfile();
  const {
    data: addressData,
    isLoading: isAddressLoading,
    refetch: refetchAddresses,
  } = useAddressesQuery({
    receivingAddress: false,
    size: 1000,
    sort: "defaultAddress:desc,createdAt:desc",
  });
  const createDraftMutation = useCreateDraftShipmentMutation();
  const createShipmentMutation = useCreateShipmentMutation();
  const deleteAddressMutation = useDeleteAddressMutation();
  const updateProfileMutation = useUpdateCustomerProfile();

  const financialFields = useCreateShipmentFinancialFields();

  const disableCustomerOrderNote = useMemo(() => {
    const currentProjectInfo = localStorage.getItem("currentProjectInfo");
    if (!currentProjectInfo) return false;

    try {
      const data = JSON.parse(currentProjectInfo);
      return Boolean(
        data?.tenantConfig?.generalConfig?.disableCustomerOrderNote
      );
    } catch {
      return false;
    }
  }, []);

  const isWarehouseEnabled = useMemo(() => {
    const currentProjectInfo = localStorage.getItem("currentProjectInfo");
    if (!currentProjectInfo) return false;

    try {
      const data = JSON.parse(currentProjectInfo);
      return Boolean(
        data?.tenantConfig?.generalConfig?.customerWarehouseEnabled
      );
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!draft) return;
    setDraftShipment(draft);
    if (draft.addressId) setSelectedAddress(draft.addressId);
    if (Array.isArray(draft.services)) {
      setSelectedServices(draft.services.map((item: any) => item.code));
    }
    if (draft.sourceWarehouses?.[0]?.code) {
      setSelectedWarehouse(draft.sourceWarehouses[0].code);
    }
  }, [draft]);

  const serviceOptions = useMemo(() => {
    return getCustomerVisibleShipmentServices(services);
  }, [services]);

  const selectedAddressItem = useMemo(() => {
    return (addressData?.data || []).find(
      (item: any) => item.id === selectedAddress
    );
  }, [addressData?.data, selectedAddress]);

  const defaultAddressItem = useMemo(() => {
    return (
      (addressData?.data || []).find((item: any) => item.defaultAddress) ||
      addressData?.data?.[0]
    );
  }, [addressData?.data]);

  useEffect(() => {
    if (selectedAddress || !defaultAddressItem?.id) return;
    setSelectedAddress(defaultAddressItem.id);
    setAddressDraftSelection(defaultAddressItem.id);
  }, [defaultAddressItem?.id, selectedAddress]);

  const selectedServiceObjects = useMemo(() => {
    return selectedServices
      .map((code) => serviceOptions.find((item: any) => item.code === code))
      .filter(Boolean);
  }, [selectedServices, serviceOptions]);

  const visibleGroups = useMemo(() => {
    return getVisibleShipmentServiceGroups(serviceGroups, serviceOptions);
  }, [serviceGroups, serviceOptions]);

  const fees = useMemo(() => {
    const list = draftShipment?.fees || [];
    return sortShipmentServicesByPosition(
      list.map((item: any) => {
        const config = feeCategories.find(
          (fee: any) => fee.code === item.feeType
        );
        return {
          ...item,
          name: config?.name || item.feeType || t("delivery.undefined"),
          position: config?.position || 0,
        };
      })
    );
  }, [draftShipment?.fees, feeCategories, t]);

  const validateServices = (servicesValue = selectedServices) => {
    const selectedObjects = servicesValue
      .map((code) => serviceOptions.find((item: any) => item.code === code))
      .filter(Boolean);
    const errors: Record<string, boolean> = {};

    visibleGroups
      .filter((group: any) => group.required)
      .forEach((group: any) => {
        const hasServiceInGroup = selectedObjects.some(
          (item: any) => item.serviceGroup?.code === group.code
        );
        if (!hasServiceInGroup) errors[group.code] = true;
      });

    selectedObjects.forEach((item: any) => {
      if (
        Array.isArray(item.requires) &&
        item.requires.some((code: string) => !servicesValue.includes(code))
      ) {
        errors.__requires = true;
      }
      if (
        Array.isArray(item.requireGroups) &&
        item.requireGroups.some(
          (groupCode: string) =>
            !selectedObjects.some(
              (service: any) => service.serviceGroup?.code === groupCode
            )
        )
      ) {
        errors.__requires = true;
      }
    });

    setServiceGroupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createDraft = async (
    servicesValue = selectedServices,
    addressId = selectedAddress
  ) => {
    if (!servicesValue.length) return;
    validateServices(servicesValue);
    try {
      const res = await createDraftMutation.mutateAsync({
        addressId,
        services: servicesValue,
      });
      setDraftShipment(res);
      if (res?.sourceWarehouses?.[0]?.code)
        setSelectedWarehouse(res.sourceWarehouses[0].code);
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.message ||
          t("shipments.create_draft_error"),
      });
    }
  };

  const isServiceDisabled = (service: any, values = selectedServices) => {
    const selectedObjects = values
      .map((code) => serviceOptions.find((item: any) => item.code === code))
      .filter(Boolean);
    return selectedObjects.some(
      (item: any) =>
        item.code !== service.code &&
        (item.dependencies?.includes(service.code) ||
          item.excludes?.includes(service.code) ||
          (service.serviceGroup &&
            item.excludeGroups?.includes(service.serviceGroup.code)))
    );
  };

  const buildNextServices = (service: any, checked: boolean) => {
    let next = [...selectedServices];

    if (!checked) {
      next = next.filter((code) => code !== service.code);
      if (Array.isArray(service.dependencies)) {
        next = next.filter((code) => !service.dependencies.includes(code));
      }
      return next;
    }

    if (service.serviceGroup?.single) {
      next = next.filter((code) => {
        const current = serviceOptions.find((item: any) => item.code === code);
        return current?.serviceGroup?.code !== service.serviceGroup.code;
      });
    }

    if (Array.isArray(service.excludes)) {
      next = next.filter((code) => !service.excludes.includes(code));
    }
    if (Array.isArray(service.excludeGroups)) {
      next = next.filter((code) => {
        const current = serviceOptions.find((item: any) => item.code === code);
        return (
          !current?.serviceGroup ||
          !service.excludeGroups.includes(current.serviceGroup.code)
        );
      });
    }
    if (Array.isArray(service.dependencies)) {
      service.dependencies.forEach((code: string) => {
        if (
          !next.includes(code) &&
          serviceOptions.some((item: any) => item.code === code)
        ) {
          next.push(code);
        }
      });
    }
    if (!next.includes(service.code)) next.push(service.code);
    return Array.from(new Set(next));
  };

  const onServiceToggle = (service: any, checked: boolean) => {
    const values = buildNextServices(service, checked);
    setSelectedServices(values);
    createDraft(values, selectedAddress);
  };

  const onSaveDraftServicesChange = async (checked: boolean) => {
    try {
      await updateProfileMutation.mutateAsync({ draftServicesEnable: checked });
      notification.success({ message: t("message.success") });
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.title ||
          error?.message ||
          t("common.error"),
      });
    }
  };

  const onAddressChange = (value: number) => {
    setSelectedAddress(value);
    setAddressModalOpen(false);
    createDraft(selectedServices, value);
  };

  const openAddressList = () => {
    setAddressDraftSelection(selectedAddress || defaultAddressItem?.id);
    setAddressModalOpen(true);
  };

  const openAddressForm = (address?: any) => {
    setReturnToAddressList(addressModalOpen);
    setEditingAddress(address || null);
    setAddressModalOpen(false);
    setAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    setAddressFormOpen(false);
    setEditingAddress(null);
    if (returnToAddressList) {
      setAddressModalOpen(true);
    }
    setReturnToAddressList(false);
  };

  const handleAddressFormSuccess = async () => {
    const result = await refetchAddresses();
    if (returnToAddressList) {
      setAddressDraftSelection((current) => {
        if (
          current &&
          result.data?.data?.some((item: any) => item.id === current)
        )
          return current;
        return (
          result.data?.data?.find((item: any) => item.defaultAddress)?.id ||
          result.data?.data?.[0]?.id
        );
      });
    }
    return result;
  };

  const confirmAddressSelection = () => {
    const value = addressDraftSelection || defaultAddressItem?.id;
    if (value) onAddressChange(value);
  };

  const deleteAddress = async (address: any) => {
    try {
      await deleteAddressMutation.mutateAsync(address.id);
      notification.success({ message: t("message.delete_success") });
      const result = await refetchAddresses();
      const nextAddresses = result.data?.data || [];
      const nextAddress =
        nextAddresses.find((item: any) => item.defaultAddress) ||
        nextAddresses[0];

      if (selectedAddress === address.id) {
        setSelectedAddress(nextAddress?.id);
        setAddressDraftSelection(nextAddress?.id);
        if (nextAddress?.id) createDraft(selectedServices, nextAddress.id);
        return;
      }

      if (addressDraftSelection === address.id) {
        const selectedAddressStillExists = nextAddresses.some(
          (item: any) => item.id === selectedAddress
        );
        setAddressDraftSelection(
          selectedAddressStillExists ? selectedAddress : nextAddress?.id
        );
      }
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.title ||
          error?.message ||
          t("message.delete_failed"),
      });
    }
  };

  const validateTrackingNumbers = (value?: string) => {
    const valid = /^[a-zA-Z0-9.,:_\-\s]*$/.test(value || "");
    setTrackingError(!valid);
    if (!valid) {
      notification.error({ message: t("shipments.invalid_tracking_numbers") });
    }
    return valid;
  };

  const submit = async () => {
    if (!draftShipment?.id) {
      notification.error({ message: t("shipments.choose_service_first") });
      return;
    }
    if (!validateServices()) return;
    if (!selectedAddress) {
      notification.error({ message: t("shipments.choose_address") });
      return;
    }
    await form.validateFields();

    const formValues = form.getFieldsValue(true);
    const fieldValues = financialFields.financialFieldValues;
    const getFieldValue = (name: string) =>
      formValues[name] !== undefined ? formValues[name] : fieldValues[name];
    const normalizeText = (value: any) =>
      value === undefined || value === null ? null : String(value).trim();

    const refTrackingNumbers =
      normalizeText(getFieldValue("refTrackingNumbers")) || "";
    if (!validateTrackingNumbers(refTrackingNumbers)) return;

    const trackingNumbers = Array.from(
      new Set(
        refTrackingNumbers
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
    const expectedPackages = getFieldValue("expectedPackages");

    const payload = {
      draftShipmentId: draftShipment.id,
      note: normalizeText(getFieldValue("note")),
      remark: normalizeText(getFieldValue("remark")),
      refShipmentCode: normalizeText(getFieldValue("refShipmentCode")),
      refCustomerCode: normalizeText(getFieldValue("refCustomerCode")),
      expectedPackages:
        expectedPackages === undefined ||
        expectedPackages === null ||
        expectedPackages === ""
          ? null
          : Number(expectedPackages),
      trackingNumbers,
      ...(isWarehouseEnabled && selectedWarehouse
        ? { receivingWarehouse: selectedWarehouse }
        : {}),
    };

    try {
      await createShipmentMutation.mutateAsync(payload);
      notification.success({ message: t("shipments.create_success") });
      navigate("/shipments");
    } catch (error: any) {
      const title = error?.response?.data?.title || error?.title;
      if (title === "config_group_changed") {
        modal.confirm({
          title: t("shipments.create_confirm_text"),
          okText: t("common.confirm"),
          cancelText: t("button.cancel"),
          onOk: submit,
        });
        return;
      }
      notification.error({
        message:
          title === "warehouse_location_not_mapped"
            ? t("message.warehouse_location_not_mapped")
            : error?.response?.data?.message ||
              error?.message ||
              t("shipments.create_error"),
      });
    }
  };

  return {
    t,
    form,
    profile,
    addressData,
    addressModalOpen,
    addressFormOpen,
    addressDraftSelection,
    editingAddress,
    selectedAddress,
    selectedAddressItem,
    selectedServices,
    selectedServiceObjects,
    selectedWarehouse,
    isWarehouseEnabled,
    serviceOptions,
    visibleGroups,
    serviceGroupErrors,
    draftShipment,
    fees,
    trackingError,
    isAddressLoading,
    isLoading:
      isServicesLoading ||
      isServiceGroupsLoading ||
      isDraftLoading ||
      isAddressLoading,
    createDraftMutation,
    createShipmentMutation,
    deleteAddressMutation,
    updateProfileMutation,
    expectedPackagesValue:
      financialFields.financialFieldValues.expectedPackages,
    refTrackingNumbersValue:
      financialFields.financialFieldValues.refTrackingNumbers,
    refShipmentCodeValue: financialFields.financialFieldValues.refShipmentCode,
    refCustomerCodeValue: financialFields.financialFieldValues.refCustomerCode,
    remarkValue: financialFields.financialFieldValues.remark,
    noteValue: financialFields.financialFieldValues.note,
    disableCustomerOrderNote,
    notification,
    ...financialFields,
    setAddressModalOpen,
    setAddressDraftSelection,
    setSelectedWarehouse,
    setTrackingError,
    openAddressList,
    openAddressForm,
    closeAddressForm,
    handleAddressFormSuccess,
    confirmAddressSelection,
    deleteAddress,
    validateTrackingNumbers,
    isServiceDisabled,
    onServiceToggle,
    onSaveDraftServicesChange,
    submit,
  };
};

export type CreateShipmentPageLogic = ReturnType<typeof useCreateShipmentPage>;
