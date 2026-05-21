import { useEffect, useMemo, useState } from "react";
import { Form, Modal, notification } from "antd";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "@repo/theme-provider";
import { useCashRequestsLogic, usePaginationWithURL } from "@repo/hooks";
import { LocalStoreUtil, moneyFormat } from "@repo/util";

const getAddressDisplay = (address: any) =>
  [address?.detail || address?.address, address?.location?.display]
    .filter(Boolean)
    .join(", ");

const getAddressLocationId = (address: any) =>
  address?.location?.id || address?.locationId;

const DEFAULT_MIN_AMOUNT = 1000000;

export const useCashRequestPage = () => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const { tenantConfig } = useTheme();
  const [isOpenCreate, setIsOpenCreate] = useState(false);

  const currentProjectInfo =
    tenantConfig || LocalStoreUtil.getJson("currentProjectInfo") || {};
  const currentUser = LocalStoreUtil.getJson("currentLoggedUser") || {};
  const generalConfig = currentProjectInfo?.tenantConfig?.generalConfig || {};
  const cashCollectionConfig = generalConfig?.cashCollectionConfig || {};
  const minAmount = Number(cashCollectionConfig?.minAmount || DEFAULT_MIN_AMOUNT);

  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
    defaultPage: 1,
    defaultPageSize: 20,
  });

  const logic = useCashRequestsLogic({
    page,
    pageSize,
    enabled: true,
  });

  const initialAmount = useMemo(() => {
    const amount = Number(searchParams.get("amount") || 0);
    return amount >= minAmount ? amount : minAmount;
  }, [minAmount, searchParams]);

  useEffect(() => {
    if (!searchParams.get("amount")) return;
    setIsOpenCreate(true);
  }, [searchParams]);

  useEffect(() => {
    if (!isOpenCreate) return;
    form.setFieldValue("amount", initialAmount);
  }, [form, initialAmount, isOpenCreate]);

  const closeCreateModal = () => {
    setIsOpenCreate(false);
    form.resetFields();
  };

  const createCashRequest = async (values: any) => {
    const address = logic.addresses.find((item: any) => item.id === values?.addressId);
    const amount = Number(values?.amount || 0);
    const bodyData = {
      type: "CUSTOMER_REQUEST_COLLECT_CASH",
      object: `m1:${currentUser?.username}`,
      name: `Khach ${currentUser?.username} yeu cau lay tien mat, so tien ${amount}`,
      start: values?.date?.startOf("hour").toISOString(),
      due: null,
      context: {
        address,
      },
      notes: values?.notes ? [values.notes] : [""],
      customField01: amount,
      customField02: getAddressLocationId(address),
      customField03: getAddressDisplay(address),
    };

    try {
      await logic.createCashRequestMutation.mutateAsync(bodyData);
      notification.success({ message: "Thêm yêu cầu thu tiền mặt thành công" });
      closeCreateModal();
    } catch {
      notification.error({
        message: "Thêm yêu cầu thu tiền mặt lỗi. Vui lòng thử lại",
      });
    }
  };

  const confirmCancelCashRequest = (record: any) => {
    Modal.confirm({
      maskClosable: true,
      icon: null,
      title: "Xác nhận hủy yêu cầu thu tiền mặt?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await logic.cancelCashRequestMutation.mutateAsync(record?.id);
          notification.success({ message: "Hủy yêu cầu thu tiền mặt thành công" });
        } catch {
          notification.error({
            message: "Hủy yêu cầu thu tiền mặt lỗi. Vui lòng thử lại",
          });
        }
      },
    });
  };

  const amountRules = [
    { required: true, message: "Số tiền không được để trống" },
    {
      validator(_: any, value: any) {
        if (!value) return Promise.resolve();
        if (Number(value) >= minAmount) return Promise.resolve();
        return Promise.reject(
          new Error(
            `Số tiền yêu cầu thu tiền tối thiểu ${moneyFormat(minAmount)} cho một lần thu`,
          ),
        );
      },
    },
  ];

  return {
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    currentUser,
    minAmount,
    isOpenCreate,
    setIsOpenCreate,
    closeCreateModal,
    createCashRequest,
    confirmCancelCashRequest,
    getAddressDisplay,
    ...logic,
    amountRules,
  };
};
