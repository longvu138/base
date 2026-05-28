import { useEffect, useMemo, useState } from "react";
import { Form, Modal, notification } from "antd";
import { useSearchParams } from "react-router-dom";
import { LocalStoreUtil, moneyFormat } from "@repo/util";
import { useAddressesQuery } from "../useAddressHooks";
import {
  useCancelCashRequestMutation,
  useCashRequestsInfiniteQuery,
  useCashRequestsQuery,
  useCreateCashRequestMutation,
} from "../useCashRequestHooks";

export interface UseCashRequestsLogicProps {
  page: number;
  pageSize: number;
  enabled?: boolean;
}

const DEFAULT_MIN_AMOUNT = 1000000;
const MOBILE_PAGE_SIZE = 25;

export const getCashRequestAddressDisplay = (address: any) =>
  [address?.detail || address?.address, address?.location?.display]
    .filter(Boolean)
    .join(", ");

const getAddressLocationId = (address: any) =>
  address?.location?.id || address?.locationId;

export const useCashRequestsLogic = ({
  page,
  pageSize,
  enabled = true,
}: UseCashRequestsLogicProps) => {
  const apiParams = useMemo(
    () => ({
      offset: page - 1,
      limit: pageSize,
    }),
    [page, pageSize],
  );

  const addressParams = useMemo(
    () => ({
      page: 0,
      size: 10000,
      sort: "defaultAddress:desc,createdAt:desc",
    }),
    [],
  );

  const cashRequestsQuery = useCashRequestsQuery(enabled ? apiParams : null);
  const addressesQuery = useAddressesQuery(addressParams);
  const createCashRequestMutation = useCreateCashRequestMutation();
  const cancelCashRequestMutation = useCancelCashRequestMutation();

  return {
    apiParams,
    addressParams,
    listData: cashRequestsQuery.data,
    addresses: Array.isArray(addressesQuery.data?.data) ? addressesQuery.data.data : [],
    isCashRequestsLoading: cashRequestsQuery.isLoading,
    isAddressesLoading: addressesQuery.isLoading,
    createCashRequestMutation,
    cancelCashRequestMutation,
  };
};

export const useCashRequestPage = ({ infinite = false }: { infinite?: boolean } = {}) => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [isOpenCreate, setIsOpenCreate] = useState(false);

  const currentProjectInfo = LocalStoreUtil.getJson("currentProjectInfo") || {};
  const currentUser = LocalStoreUtil.getJson("currentLoggedUser") || {};
  const generalConfig = currentProjectInfo?.tenantConfig?.generalConfig || {};
  const cashCollectionConfig = generalConfig?.cashCollectionConfig || {};
  const minAmount = Number(cashCollectionConfig?.minAmount || DEFAULT_MIN_AMOUNT);
  const pageSize = infinite ? MOBILE_PAGE_SIZE : 20;
  const [page, setPage] = useState(1);
  const [currentPageSize, setPageSize] = useState(pageSize);

  const apiParams = useMemo(
    () => ({
      offset: page - 1,
      limit: currentPageSize,
    }),
    [currentPageSize, page],
  );
  const infiniteParams = useMemo(
    () => ({
      offset: 0,
      limit: MOBILE_PAGE_SIZE,
    }),
    [],
  );
  const addressParams = useMemo(
    () => ({
      page: 0,
      size: 10000,
      sort: "defaultAddress:desc,createdAt:desc",
    }),
    [],
  );

  const cashRequestsQuery = useCashRequestsQuery(!infinite ? apiParams : null);
  const infiniteQuery = useCashRequestsInfiniteQuery(infinite ? infiniteParams : null);
  const addressesQuery = useAddressesQuery(addressParams);
  const createCashRequestMutation = useCreateCashRequestMutation();
  const cancelCashRequestMutation = useCancelCashRequestMutation();
  const pages = infiniteQuery.data?.pages || [];
  const rows = infinite
    ? pages.flatMap((item) => item.data || [])
    : cashRequestsQuery.data?.data || [];
  const firstPage = pages[0];
  const listData = infinite
    ? {
        data: rows,
        total: firstPage?.total || 0,
        pageSize: firstPage?.pageSize || MOBILE_PAGE_SIZE,
        current: firstPage?.current || 0,
        totalPage: firstPage?.totalPage || 0,
      }
    : cashRequestsQuery.data;

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

  const addresses = Array.isArray(addressesQuery.data?.data)
    ? addressesQuery.data.data
    : [];

  const closeCreateModal = () => {
    setIsOpenCreate(false);
    form.resetFields();
  };

  const createCashRequest = async (values: any) => {
    const address = addresses.find((item: any) => item.id === values?.addressId);
    const amount = Number(values?.amount || 0);
    const bodyData = {
      type: "CUSTOMER_REQUEST_COLLECT_CASH",
      object: `m1:${currentUser?.username}`,
      name: `Khach ${currentUser?.username} yeu cau lay tien mat, so tien ${amount}`,
      start: values?.date?.startOf("minute").toISOString(),
      due: null,
      context: {
        address,
      },
      notes: values?.notes ? [values.notes] : [""],
      customField01: amount,
      customField02: getAddressLocationId(address),
      customField03: getCashRequestAddressDisplay(address),
    };

    try {
      await createCashRequestMutation.mutateAsync(bodyData);
      closeCreateModal();
      notification.success({ message: "Thêm yêu cầu thu tiền mặt thành công" });
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
          await cancelCashRequestMutation.mutateAsync(record?.id);
          Modal.destroyAll();
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
    pageSize: currentPageSize,
    setPage,
    setPageSize,
    currentUser,
    minAmount,
    isOpenCreate,
    setIsOpenCreate,
    closeCreateModal,
    createCashRequest,
    confirmCancelCashRequest,
    getAddressDisplay: getCashRequestAddressDisplay,
    apiParams,
    addressParams,
    listData,
    addresses,
    isCashRequestsLoading: infinite ? infiniteQuery.isLoading : cashRequestsQuery.isLoading,
    isAddressesLoading: addressesQuery.isLoading,
    createCashRequestMutation,
    cancelCashRequestMutation,
    amountRules,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
  };
};
