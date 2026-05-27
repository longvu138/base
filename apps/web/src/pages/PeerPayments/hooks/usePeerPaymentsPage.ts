import { useEffect, useState } from "react";
import { App, Form } from "antd";
import dayjs from "dayjs";
import {
  useChargePeerPaymentMutation,
  useAskForPayMutation,
  useAskToPayAnInvoiceMutation,
  useBetterOfferMutation,
  useCreatePeerPaymentTransferMutation,
  useCreatePayAnInvoiceMutation,
  useCreateRequestForPayMutation,
  useCustomerBalance,
  useExportPeerPaymentsMutation,
  useFilterWithURL,
  usePeerPaymentExchangeRatesBatchMutation,
  usePeerPaymentQuotationMutation,
  usePlaceOrderBetterOfferMutation,
  useUploadPeerPaymentQrCodeMutation,
  usePaginationWithURL,
  usePeerPaymentExchangeRateMutation,
  usePeerPaymentsLogic,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";
import { LocalStoreUtil, moneyFormat } from "@repo/util";

export const usePeerPaymentsPage = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
    defaultPage: 1,
    defaultPageSize: 10,
  });
  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
  const logic = usePeerPaymentsLogic({ page, pageSize, filters });
  const { data: userBalance = {}, refetch: refetchUserBalance } =
    useCustomerBalance();
  const chargeMutation = useChargePeerPaymentMutation();
  const exchangeRateMutation = usePeerPaymentExchangeRateMutation();
  const exchangeRatesBatchMutation = usePeerPaymentExchangeRatesBatchMutation();
  const exportMutation = useExportPeerPaymentsMutation();
  const createRequestForPayMutation = useCreateRequestForPayMutation();
  const askForPayMutation = useAskForPayMutation();
  const createPayAnInvoiceMutation = useCreatePayAnInvoiceMutation();
  const askToPayAnInvoiceMutation = useAskToPayAnInvoiceMutation();
  const paymentQuotationMutation = usePeerPaymentQuotationMutation();
  const betterOfferMutation = useBetterOfferMutation();
  const placeOrderBetterOfferMutation = usePlaceOrderBetterOfferMutation();
  const uploadQrCodeMutation = useUploadPeerPaymentQrCodeMutation();
  const createTransferMutation = useCreatePeerPaymentTransferMutation();
  const [chargingCode, setChargingCode] = useState<string>();
  const filterSignature = JSON.stringify(filters);

  const hydrateFiltersForForm = (values: Record<string, any>) => {
    const next = { ...values };
    ["timestampFrom", "timestampTo", "milestoneFrom", "milestoneTo"].forEach(
      (key) => {
        if (next[key] && !dayjs.isDayjs(next[key])) {
          next[key] = dayjs(next[key]);
        }
      },
    );
    return next;
  };

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(hydrateFiltersForForm(filters));
  }, [filterSignature, form]);

  const normalizeFilters = (values: Record<string, any>) => {
    const next = { ...values };

    if (dayjs.isDayjs(next.timestampFrom)) {
      next.timestampFrom = next.timestampFrom.startOf("day").toISOString();
    }

    if (dayjs.isDayjs(next.timestampTo)) {
      next.timestampTo = next.timestampTo.endOf("day").toISOString();
    }

    if (dayjs.isDayjs(next.milestoneFrom)) {
      next.milestoneFrom = next.milestoneFrom.toISOString();
    }

    if (dayjs.isDayjs(next.milestoneTo)) {
      next.milestoneTo = next.milestoneTo.toISOString();
    }

    if (next.hasCollateral === "pass") {
      next.hasCollateral = true;
    } else if (next.hasCollateral === "fail") {
      next.hasCollateral = false;
    }

    Object.keys(next).forEach((key) => {
      if (
        next[key] === undefined ||
        next[key] === null ||
        next[key] === "" ||
        (Array.isArray(next[key]) && next[key].length === 0)
      ) {
        delete next[key];
      }
    });

    return next;
  };

  const handleSearch = () => {
    applyFilters(normalizeFilters(form.getFieldsValue(true)));
  };

  const handleReset = () => {
    clearFilters();
  };

  const handleTypeChange = (peerPaymentType: string) => {
    form.resetFields();
    applyFilters({ peerPaymentType });
  };

  const isChargeTimeoutError = (error: any) =>
    error?.code === "ECONNABORTED" ||
    error?.code === "ERR_CANCELED" ||
    error?.name === "CanceledError" ||
    String(error?.message || "").toLowerCase().includes("timeout");

  const handleCharge = async (code: string, row?: Record<string, any>) => {
    setChargingCode(code);
    let latestBalance = userBalance;
    try {
      const balanceResponse = await refetchUserBalance();
      latestBalance = balanceResponse.data || latestBalance;
      await chargeMutation.mutateAsync(code);
      refetchUserBalance();
      notification.success({ message: t("message.success") });
    } catch (error: any) {
      const title = error?.response?.data?.title || error?.title;
      if (isChargeTimeoutError(error)) {
        notification.error({ message: t("peer_payment.charge_timeout") });
      } else if (title === "invalid_amount") {
        notification.error({ message: t("peer_payment.invalid_amount") });
      } else if (title === "insufficient_balance") {
        const totalMoney =
          Number(row?.totalFee || 0) + Number(row?.exchangedAmount || 0);
        const topUpMoney =
          totalMoney -
          (Number(latestBalance?.balance || 0) +
            Number(latestBalance?.creditLimit || 0));
        notification.error({
          message: t("cartCheckout.notEnoughMoney").replace(
            "${money}",
            moneyFormat(topUpMoney),
          ),
        });
      } else {
        const status = error?.response?.status;
        const messageKey =
          status === 500 || !error?.response
            ? "error.oops"
            : error?.response?.data?.message || error?.message;
        notification.error({
          message: messageKey ? t(messageKey) : "",
        });
      }
    } finally {
      setChargingCode(undefined);
    }
  };

  const handleCreatePaymentRequest = async (values: Record<string, any>) => {
    const {
      requestForPayType,
      originalReceiptCode: _originalReceiptCode,
      exchangeRate: _exchangeRate,
      ...payloadValues
    } = values;
    const originalReceiptCode =
      typeof values.originalReceipts === "string"
        ? values.originalReceipts.trim()
        : values.originalReceipts?.[0]?.code;
    const payload = {
      ...payloadValues,
      amount: Number(values.amount || 0),
      paymentMethodCode: values.paymentMethodCode || "alipay",
      originalReceipts: originalReceiptCode
        ? [
            {
              code: originalReceiptCode,
              billTo: values.billTo,
            },
          ]
        : undefined,
      force: true,
    };

    const needPayOnRequest =
      LocalStoreUtil.getJson("currentProjectInfo")?.tenantConfig
        ?.peerPaymentConfig?.needPayOnRequest;
    const isCompany = requestForPayType === "company";
    if (isCompany) {
      if (needPayOnRequest) {
        await createPayAnInvoiceMutation.mutateAsync(payload);
      } else {
        await askToPayAnInvoiceMutation.mutateAsync(payload);
      }
    } else if (needPayOnRequest) {
      await createRequestForPayMutation.mutateAsync(payload);
    } else {
      await askForPayMutation.mutateAsync(payload);
    }
    notification.success({ message: t("message.success") });
  };

  const handleCreateTransferRequest = async (values: Record<string, any>) => {
    await createTransferMutation.mutateAsync({
      ...values,
      amount: Number(values.amount || 0),
    });
    notification.success({ message: t("message.success") });
  };

  const handleExport = async (pin: string) => {
    if (!pin) {
      notification.error({ message: t("cartCheckout.incorrect_pin") });
      return false;
    }

    const params: Record<string, any> = {
      ...logic.apiParams,
      page: page - 1,
      size: pageSize,
    };
    delete params.offset;
    delete params.limit;

    try {
      const response = await exportMutation.mutateAsync({
        params,
        data: { pin, secret: pin },
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const disposition = response.headers?.["content-disposition"] || "";
      const fileName =
        disposition.split("filename=")[1] || "peer-payments.xlsx";
      const link = document.createElement("a");
      link.href = url;
      link.download = decodeURIComponent(fileName.replaceAll('"', ""));
      link.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error: any) {
      const data = error?.response?.data;
      let title = "";
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          title = JSON.parse(text)?.title;
        } catch {
          title = "";
        }
      } else {
        title = data?.title || error?.title;
      }
      notification.error({
        message:
          title === "invalid_pin" || title === "invalid_password"
            ? t("cartCheckout.incorrect_pin")
            : t("shipments.export_error"),
      });
      return false;
    }
  };

  return {
    t,
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    userBalance,
    refetchUserBalance,
    ...logic,
    handleSearch,
    handleReset,
    handleTypeChange,
    handleCharge,
    handleCreatePaymentRequest,
    handleCreateTransferRequest,
    handleExport,
    chargeMutation,
    chargingCode,
    exchangeRateMutation,
    exchangeRatesBatchMutation,
    paymentQuotationMutation,
    betterOfferMutation,
    placeOrderBetterOfferMutation,
    uploadQrCodeMutation,
    exportMutation,
    createRequestForPayMutation,
    askForPayMutation,
    createPayAnInvoiceMutation,
    askToPayAnInvoiceMutation,
    createTransferMutation,
  };
};
