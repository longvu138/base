import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { notification } from "antd";
import {
  useAddShipmentOriginalReceiptMutation,
  useCreateShipmentProductMutation,
  useCreateShipmentWaybillMutation,
  useDeleteShipmentOriginalReceiptMutation,
  useDeleteShipmentProductMutation,
  useDeleteShipmentWaybillMutation,
  useHarmonizedCommoditiesQuery,
  useParcelStatusesQuery,
  useShipmentActivitiesQuery,
  useShipmentClaimsQuery,
  useShipmentCreditsQuery,
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

  const code = shipment.code as string;
  const currency = shipment.currency || "VND";
  const statusInfo = statusData?.find(
    (status) => status.code === shipment.status,
  );

  const projectInfo = getProjectInfo();
  const taxFreeThreshHold =
    projectInfo?.tenantConfig?.shipmentConfig?.taxFreeThreshHold;
  const shipmentWaybillThreshold =
    projectInfo?.tenantConfig?.generalConfig?.shipmentWaybillThreshold ?? 0;

  const { data: products = [], isLoading: isProductsLoading } =
    useShipmentProductsQuery(code);
  const { data: waybills = [], isLoading: isWaybillsLoading } =
    useShipmentWaybillsQuery(code);
  const { data: parcels = [], isLoading: isParcelsLoading } =
    useShipmentParcelsQuery(code);
  const { data: parcelStatuses = [] } = useParcelStatusesQuery();
  const { data: fees = [], isLoading: isFeesLoading } =
    useShipmentFeesQuery(code);
  const { data: financial = [], isLoading: isFinancialLoading } =
    useShipmentFinancialQuery(code);
  useShipmentFinancialQuery(code, "claim");
  useShipmentFinancialQuery(code, "collect");
  const { data: claims = [], isLoading: isClaimsLoading } =
    useShipmentClaimsQuery(code);
  const { data: milestones = [], isLoading: isMilestonesLoading } =
    useShipmentMilestonesQuery(code);
  const { data: activities, isLoading: isActivitiesLoading } =
    useShipmentActivitiesQuery(code);
  const { data: originalReceipts = [] } =
    useShipmentOriginalReceiptsQuery(code);
  const { data: hsList = [] } = useHarmonizedCommoditiesQuery();
  const { data: credits = [], isLoading: isCreditsLoading } =
    useShipmentCreditsQuery(code);
  const { data: loans, isLoading: isLoansLoading } =
    useShipmentLoansQuery(code);
  const { data: thirdPartyLoans = [] } = useShipmentThirdPartyLoansQuery(
    code,
    !!shipment.contractWithShopkeeper,
  );

  const updateShipment = useUpdateShipmentMutation(code);
  const addOriginalReceipt = useAddShipmentOriginalReceiptMutation(code);
  const deleteOriginalReceipt = useDeleteShipmentOriginalReceiptMutation(code);
  const createProduct = useCreateShipmentProductMutation(code);
  const updateProduct = useUpdateShipmentProductMutation(code);
  const deleteProduct = useDeleteShipmentProductMutation(code);
  const createWaybill = useCreateShipmentWaybillMutation(code);
  const deleteWaybill = useDeleteShipmentWaybillMutation(code);

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
      sum +
      (Number(item.exchangedActualPrice) || 0) * (Number(item.quantity) || 0),
    0,
  );
  const freePackages = taxFreeThreshHold
    ? Math.ceil(totalValueProduct / taxFreeThreshHold)
    : 0;
  const showPackageAlert =
    !!taxFreeThreshHold && totalValueProduct > taxFreeThreshHold;
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
    code,
    currency,
    statusInfo,
    shipmentWaybillThreshold,
    productRows,
    parcelRows,
    activityRows,
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
    financial,
    claims,
    milestones,
    activities,
    originalReceipts,
    hsList,
    credits,
    loans,
    thirdPartyLoans,
    isProductsLoading,
    isWaybillsLoading,
    isParcelsLoading,
    isFeesLoading,
    isFinancialLoading,
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
    addReceipt,
    removeReceipt,
    openProductModal,
    closeProductModal,
    updateProductDraft,
    submitProduct,
    removeProduct,
    submitWaybill,
    removeWaybill,
  };
};
