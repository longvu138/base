import { useState } from "react";
import { App } from "antd";
import { useCheckVoucherMutation } from "../useVoucherHooks";
import { useVouchersLogic } from "./vouchers";

const defaultPageSize = 20;

const resolveVoucherError = (error: any, t: (key: string) => string) => {
  const title = error?.response?.data?.title || error?.title;
  if (title) return t(`message.${title}`);
  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.message ||
    t("common.error")
  );
};

export const useProfileVouchersPage = (t: (key: string) => string) => {
  const { notification } = App.useApp();
  const [page, setPage] = useState(1);
  const [voucherCode, setVoucherCode] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { vouchersData, isVouchersLoading } = useVouchersLogic({
    page,
    pageSize: defaultPageSize,
    filters: {},
  });
  const checkVoucher = useCheckVoucherMutation();

  const openDetail = (voucher: any) => {
    setSelectedVoucher(voucher);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedVoucher(null);
  };

  const submitVoucherCode = async () => {
    const code = voucherCode.trim();
    if (!code) return;

    try {
      const voucher = await checkVoucher.mutateAsync({ code });
      if (voucher?.code) {
        openDetail(voucher);
      }
    } catch (error: any) {
      notification.error({ message: resolveVoucherError(error, t) });
    }
  };

  return {
    closeDetail,
    detailOpen,
    isChecking: checkVoucher.isPending,
    isLoading: isVouchersLoading,
    openDetail,
    page,
    pageSize: defaultPageSize,
    selectedVoucher,
    setPage,
    setVoucherCode,
    submitVoucherCode,
    total: vouchersData?.total || 0,
    voucherCode,
    vouchers: vouchersData?.data || [],
  };
};
