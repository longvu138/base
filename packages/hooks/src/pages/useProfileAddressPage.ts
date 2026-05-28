import { useMemo, useState } from "react";
import { App } from "antd";
import { useAddressesQuery, useDeleteAddressMutation } from "../useAddressHooks";

const PROFILE_ADDRESS_PAGE_SIZE = 25;

export type ProfileAddressTab = "address" | "receivingAddress";

export const useProfileAddressPage = (t: (key: string) => string) => {
  const { notification } = App.useApp();
  const [activeTab, setActiveTab] = useState<ProfileAddressTab>("address");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const queryParams = useMemo(
    () => ({
      page: page - 1,
      receivingAddress: activeTab === "receivingAddress",
      size: PROFILE_ADDRESS_PAGE_SIZE,
      sort: "defaultAddress:desc,createdAt:desc",
    }),
    [activeTab, page],
  );

  const {
    data: addressData,
    isLoading,
    refetch: refetchAddresses,
  } = useAddressesQuery(queryParams);
  const deleteAddressMutation = useDeleteAddressMutation();
  const addresses = addressData?.data ?? [];
  const total = addressData?.total ?? addresses.length;

  const changeTab = (tab: ProfileAddressTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openCreateAddress = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const openEditAddress = (item: any) => {
    setEditingAddress(item);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const deleteAddress = async (id: number) => {
    try {
      await deleteAddressMutation.mutateAsync(id);
      notification.success({ message: t("message.delete_success") });
      await refetchAddresses();
    } catch (error: any) {
      if (error?.statusCode === "Network fail") return;
      notification.error({
        message:
          error?.response?.data?.message || error?.message || t("common.error"),
      });
    }
  };

  return {
    activeTab,
    addresses,
    changeTab,
    closeModal,
    deleteAddress,
    deleteAddressLoading: deleteAddressMutation.isPending,
    editingAddress,
    isLoading,
    isReceivingAddress: activeTab === "receivingAddress",
    modalOpen,
    openCreateAddress,
    openEditAddress,
    page,
    pageSize: PROFILE_ADDRESS_PAGE_SIZE,
    refetchAddresses,
    setPage,
    total,
  };
};
