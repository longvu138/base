import { useMemo, useState } from "react";
import { App } from "antd";
import {
  useCartItemsQuery,
  useCurrentExchangeRate,
  useCustomerProfile,
  useDeleteAllCartMutation,
  useDeleteCartGroupMutation,
  useDeleteCartSkuMutation,
  useDeleteCartSkusMutation,
  useUpdateCartSkuMutation,
  useAddWishlistItemMutation,
} from "@repo/hooks";

const getSkuItems = (group: any) => {
  if (Array.isArray(group?.skus)) return group.skus;
  if (Array.isArray(group?.skuItems)) return group.skuItems;
  if (Array.isArray(group?.products)) {
    return group.products.flatMap((product: any) =>
      Array.isArray(product?.skus)
        ? product.skus.map((sku: any) => ({
            ...sku,
            product: sku.product || product,
          }))
        : [],
    );
  }
  return [];
};

const getSkuAmount = (sku: any) =>
  Number(
    (sku?.bargainPrice !== null && sku?.bargainPrice !== undefined
      ? sku?.exchangedBargainPrice
      : undefined) ??
      sku?.exchangedSalePrice ??
      sku?.salePrice ??
      sku?.price ??
      sku?.product?.exchangedSalePrice ??
      sku?.product?.salePrice ??
      0,
  ) * Number(sku?.quantity || 0);

export const useCartsPage = () => {
  const { notification } = App.useApp();
  const {
    data: groups = [],
    isLoading,
    isFetching,
    refetch,
  } = useCartItemsQuery();
  const { data: exchangeRates = [] } = useCurrentExchangeRate();
  const { data: profile } = useCustomerProfile();
  const updateSkuMutation = useUpdateCartSkuMutation();
  const deleteSkuMutation = useDeleteCartSkuMutation();
  const deleteSkusMutation = useDeleteCartSkusMutation();
  const deleteGroupMutation = useDeleteCartGroupMutation();
  const deleteAllMutation = useDeleteAllCartMutation();
  const addWishlistItemMutation = useAddWishlistItemMutation();
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>([]);
  const [savedSkuIds, setSavedSkuIds] = useState<string[]>([]);
  const [savingSkuId, setSavingSkuId] = useState<string | null>(null);
  const [shopPage, setShopPage] = useState(1);
  const [shopsPerPage, setShopsPerPage] = useState(5);
  const [productsPerSeller, setProductsPerSeller] = useState(5);
  const [cartLanguage, setCartLanguage] = useState(() => {
    const stored = localStorage.getItem("cartLanguage");
    return stored === "CN" ? "CN" : "VN";
  });
  const [addProductsOpen, setAddProductsOpen] = useState(false);
  const [editingPriceSku, setEditingPriceSku] = useState<any>(null);

  const currentLoggedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentLoggedUser") || "{}");
    } catch {
      return {};
    }
  }, []);

  const normalizedGroups = useMemo(
    () =>
      groups.map((group: any) => ({
        ...group,
        cartSkus: getSkuItems(group).map((sku: any) => ({
          ...sku,
          cartGroupId: group.id,
          cartGroupCurrency: group?.marketplace?.currency,
        })),
      })),
    [groups],
  );

  const allSkus = useMemo(
    () => normalizedGroups.flatMap((group: any) => group.cartSkus),
    [normalizedGroups],
  );

  const selectedSkus = useMemo(
    () => allSkus.filter((sku: any) => selectedSkuIds.includes(String(sku.id))),
    [allSkus, selectedSkuIds],
  );

  const totals = useMemo(
    () => ({
      totalGroups: normalizedGroups.length,
      totalSkus: allSkus.length,
      totalQuantity: allSkus.reduce(
        (sum: number, sku: any) => sum + Number(sku.quantity || 0),
        0,
      ),
      selectedSkus: selectedSkus.length,
      selectedQuantity: selectedSkus.reduce(
        (sum: number, sku: any) => sum + Number(sku.quantity || 0),
        0,
      ),
      selectedAmount: selectedSkus.reduce(
        (sum: number, sku: any) => sum + getSkuAmount(sku),
        0,
      ),
      selectedForeignAmount: selectedSkus.reduce(
        (sum: number, sku: any) =>
          sum +
          Number(
            (sku?.bargainPrice !== null && sku?.bargainPrice !== undefined
              ? sku.bargainPrice
              : undefined) ??
              sku?.salePrice ??
              sku?.product?.salePrice ??
              0,
          ) *
            Number(sku.quantity || 0),
        0,
      ),
      selectedGroups: new Set(selectedSkus.map((sku: any) => sku.cartGroupId))
        .size,
    }),
    [allSkus, normalizedGroups.length, selectedSkus],
  );

  const visibleGroups = useMemo(() => {
    const start = (shopPage - 1) * shopsPerPage;
    return normalizedGroups.slice(start, start + shopsPerPage);
  }, [normalizedGroups, shopPage, shopsPerPage]);

  const toggleSku = (skuId: string, checked: boolean) => {
    setSelectedSkuIds((current) =>
      checked
        ? Array.from(new Set([...current, skuId]))
        : current.filter((id) => id !== skuId),
    );
  };

  const toggleGroup = (group: any, checked: boolean) => {
    const groupSkuIds = group.cartSkus.map((sku: any) => String(sku.id));
    setSelectedSkuIds((current) => {
      if (checked) return Array.from(new Set([...current, ...groupSkuIds]));
      return current.filter((id) => !groupSkuIds.includes(id));
    });
  };

  const clearSelection = () => setSelectedSkuIds([]);
  const selectAll = (checked: boolean) =>
    setSelectedSkuIds(checked ? allSkus.map((sku: any) => String(sku.id)) : []);

  const updateQuantity = async (sku: any, quantity: number | null) => {
    if (!quantity || quantity < 1 || quantity === Number(sku.quantity || 0))
      return;
    await updateSkuMutation.mutateAsync({
      id: String(sku.id),
      payload: { quantity },
    });
  };

  const updateBargainPrice = async (sku: any, bargainPrice: number) => {
    await updateSkuMutation.mutateAsync({
      id: String(sku.id),
      payload: { bargainPrice },
    });
    setEditingPriceSku(null);
  };

  const saveSkuToWishlist = async (skuId: string) => {
    if (savedSkuIds.includes(skuId) || savingSkuId) return;
    setSavingSkuId(skuId);
    try {
      await addWishlistItemMutation.mutateAsync({
        source: "cart",
        data: skuId,
      });
      setSavedSkuIds((current) => Array.from(new Set([...current, skuId])));
      notification.success({ message: "Lưu sản phẩm thành công" });
    } catch {
      notification.error({ message: "Lưu sản phẩm thất bại" });
    } finally {
      setSavingSkuId(null);
    }
  };

  const deleteSku = async (skuId: string) => {
    await deleteSkusMutation.mutateAsync([skuId]);
    setSelectedSkuIds((current) => current.filter((id) => id !== skuId));
  };

  const deleteGroup = async (group: any) => {
    await deleteGroupMutation.mutateAsync(String(group.id));
    const groupSkuIds = group.cartSkus.map((sku: any) => String(sku.id));
    setSelectedSkuIds((current) =>
      current.filter((id) => !groupSkuIds.includes(id)),
    );
  };

  const deleteAll = async () => {
    await deleteAllMutation.mutateAsync();
    setSelectedSkuIds([]);
  };

  const deleteSelected = async () => {
    if (selectedSkuIds.length === 0) return;
    await deleteSkusMutation.mutateAsync(selectedSkuIds);
    setSelectedSkuIds([]);
  };

  const changeShopsPerPage = (value: number) => {
    setShopsPerPage(value);
    setShopPage(1);
  };

  const setShowTranslatedNames = (checked: boolean) => {
    const nextLanguage = checked ? "VN" : "CN";
    setCartLanguage(nextLanguage);
    localStorage.setItem("cartLanguage", nextLanguage);
  };

  return {
    groups: normalizedGroups,
    exchangeRates,
    visibleGroups,
    isLoading,
    isFetching,
    selectedSkuIds,
    allSelected: allSkus.length > 0 && selectedSkuIds.length === allSkus.length,
    selectedForeignCurrency:
      selectedSkus[0]?.currency?.code ||
      selectedSkus[0]?.currencyCode ||
      selectedSkus[0]?.cartGroupCurrency ||
      "CNY",
    totals,
    refetch,
    toggleSku,
    toggleGroup,
    clearSelection,
    selectAll,
    updateQuantity,
    updateBargainPrice,
    saveSkuToWishlist,
    savedSkuIds,
    savingSkuId,
    deleteSku,
    deleteGroup,
    deleteAll,
    deleteSelected,
    shopPage,
    shopsPerPage,
    productsPerSeller,
    showTranslatedNames: cartLanguage === "VN",
    addProductsOpen,
    editingPriceSku,
    canEditCart: !!(
      profile?.customerAuthorities?.editCart ??
      currentLoggedUser?.customerAuthorities?.editCart
    ),
    setShopPage,
    setProductsPerSeller,
    setShowTranslatedNames,
    setAddProductsOpen,
    setEditingPriceSku,
    changeShopsPerPage,
    isUpdating: updateSkuMutation.isPending,
    deletingSkuId:
      deleteSkusMutation.variables?.[0] || deleteSkuMutation.variables,
    isDeletingSelected: deleteSkusMutation.isPending,
    deletingGroupId: deleteGroupMutation.variables,
    isDeletingAll: deleteAllMutation.isPending,
  };
};
