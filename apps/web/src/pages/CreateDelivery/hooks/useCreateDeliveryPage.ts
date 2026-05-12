import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "antd";
import { useTranslation } from "@repo/i18n";
import {
  useAvailableDeliveryOrdersQuery,
  useCreateDeliveryRequestMutation,
  usePackageStatusesQuery,
  useParcelStatusesQuery,
  useShippingMethodsQuery,
} from "@repo/hooks";

type DeliveryPackage = {
  code: string;
  orderCode?: string;
  actualWeight?: number;
  weight?: number;
  dimensionalWeight?: number;
  shippingFee?: number;
  isShipment?: boolean;
  [key: string]: any;
};

const withPackageMeta = (order: any) =>
  (order?.packages || []).map((item: DeliveryPackage) => ({
    ...item,
    orderCode: item.orderCode || order.code,
    isShipment: Boolean(item.isShipment ?? order.isShipment),
  }));

const sumWeight = (items: DeliveryPackage[]) =>
  Number(
    items
      .reduce(
        (total, item) =>
          total +
          Number(item.actualWeight ?? item.weight ?? item.dimensionalWeight ?? 0),
        0,
      )
      .toFixed(4),
  );

export const useCreateDeliveryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedPackageCodes, setSelectedPackageCodes] = useState<string[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  const { data: availableOrders = [], isLoading: isAvailableOrdersLoading } =
    useAvailableDeliveryOrdersQuery();
  const { data: packageStatuses = [] } = usePackageStatusesQuery();
  const { data: parcelStatuses = [] } = useParcelStatusesQuery();
  const { data: shippingMethods = [] } = useShippingMethodsQuery();
  const createDelivery = useCreateDeliveryRequestMutation();

  const allPackages = useMemo(
    () => availableOrders.flatMap((order: any) => withPackageMeta(order)),
    [availableOrders],
  );

  useEffect(() => {
    setSelectedPackageCodes(allPackages.map((item: DeliveryPackage) => item.code));
  }, [allPackages]);

  const selectedPackages = useMemo(
    () => allPackages.filter((item: DeliveryPackage) => selectedPackageCodes.includes(item.code)),
    [allPackages, selectedPackageCodes],
  );

  const selectedCodeSet = useMemo(
    () => new Set(selectedPackageCodes),
    [selectedPackageCodes],
  );

  const getOrderPackages = (order: any) => withPackageMeta(order);

  const isOrderChecked = (order: any) => {
    const packages = getOrderPackages(order);
    return packages.length > 0 && packages.every((item: DeliveryPackage) => selectedCodeSet.has(item.code));
  };

  const isOrderIndeterminate = (order: any) => {
    const packages = getOrderPackages(order);
    const selectedCount = packages.filter((item: DeliveryPackage) => selectedCodeSet.has(item.code)).length;
    return selectedCount > 0 && selectedCount < packages.length;
  };

  const togglePackage = (code: string, checked: boolean) => {
    setSelectedPackageCodes((prev) =>
      checked ? Array.from(new Set([...prev, code])) : prev.filter((item) => item !== code),
    );
  };

  const toggleOrder = (order: any, checked: boolean) => {
    const packageCodes = getOrderPackages(order).map((item: DeliveryPackage) => item.code);
    setSelectedPackageCodes((prev) =>
      checked
        ? Array.from(new Set([...prev, ...packageCodes]))
        : prev.filter((item) => !packageCodes.includes(item)),
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelectedPackageCodes(checked ? allPackages.map((item: DeliveryPackage) => item.code) : []);
  };

  const isAllChecked =
    allPackages.length > 0 && selectedPackageCodes.length === allPackages.length;
  const isAllIndeterminate =
    selectedPackageCodes.length > 0 && selectedPackageCodes.length < allPackages.length;

  const totalWeight = sumWeight(selectedPackages);

  const totalAmount = useMemo(() => {
    const selectedOrders = new Set(selectedPackages.map((item: DeliveryPackage) => item.orderCode));

    return Number(
      availableOrders
        .filter((order: any) => selectedOrders.has(order.code))
        .reduce((total: number, order: any) => {
          if (!order.isShipment) return total + Number(order.totalUnpaid || 0);

          const unselectedShippingFee = getOrderPackages(order)
            .filter((item: DeliveryPackage) => !selectedCodeSet.has(item.code))
            .reduce(
            (sum: number, item: DeliveryPackage) => sum + Number(item.shippingFee || 0),
            0,
          );
          return total + Number(order.needToPaid || 0) - unselectedShippingFee;
        }, 0)
        .toFixed(4),
    );
  }, [availableOrders, selectedPackages, selectedCodeSet]);

  const buildPayload = (values: any) => {
    const orders: Array<{ orderCode: string; packages: string[] }> = [];
    const shipments: Array<{ orderCode: string; packages: string[] }> = [];

    selectedPackages.forEach((item: DeliveryPackage) => {
      const target = item.isShipment ? shipments : orders;
      const current = target.find((row) => row.orderCode === item.orderCode);
      if (current) current.packages.push(item.code);
      else target.push({ orderCode: item.orderCode || "", packages: [item.code] });
    });

    return {
      orders,
      shipments,
      cod: true,
      note: values.note,
      ...(values.shippingMethodCode
        ? { shippingMethodCode: values.shippingMethodCode }
        : {}),
    };
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!selectedPackages.length) {
      return Promise.reject(new Error(t("delivery.warning_create")));
    }

    await createDelivery.mutateAsync(buildPayload(values));
    navigate("/delivery-requests");
  };

  return {
    t,
    form,
    availableOrders,
    packageStatuses,
    parcelStatuses,
    shippingMethods,
    isAvailableOrdersLoading,
    createDelivery,
    selectedPackageCodes,
    selectedPackages,
    selectedCodeSet,
    expandedRowKeys,
    setExpandedRowKeys,
    isAllChecked,
    isAllIndeterminate,
    totalAmount,
    totalWeight,
    allPackages,
    getOrderPackages,
    isOrderChecked,
    isOrderIndeterminate,
    togglePackage,
    toggleOrder,
    toggleAll,
    handleSubmit,
  };
};
