import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { notification } from "antd";
import { useSearchParams } from "react-router-dom";
import { moneyFormat } from "@repo/util";
import { useTranslation } from "@repo/i18n";
import {
  useAddShipmentOriginalReceiptMutation,
  useApplyShipmentCouponMutation,
  useCancelShipmentMutation,
  useCheckVoucherMutation,
  useCreateShipmentProductMutation,
  useCreateShipmentWaybillMutation,
  useDeleteShipmentOriginalReceiptMutation,
  useDeleteShipmentProductMutation,
  useDeleteShipmentWaybillMutation,
  useHarmonizedCommoditiesQuery,
  useParcelStatusesQuery,
  useWarehouseQuery,
  useShipmentActivitiesQuery,
  useShipmentClaimsQuery,
  useShipmentCouponsQuery,
  useShipmentCreditsQuery,
  useShipmentFeeCategoriesQuery,
  useShipmentFeesQuery,
  useShipmentFinancialQuery,
  useShipmentLoansQuery,
  useShipmentMilestonesQuery,
  useShipmentOriginalReceiptsQuery,
  useShipmentParcelsQuery,
  useShipmentProductsQuery,
  useShipmentThirdPartyLoansQuery,
  useShipmentWaybillsQuery,
  useUpdateShipmentMutation,
  useUpdateShipmentProductMutation,
} from "@repo/hooks";

export type AnyRecord = Record<string, any>;

const empty = "---";
const productPageSize = 25;

const asArray = (value: any): AnyRecord[] =>
  Array.isArray(value) ? value : [];

const sortNewest = (items: AnyRecord[], key = "createdAt") =>
  [...items].sort((a, b) => dayjs(b[key]).valueOf() - dayjs(a[key]).valueOf());

const getProjectInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("currentProjectInfo") || "{}");
  } catch {
    return {};
  }
};

const numberValue = (value: any) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const display = (value: any): string => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && Number.isNaN(value))
  ) {
    return empty;
  }
  return `${value}`;
};

const quantity = (value: any): string => {
  if (value === null || value === undefined || value === "") return empty;
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return display(value);
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
    numericValue,
  );
};

const money = (value: any, currency?: string, noNegative?: boolean): string =>
  moneyFormat(value, currency, noNegative);

const roundShipmentMoney = (value: unknown) => Math.round(value as number);

const feeMoney = (value: any, noNegative?: boolean): string =>
  moneyFormat(roundShipmentMoney(value), undefined, noNegative);

const errorTitle = (error: any) =>
  error?.response?.data?.title ||
  error?.response?.data?.message ||
  error?.title ||
  error?.message;

const logActor = (item: AnyRecord) => ({
  fullname: item.actor?.fullname || item.fullname || empty,
  timestamp: item.timestamp || empty,
  role: item.role,
});

const findNameByCode = (items: AnyRecord[], code: any) =>
  items.find((item) => item.code === code)?.name ?? empty;

const packageLogValue = (property: string, value: any) => {
  let unit = "";
  if (property === "volumetric") unit = " cm3";
  if (
    [
      "netWeight",
      "dimensionalWeight",
      "packagingWeight",
      "actualWeight",
    ].includes(property)
  ) {
    unit = " kg";
  }

  if (typeof value === "number") return `${quantity(value)}${unit}`;
  if (property === "status") return value?.name ?? empty;
  if (value === 0) return `0${unit}`;
  return value || empty;
};

const parseShipmentLogs = ({
  items,
  t,
  currency,
  hsList,
  warehouses,
}: {
  items: AnyRecord[];
  t: (key: string, data?: any) => string;
  currency: string;
  hsList: AnyRecord[];
  warehouses: AnyRecord[];
}) => {
  const logs: AnyRecord[] = [];

  items.forEach((item) => {
    const itemTransform: AnyRecord = logActor(item);
    const activity = item.activity ?? item.type;
    const data = item.data;
    const firstData = Array.isArray(data) ? data[0] : data;

    switch (activity) {
      case "SHIPMENT_WAYBILL_CREATE":
      case "SHIPMENT_WAYBILL_DELETE":
      case "SHIPMENT_PACKAGE_CREATE":
      case "SHIPMENT_PACKAGE_DELETE":
      case "SHIPMENT_DECLARE_VALUE_CREATE":
      case "SHIPMENT_DECLARE_VALUE_DELETE":
        itemTransform.property = activity;
        itemTransform.value =
          activity === "SHIPMENT_DECLARE_VALUE_CREATE" ||
          activity === "SHIPMENT_DECLARE_VALUE_DELETE"
            ? data?.declareValue !== null && data?.declareValue !== undefined
              ? money(data.declareValue)
              : ""
            : data?.code || empty;
        break;
      case "SHIPMENT_STATUS_UPDATE":
        itemTransform.property = activity;
        itemTransform.oldValue = firstData?.oldValue?.name || empty;
        itemTransform.newValue = firstData?.newValue?.name || empty;
        break;
      case "SHIPMENT_DECLARE_VALUE_UPDATE":
        itemTransform.property = activity;
        itemTransform.oldValue =
          data?.[0]?.oldValue !== null && data?.[0]?.oldValue !== undefined
            ? money(data[0].oldValue)
            : empty;
        itemTransform.newValue =
          data?.[0]?.newValue !== null && data?.[0]?.newValue !== undefined
            ? money(data[0].newValue)
            : empty;
        break;
      case "SHIPMENT_PACKAGE_UPDATE":
        if (Array.isArray(data)) {
          itemTransform.logs = data
            .filter((ele) => ele.property)
            .map((ele) => ({
              ...logActor(item),
              property: `SHIPMENT_PACKAGE_UPDATE_${ele.property}`,
              name: item.reference?.code || empty,
              oldValue: packageLogValue(ele.property, ele.oldValue),
              newValue: packageLogValue(ele.property, ele.newValue),
            }));
        } else if (data?.property) {
          itemTransform.property = `SHIPMENT_PACKAGE_UPDATE_${data.property}`;
          itemTransform.name = item.reference?.code || empty;
          itemTransform.oldValue = packageLogValue(
            data.property,
            data.oldValue,
          );
          itemTransform.newValue = packageLogValue(
            data.property,
            data.newValue,
          );
        }
        break;
      case "SHIPMENT_FEE_CREATED":
        itemTransform.property = activity;
        itemTransform.value = data?.type?.name || empty;
        itemTransform.amount = money(
          data?.actualAmount ?? t("shipment_log.empty"),
        );
        itemTransform.reason = data?.reason || empty;
        break;
      case "SHIPMENT_FEE_UPDATE":
        itemTransform.logs = asArray(data).flatMap((ele): AnyRecord[] => {
          const name = item.reference?.type?.name || empty;
          if (ele.property === "reason") {
            return [
              {
                ...logActor(item),
                oldValue: ele.oldValue || t("shipment_log.empty"),
                newValue: ele.newValue,
                name,
                property: "SHIPMENT_FEE_UPDATE_REASON",
              },
            ];
          }
          if (ele.property === "free" && ele.newValue !== ele.oldValue) {
            return [
              {
                ...logActor(item),
                name,
                value:
                  ele.newValue === true
                    ? t("shipment_log.free")
                    : t("shipment_log.cancel_free"),
                property: "SHIPMENT_FEE_UPDATE_FREE",
              },
            ];
          }
          if (ele.property === "amount") {
            return [
              {
                ...logActor(item),
                name,
                oldValue: money(ele.oldValue),
                newValue: money(ele.newValue),
                property: "SHIPMENT_FEE_UPDATE_AMOUNT",
              },
            ];
          }
          return [];
        });
        break;
      case "SHIPMENT_SERVICE_UPDATE":
        if (data?.[0]?.type === "SIMPLE_VALUE_CHANGE") {
          itemTransform.logs = [
            { ...logActor(item), property: `${activity}_SIMPLE_VALUE_CHANGE` },
          ];
        } else {
          itemTransform.logs = (
            [
              ...asArray(data?.[0]?.addedValues).map((ele) => ({
                ...logActor(item),
                property: `${activity}_ADD`,
                addValue: ele.name,
              })),
              ...asArray(data?.[0]?.removedValues).map((ele) => ({
                ...logActor(item),
                property: `${activity}_REMOVE`,
                removeValue: ele.name,
              })),
            ] as AnyRecord[]
          ).filter((ele) => ele.addValue || ele.removeValue);
        }
        break;
      case "SHIPMENT_SERVICE_APPROVED":
        itemTransform.logs = asArray(data).map((ele) => ({
          ...logActor(item),
          property: ele.newValue ? `${activity}_ADD` : `${activity}_REMOVE`,
          service: item.reference?.name,
        }));
        break;
      case "SHIPMENT_ADDRESS_UPDATE":
        itemTransform.logs = asArray(data).flatMap((ele) => {
          if (
            ele.property === "location" &&
            ele.oldValue?.display !== ele.newValue?.display
          ) {
            return [
              {
                ...logActor(item),
                property: "SHIPMENT_ADDRESS_UPDATE_LOCATION",
                oldValue: ele.oldValue?.display || t("shipment_log.empty"),
                newValue: ele.newValue?.display || t("shipment_log.empty"),
              },
            ];
          }
          if (ele.property === "note") {
            const oldValue = ele.oldValue?.toString().trim();
            const newValue = ele.newValue?.toString().trim();
            if (
              (oldValue && newValue && oldValue !== newValue) ||
              (!oldValue && newValue)
            ) {
              return [
                {
                  ...logActor(item),
                  property: "SHIPMENT_ADDRESS_UPDATE_note",
                  oldValue: oldValue || t("shipment_log.empty"),
                  newValue: newValue || t("shipment_log.empty"),
                },
              ];
            }
            return [];
          }
          if (
            ele.property &&
            ele.oldValue &&
            ele.newValue &&
            ele.oldValue.toString() !== ele.newValue.toString()
          ) {
            return [
              {
                ...logActor(item),
                property: `SHIPMENT_ADDRESS_UPDATE_${ele.property}`,
                oldValue: ele.oldValue,
                newValue: ele.newValue,
              },
            ];
          }
          return [];
        });
        break;
      case "SHIPMENT_UPDATE":
        if (Array.isArray(data) && data.length > 0) {
          itemTransform.property = data[0].property;
          if (itemTransform.property === "status") {
            itemTransform.property = "SHIPMENT_STATUS_UPDATE";
            itemTransform.oldValue = data[0].oldValue?.name || empty;
            itemTransform.newValue = data[0].newValue?.name || empty;
          } else if (itemTransform.property === "hsCode") {
            itemTransform.oldValue = findNameByCode(hsList, data[0].oldValue);
            itemTransform.newValue = findNameByCode(hsList, data[0].newValue);
          } else if (
            itemTransform.property === "expectedPackages" ||
            itemTransform.property === "actualPackages"
          ) {
            itemTransform.oldValue = quantity(data[0].oldValue);
            itemTransform.newValue = quantity(data[0].newValue);
          } else if (itemTransform.property === "declareValue") {
            itemTransform.oldValue = feeMoney(data[0].oldValue);
            itemTransform.newValue = feeMoney(data[0].newValue);
          } else if (
            ["refShipmentCode", "refCustomerCode", "staffNote"].includes(
              itemTransform.property,
            )
          ) {
            itemTransform.oldValue = data[0].oldValue || empty;
            itemTransform.newValue = data[0].newValue || empty;
          } else {
            itemTransform.oldValue = findNameByCode(
              warehouses,
              data[0].oldValue,
            );
            itemTransform.newValue = findNameByCode(
              warehouses,
              data[0].newValue,
            );
          }
        }
        break;
      case "payment":
      case "claim":
      case "emd":
      case "refund":
      case "collect":
      case "gift":
      case "deposit":
      case "charge":
      case "withdraw":
      case "adjust":
      case "SHIPMENT_CANCELLED":
        itemTransform.reason = item.memo || empty;
        itemTransform.property = activity;
        itemTransform.amount =
          activity === "emd"
            ? money(item.amount).toString().replace("-", "")
            : money(item.amount);
        break;
      case "SHIPMENT_COUPON_APPLY":
        itemTransform.property = activity;
        itemTransform.content = data
          ? `${data.code} - ${data.description}`
          : "";
        break;
      case "SHIPMENT_PRODUCT_DELETE":
      case "SHIPMENT_PRODUCT_CREATE":
        itemTransform.property = activity;
        itemTransform.value = data?.name || empty;
        itemTransform.code = data?.code || empty;
        break;
      case "SHIPMENT_PRODUCT_UPDATE":
        itemTransform.logs = asArray(data).map((ele) => ({
          ...logActor(item),
          property: `SHIPMENT_PRODUCT_UPDATE_${ele.property}`,
          oldValue:
            ele.property === "quantity"
              ? quantity(ele.oldValue)
              : ele.property === "unitPrice"
                ? money(roundShipmentMoney(ele.oldValue), currency)
                : ele.oldValue || empty,
          newValue:
            ele.property === "quantity"
              ? quantity(ele.newValue)
              : ele.property === "unitPrice"
                ? money(roundShipmentMoney(ele.newValue), currency)
                : ele.newValue || empty,
          name: item.reference?.code || empty,
        }));
        break;
      case "SHIPMENT_RECEIPT_DELETE":
      case "SHIPMENT_RECEIPT_CREATE":
        itemTransform.property = activity;
        itemTransform.code = data?.code || empty;
        break;
      default:
        break;
    }

    if (itemTransform.logs?.length > 0) logs.push(...itemTransform.logs);
    else if (itemTransform.property) logs.push(itemTransform);
  });

  return logs;
};

const buildWaybillRows = (
  waybills: AnyRecord[],
  parcels: AnyRecord[],
  statusInfo?: AnyRecord,
) => {
  let rows: AnyRecord[] = [];
  const hasDetachedParcel = parcels.some(
    (parcel) =>
      !parcel.waybillCode ||
      !waybills.some((waybill) => waybill.code === parcel.waybillCode),
  );

  if (hasDetachedParcel && parcels.length > 0) {
    parcels
      .filter(
        (parcel) =>
          parcel.waybillCode &&
          !waybills.some((waybill) => waybill.code === parcel.waybillCode),
      )
      .forEach((parcel) => {
        if (!rows.some((row) => row.code === parcel.waybillCode)) {
          rows.push({ code: parcel.waybillCode, createdAt: parcel.createdAt });
        }
      });

    if (parcels.some((parcel) => !parcel.waybillCode)) {
      rows = [
        ...(statusInfo?.updatable === false ? [] : [{ code: null }]),
        { code: "Chưa có mã", emptyWaybill: true },
        ...rows,
        ...waybills,
      ];
    } else {
      rows = [
        ...(statusInfo?.updatable === false ? [] : [{ code: null }]),
        ...rows,
        ...waybills,
      ];
    }
  } else {
    rows = [
      ...(statusInfo?.updatable === false ? [] : [{ code: null }]),
      ...waybills,
    ];
  }

  return rows;
};

interface UseShipmentDetailContentParams {
  shipment: AnyRecord;
  statusData?: AnyRecord[];
}

export const useShipmentDetailContent = ({
  shipment,
  statusData,
}: UseShipmentDetailContentParams) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExpand, setIsExpand] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<any>(null);
  const [originalReceiptModalOpen, setOriginalReceiptModalOpen] =
    useState(false);
  const [originalReceiptCode, setOriginalReceiptCode] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<AnyRecord | null>(null);
  const [productDraft, setProductDraft] = useState<AnyRecord>({});
  const [productErrors, setProductErrors] = useState<Record<string, string>>(
    {},
  );
  const [isCreatingWaybill, setIsCreatingWaybill] = useState(false);
  const [waybillCodeDraft, setWaybillCodeDraft] = useState("");
  const [isProductExpanded, setIsProductExpanded] = useState(false);
  const [expandedWaybillKeys, setExpandedWaybillKeys] = useState<any[]>([]);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [feeTableConfig, setFeeTableConfig] = useState<AnyRecord | null>(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponValidMessage, setCouponValidMessage] = useState("");
  const [couponValidTo, setCouponValidTo] = useState<any>(null);
  const [couponValid, setCouponValid] = useState(false);

  const code = shipment.code as string;
  const currency = shipment.currency || "VND";
  const statusInfo = statusData?.find(
    (status) => status.code === shipment.status,
  );

  const projectInfo = getProjectInfo();
  const projectConfig = projectInfo?.tenantConfig || {};
  const taxFreeThreshHold = projectConfig?.shipmentConfig?.taxFreeThreshHold;
  const shipmentWaybillThreshold =
    projectConfig?.generalConfig?.shipmentWaybillThreshold ?? 0;

  const { data: products = [], isLoading: isProductsLoading } =
    useShipmentProductsQuery(code);
  const { data: waybills = [], isLoading: isWaybillsLoading } =
    useShipmentWaybillsQuery(code);
  const { data: parcels = [], isLoading: isParcelsLoading } =
    useShipmentParcelsQuery(code);
  const { data: parcelStatuses = [] } = useParcelStatusesQuery();
  const { data: fees = [], isLoading: isFeesLoading } =
    useShipmentFeesQuery(code);
  const { data: shipmentFees = [] } = useShipmentFeeCategoriesQuery();
  const { data: financial = [], isLoading: isFinancialLoading } =
    useShipmentFinancialQuery(code);
  const { data: financialClaim = [], isLoading: isFinancialClaimLoading } =
    useShipmentFinancialQuery(code, "claim");
  const { data: financialCollect = [], isLoading: isFinancialCollectLoading } =
    useShipmentFinancialQuery(code, "collect");
  const { data: claims = [], isLoading: isClaimsLoading } =
    useShipmentClaimsQuery(code);
  const { data: coupons = [] } = useShipmentCouponsQuery(code);
  const { data: milestones = [], isLoading: isMilestonesLoading } =
    useShipmentMilestonesQuery(code);
  const { data: activities, isLoading: isActivitiesLoading } =
    useShipmentActivitiesQuery(code);
  const { data: originalReceipts = [] } =
    useShipmentOriginalReceiptsQuery(code);
  const { data: hsList = [] } = useHarmonizedCommoditiesQuery();
  const { data: receivingWarehouses = [] } = useWarehouseQuery(false);
  const { data: deliveryWarehouses = [] } = useWarehouseQuery(true);
  const showCreditTab = !!shipment.contractWithShopkeeper;
  const { data: credits = [], isLoading: isCreditsLoading } =
    useShipmentCreditsQuery(code, showCreditTab);
  const { data: loans, isLoading: isLoansLoading } = useShipmentLoansQuery(
    code,
    showCreditTab,
  );
  const { data: thirdPartyLoans = [] } = useShipmentThirdPartyLoansQuery(
    code,
    showCreditTab,
  );

  const updateShipment = useUpdateShipmentMutation(code);
  const cancelShipment = useCancelShipmentMutation(code);
  const addOriginalReceipt = useAddShipmentOriginalReceiptMutation(code);
  const deleteOriginalReceipt = useDeleteShipmentOriginalReceiptMutation(code);
  const createProduct = useCreateShipmentProductMutation(code);
  const updateProduct = useUpdateShipmentProductMutation(code);
  const deleteProduct = useDeleteShipmentProductMutation(code);
  const createWaybill = useCreateShipmentWaybillMutation(code);
  const deleteWaybill = useDeleteShipmentWaybillMutation(code);
  const checkVoucher = useCheckVoucherMutation();
  const applyShipmentCoupon = useApplyShipmentCouponMutation(code);

  const productRows = useMemo(
    () =>
      sortNewest(
        asArray(products).length > 0
          ? asArray(products)
          : asArray(shipment.products ?? shipment.items),
      ),
    [products, shipment.items, shipment.products],
  );
  const parcelRows = useMemo(
    () =>
      asArray(parcels).length > 0
        ? asArray(parcels)
        : asArray(shipment.parcels ?? shipment.packages),
    [parcels, shipment.packages, shipment.parcels],
  );
  const activityRows = useMemo(() => asArray(activities?.data), [activities]);

  const hsCode = asArray(hsList).find((item) => item.code === shipment.hsCode);
  const receiptText = asArray(originalReceipts)
    .map((item) => item.code)
    .join(", ");
  const services = asArray(shipment.services);
  const totalValueProduct = productRows.reduce(
    (sum, item) =>
      sum + numberValue(item.exchangedActualPrice) * numberValue(item.quantity),
    0,
  );
  const numericTaxFreeThreshHold = numberValue(taxFreeThreshHold);
  const freePackages = numericTaxFreeThreshHold
    ? Math.ceil(totalValueProduct / numericTaxFreeThreshHold)
    : 0;
  const showPackageAlert =
    !!numericTaxFreeThreshHold && totalValueProduct > numericTaxFreeThreshHold;
  const activeThirdPartyLoan = asArray(thirdPartyLoans).find(
    (item) => item.status === "ACTIVE",
  );
  const totalNeedPay =
    (Number(shipment.totalUnpaid) || 0) +
    (activeThirdPartyLoan
      ? Number(activeThirdPartyLoan.totalAmountPay) || 0
      : 0);
  const waybillRows = useMemo(
    () => buildWaybillRows(asArray(waybills), parcelRows, statusInfo),
    [parcelRows, statusInfo, waybills],
  );
  const warehouses = useMemo(
    () => [...asArray(receivingWarehouses), ...asArray(deliveryWarehouses)],
    [deliveryWarehouses, receivingWarehouses],
  );
  const validTabKeys = useMemo(
    () => [
      "PRODUCT",
      "SHIPPING",
      ...(shipment.contractWithShopkeeper ? ["CREDIT"] : []),
      "FEES",
      "FINANCE",
      "TICKETS",
      "HISTORY",
      "LOG",
    ],
    [shipment.contractWithShopkeeper],
  );
  const requestedTab = searchParams.get("tab") || "";
  const normalizedTab = requestedTab === "WAYBILLS" ? "SHIPPING" : requestedTab;
  const activeTab = validTabKeys.includes(normalizedTab)
    ? normalizedTab || "PRODUCT"
    : "PRODUCT";
  const visibleProductRows = isProductExpanded
    ? productRows
    : productRows.slice(0, productPageSize);
  const shipmentLogRows = useMemo(
    () =>
      parseShipmentLogs({
        items: activityRows,
        t,
        currency,
        hsList,
        warehouses,
      }),
    [activityRows, currency, hsList, t, warehouses],
  );

  const handleTabChange = (key: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", key);
    setSearchParams(nextParams);
  };

  const resetCouponModal = () => {
    setCouponCode("");
    setCouponValidMessage("");
    setCouponValidTo(null);
    setCouponValid(false);
  };

  const openCouponModal = () => {
    resetCouponModal();
    setCouponModalOpen(true);
  };

  const closeCouponModal = () => {
    setCouponModalOpen(false);
    resetCouponModal();
  };

  const changeCouponCode = (nextCode: string) => {
    setCouponCode(nextCode);
    setCouponValid(false);
    setCouponValidMessage("");
    setCouponValidTo(null);
  };

  const checkCouponCode = async () => {
    const nextCode = couponCode.trim();
    if (!nextCode) return;

    try {
      const voucher = await checkVoucher.mutateAsync({
        code: nextCode,
        orderCode: shipment.code,
        isShipment: true,
      });
      if (voucher?.code) {
        setCouponValid(true);
        setCouponValidMessage(voucher.description || "");
        setCouponValidTo(voucher.validTo);
      } else {
        setCouponValid(false);
        setCouponValidTo(null);
        setCouponValidMessage(t("message.coupon_invalid_for_you"));
      }
    } catch (error: any) {
      const title = errorTitle(error) || "coupon_invalid_for_you";
      setCouponValid(false);
      setCouponValidTo(null);
      setCouponValidMessage(t(`message.${title}`));
    }
  };

  const submitCouponCode = async () => {
    if (!couponValid) return;

    try {
      await applyShipmentCoupon.mutateAsync({ couponCode: couponCode.trim() });
      notification.success({ message: t("message.coupon_apply_success") });
      closeCouponModal();
    } catch (error: any) {
      const title = errorTitle(error) || "coupon_invalid_for_you";
      notification.error({ message: t(`message.${title}`) });
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraftValue(null);
  };

  const startEdit = (field: string, value: any) => {
    setEditingField(field);
    setDraftValue(value ?? null);
  };

  const saveShipmentField = async (field: string, value: any) => {
    try {
      await updateShipment.mutateAsync({ [field]: value });
      notification.success({ message: "Cập nhật thành công" });
      cancelEdit();
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Cập nhật thất bại",
      });
    }
  };

  const cancelShipmentOrder = async () => {
    if (cancelShipment.isPending) return;

    try {
      await cancelShipment.mutateAsync();
      notification.success({ message: t("orderDetail.order_cancel") });
    } catch (error: any) {
      const title = errorTitle(error);
      notification.error({
        message:
          title === "shipment_status_not_allow"
            ? t("message.shipment_status_not_allow")
            : title
              ? t(`message.${title}`)
              : t("message.update_failed"),
      });
    }
  };

  const addReceipt = async () => {
    const nextCode = originalReceiptCode.trim();
    if (!nextCode) return;
    try {
      await addOriginalReceipt.mutateAsync({ code: nextCode });
      notification.success({ message: "Cập nhật thành công" });
      setOriginalReceiptCode("");
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Cập nhật thất bại",
      });
    }
  };

  const removeReceipt = async (receipt: AnyRecord) => {
    try {
      await deleteOriginalReceipt.mutateAsync({ code: receipt.code });
      notification.success({ message: "Cập nhật thành công" });
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Cập nhật thất bại",
      });
    }
  };

  const openProductModal = (product?: AnyRecord) => {
    setCurrentProduct(product ?? null);
    setProductDraft(product ? { ...product } : {});
    setProductErrors({});
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setCurrentProduct(null);
    setProductDraft({});
    setProductErrors({});
    setProductModalOpen(false);
  };

  const updateProductDraft = (field: string, value: any) => {
    setProductDraft((current) => ({ ...current, [field]: value }));
    setProductErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateProductDraft = () => {
    const nextErrors: Record<string, string> = {};
    ["productUrl", "quantity", "unitPrice", "name", "translatedName"].forEach(
      (field) => {
        const value = productDraft[field];
        if (value !== 0 && (!value || !value.toString().trim())) {
          nextErrors[field] = "Không thể để trống";
        }
      },
    );

    if (productDraft.productUrl) {
      try {
        new URL(productDraft.productUrl);
      } catch {
        nextErrors.productUrl = "Link không hợp lệ";
      }
    }

    setProductErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitProduct = async () => {
    if (!validateProductDraft()) return;
    try {
      if (currentProduct?.code) {
        const payload = Object.keys(productDraft).reduce(
          (result: AnyRecord, key) => {
            if (productDraft[key] !== currentProduct[key]) {
              result[key] = productDraft[key];
            }
            return result;
          },
          {},
        );
        await updateProduct.mutateAsync({
          productCode: currentProduct.code,
          payload,
        });
      } else {
        await createProduct.mutateAsync(productDraft);
      }
      notification.success({ message: "Cập nhật thành công" });
      closeProductModal();
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Cập nhật thất bại",
      });
    }
  };

  const removeProduct = async (productCode: string) => {
    try {
      await deleteProduct.mutateAsync(productCode);
      notification.success({ message: "Xóa thành công" });
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message || error?.message || "Xóa thất bại",
      });
    }
  };

  const submitWaybill = async () => {
    const nextCode = waybillCodeDraft.trim();
    if (!nextCode) return;
    try {
      await createWaybill.mutateAsync(nextCode);
      notification.success({ message: "Tạo mã vận đơn thành công" });
      setWaybillCodeDraft("");
      setIsCreatingWaybill(false);
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Tạo mã vận đơn thất bại",
      });
    }
  };

  const removeWaybill = async (nextWaybillCode: string) => {
    try {
      await deleteWaybill.mutateAsync(nextWaybillCode);
      notification.success({ message: "Xóa mã vận đơn thành công" });
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Xóa mã vận đơn thất bại",
      });
    }
  };

  return {
    isExpand,
    setIsExpand,
    editingField,
    draftValue,
    setDraftValue,
    originalReceiptModalOpen,
    setOriginalReceiptModalOpen,
    originalReceiptCode,
    setOriginalReceiptCode,
    productModalOpen,
    currentProduct,
    productDraft,
    productErrors,
    isCreatingWaybill,
    setIsCreatingWaybill,
    waybillCodeDraft,
    setWaybillCodeDraft,
    isProductExpanded,
    setIsProductExpanded,
    expandedWaybillKeys,
    setExpandedWaybillKeys,
    claimModalOpen,
    setClaimModalOpen,
    collectModalOpen,
    setCollectModalOpen,
    feeTableConfig,
    setFeeTableConfig,
    couponModalOpen,
    couponCode,
    changeCouponCode,
    couponValidMessage,
    couponValidTo,
    couponValid,
    checkVoucher,
    applyShipmentCoupon,
    cancelShipment,
    activeTab,
    handleTabChange,
    code,
    currency,
    statusInfo,
    shipmentWaybillThreshold,
    productRows,
    visibleProductRows,
    parcelRows,
    activityRows,
    shipmentLogRows,
    hsCode,
    receiptText,
    services,
    freePackages,
    showPackageAlert,
    taxFreeThreshHold,
    activeThirdPartyLoan,
    totalNeedPay,
    waybillRows,
    products,
    waybills,
    parcels,
    parcelStatuses,
    fees,
    shipmentFees,
    financial,
    financialClaim,
    financialCollect,
    claims,
    coupons,
    milestones,
    activities,
    originalReceipts,
    hsList,
    warehouses,
    credits,
    loans,
    thirdPartyLoans,
    isProductsLoading,
    isWaybillsLoading,
    isParcelsLoading,
    isFeesLoading,
    isFinancialLoading,
    isFinancialClaimLoading,
    isFinancialCollectLoading,
    isClaimsLoading,
    isMilestonesLoading,
    isActivitiesLoading,
    isCreditsLoading,
    isLoansLoading,
    updateShipment,
    addOriginalReceipt,
    deleteOriginalReceipt,
    createProduct,
    updateProduct,
    deleteProduct,
    createWaybill,
    deleteWaybill,
    startEdit,
    cancelEdit,
    saveShipmentField,
    cancelShipmentOrder,
    addReceipt,
    removeReceipt,
    openProductModal,
    closeProductModal,
    updateProductDraft,
    submitProduct,
    removeProduct,
    submitWaybill,
    removeWaybill,
    openCouponModal,
    closeCouponModal,
    checkCouponCode,
    submitCouponCode,
  };
};
