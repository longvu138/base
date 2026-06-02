import { useMemo, useState } from "react";
import { App } from "antd";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "@repo/i18n";
import { moneyFormat } from "@repo/util";
import {
  useAddPeerPaymentOriginalReceiptMutation,
  useCancelPeerPaymentMutation,
  useChargePeerPaymentMutation,
  useDeletePeerPaymentOriginalReceiptsMutation,
  usePeerPaymentExchangeRateMutation,
  usePeerPaymentOriginalReceiptsQuery,
  usePeerPaymentQuery,
  usePeerPaymentStatusesQuery,
  usePeerPaymentTenantConfigQuery,
} from "../usePeerPaymentHooks";
import { useCustomerBalance } from "../useCustomerHooks";

const listTypePeerPayment = ["payment", "taobao_global"];

const isInSuspensionTime = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return false;
  const current = Date.now();
  return current > new Date(startTime).getTime() && current < new Date(endTime).getTime();
};

export const usePeerPaymentDetailPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [newOriginalReceipt, setNewOriginalReceipt] = useState("");
  const [receiptCodesToDelete, setReceiptCodesToDelete] = useState<string[]>([]);
  const [receiptCodesToAdd, setReceiptCodesToAdd] = useState<string[]>([]);
  const [exchangeRateByAmount, setExchangeRateByAmount] = useState<any>({});
  const [checkingExchange, setCheckingExchange] = useState(false);
  const activeTab = searchParams.get("tab") || "fees";

  const { data: dataDetail = {}, isLoading, isError } = usePeerPaymentQuery(id);
  const { data: statuses = [] } = usePeerPaymentStatusesQuery();
  const { data: listOriginalReceipts = [] } = usePeerPaymentOriginalReceiptsQuery(id);
  const { data: globalTenantConfig = {} } = usePeerPaymentTenantConfigQuery();
  const { data: userBalance = {}, refetch: refetchUserBalance } = useCustomerBalance();
  const chargeMutation = useChargePeerPaymentMutation();
  const cancelMutation = useCancelPeerPaymentMutation();
  const exchangeRateMutation = usePeerPaymentExchangeRateMutation();
  const addOriginalReceiptMutation = useAddPeerPaymentOriginalReceiptMutation(id);
  const deleteOriginalReceiptsMutation = useDeletePeerPaymentOriginalReceiptsMutation(id);

  const itemStatus = statuses.find((item: any) => item.code === dataDetail.status) || {};
  const stringListOriginalReceipts =
    Array.isArray(listOriginalReceipts) && listOriginalReceipts.length
      ? listOriginalReceipts.map((item: any) => item.code).join(", ")
      : "---";
  const isShowShipmentCode =
    globalTenantConfig?.config?.shipmentRequired === true &&
    listTypePeerPayment.includes(dataDetail.peerPaymentType);
  const suspensionSchedule = globalTenantConfig?.suspensionSchedule;
  const isInSuspensionSchedule =
    suspensionSchedule &&
    isInSuspensionTime(suspensionSchedule.startTime, suspensionSchedule.endTime);
  const contractWithShopkeeper = dataDetail.contractWithShopkeeper || "";
  const hasCredit = contractWithShopkeeper === "CONTRACTED" || contractWithShopkeeper === "NOSHOW";
  const visibleReceipts = useMemo(
    () => [
      ...(Array.isArray(listOriginalReceipts) ? listOriginalReceipts : []).filter(
        (item: any) => !receiptCodesToDelete.includes(String(item.code || "").trim()),
      ),
      ...receiptCodesToAdd.map((code) => ({ code, draft: true })),
    ],
    [listOriginalReceipts, receiptCodesToAdd, receiptCodesToDelete],
  );
  const isReceiptSaving =
    addOriginalReceiptMutation.isPending || deleteOriginalReceiptsMutation.isPending;
  const newExchangedAmount =
    Number(dataDetail.amount || 0) * Number(exchangeRateByAmount.rate || 0);
  const showPayButton =
    (dataDetail.status === "WAIT_FOR_PAYMENT" || dataDetail.status === "REQUEST_FOR_PAY") &&
    Number(dataDetail.totalUnpaid || 0) > 0;
  const showCancelButton = ["WAIT_FOR_PAYMENT", "PAYMENT_PAID", "REQUEST_FOR_PAY"].includes(
    dataDetail.status,
  );

  const setActiveTab = (tab: string) => setSearchParams({ tab });

  const openReceiptModal = () => {
    setReceiptCodesToDelete([]);
    setReceiptCodesToAdd([]);
    setNewOriginalReceipt("");
    setModalOpen(true);
  };

  const closeReceiptModal = () => {
    setModalOpen(false);
    setNewOriginalReceipt("");
    setReceiptCodesToDelete([]);
    setReceiptCodesToAdd([]);
  };

  const handleAddReceipt = () => {
    const nextCode = newOriginalReceipt.trim();
    if (!nextCode || isReceiptSaving) return;

    const isExisting = (Array.isArray(listOriginalReceipts) ? listOriginalReceipts : []).some(
      (receipt: any) => String(receipt.code || "").trim() === nextCode,
    );
    const isDeleted = receiptCodesToDelete.includes(nextCode);
    const isDrafted = receiptCodesToAdd.includes(nextCode);

    if ((isExisting && !isDeleted) || isDrafted) {
      notification.error({
        message: t("shipments.OriginalReceipt_duplicate_code"),
      });
      return;
    }

    if (isDeleted) {
      setReceiptCodesToDelete((current) => current.filter((code) => code !== nextCode));
    } else {
      setReceiptCodesToAdd((current) => [...current, nextCode]);
    }

    setNewOriginalReceipt("");
  };

  const markReceiptForDelete = (receipt: any) => {
    const receiptCode = String(receipt.code || "").trim();
    if (!receiptCode || isReceiptSaving) return;

    if (receipt.draft) {
      setReceiptCodesToAdd((current) => current.filter((code) => code !== receiptCode));
      return;
    }

    setReceiptCodesToDelete((current) =>
      current.includes(receiptCode) ? current : [...current, receiptCode],
    );
  };

  const handleSaveReceipts = async () => {
    if (!receiptCodesToDelete.length && !receiptCodesToAdd.length) {
      closeReceiptModal();
      return;
    }

    try {
      if (receiptCodesToDelete.length) {
        await deleteOriginalReceiptsMutation.mutateAsync(receiptCodesToDelete);
      }

      for (const receiptCode of receiptCodesToAdd) {
        await addOriginalReceiptMutation.mutateAsync({ code: receiptCode });
      }

      notification.success({ message: t("message.update_success") });
      closeReceiptModal();
    } catch (error: any) {
      const title = error?.response?.data?.title || error?.title;
      notification.error({
        message:
          title === "duplicate_code"
            ? t("shipments.OriginalReceipt_duplicate_code")
            : title === "action_do_not_allow"
              ? t("waybill.action_do_not_allow")
              : t(error?.response?.data?.message || error?.message || "error.oops"),
      });
    }
  };

  const handleCharge = async () => {
    let latestBalance = userBalance;
    try {
      const balanceResponse = await refetchUserBalance();
      latestBalance = balanceResponse.data || userBalance;
      await chargeMutation.mutateAsync(dataDetail.code);
      notification.success({ message: t("message.success") });
    } catch (error: any) {
      const title = error?.response?.data?.title || error?.title;
      if (title === "invalid_amount") {
        notification.error({ message: t("peer_payment.invalid_amount") });
      } else if (title === "insufficient_balance") {
        const topUpMoney =
          Number(dataDetail.totalFee || 0) +
          Number(dataDetail.exchangedAmount || 0) -
          (Number(latestBalance?.balance || 0) + Number(latestBalance?.creditLimit || 0));
        notification.error({
          message: t("cartCheckout.notEnoughMoney").replace("${money}", moneyFormat(topUpMoney)),
        });
      } else {
        notification.error({
          message: t(error?.response?.data?.message || error?.message || "error.oops"),
        });
      }
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(dataDetail.code);
      notification.success({ message: t("message.success") });
    } catch (error: any) {
      notification.error({
        message: t(error?.response?.data?.message || error?.message || "error.oops"),
      });
    }
  };

  const handleOpenChargeConfirm = async (visible: boolean) => {
    if (!visible || !dataDetail.code) return;
    setCheckingExchange(true);
    try {
      const rate = await exchangeRateMutation.mutateAsync({
        amount: dataDetail.amount,
        paymentMethodCode: dataDetail.paymentMethodCode,
        ...(dataDetail.peerPaymentType === "taobao_global"
          ? { peerPaymentType: "taobao_global" }
          : {}),
      });
      setExchangeRateByAmount(rate || {});
    } finally {
      setCheckingExchange(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    dataDetail,
    isLoading,
    isError,
    statuses,
    itemStatus,
    stringListOriginalReceipts,
    isShowShipmentCode,
    isInSuspensionSchedule,
    contractWithShopkeeper,
    hasCredit,
    modalOpen,
    newOriginalReceipt,
    setNewOriginalReceipt,
    visibleReceipts,
    isReceiptSaving,
    exchangeRateByAmount,
    checkingExchange,
    newExchangedAmount,
    showPayButton,
    showCancelButton,
    chargeMutation,
    cancelMutation,
    openReceiptModal,
    closeReceiptModal,
    handleAddReceipt,
    markReceiptForDelete,
    handleSaveReceipts,
    handleCharge,
    handleCancel,
    handleOpenChargeConfirm,
  };
};
