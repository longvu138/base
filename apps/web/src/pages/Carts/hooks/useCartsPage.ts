import { useMemo, useState } from 'react';
import {
  useCartItemsQuery,
  useCurrentExchangeRate,
  useDeleteAllCartMutation,
  useDeleteCartGroupMutation,
  useDeleteCartSkuMutation,
  useDeleteCartSkusMutation,
  useUpdateCartSkuMutation,
} from '@repo/hooks';

const getSkuItems = (group: any) => {
  if (Array.isArray(group?.skus)) return group.skus;
  if (Array.isArray(group?.skuItems)) return group.skuItems;
  if (Array.isArray(group?.products)) {
    return group.products.flatMap((product: any) =>
      Array.isArray(product?.skus)
        ? product.skus.map((sku: any) => ({ ...sku, product: sku.product || product }))
        : []
    );
  }
  return [];
};

const getSkuAmount = (sku: any) =>
  Number(
    sku?.exchangedSalePrice ??
      sku?.salePrice ??
      sku?.price ??
      sku?.product?.exchangedSalePrice ??
      sku?.product?.salePrice ??
      0
  ) * Number(sku?.quantity || 0);

export const useCartsPage = () => {
  const { data: groups = [], isLoading, isFetching, refetch } = useCartItemsQuery();
  const { data: exchangeRates = [] } = useCurrentExchangeRate();
  const updateSkuMutation = useUpdateCartSkuMutation();
  const deleteSkuMutation = useDeleteCartSkuMutation();
  const deleteSkusMutation = useDeleteCartSkusMutation();
  const deleteGroupMutation = useDeleteCartGroupMutation();
  const deleteAllMutation = useDeleteAllCartMutation();
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>([]);
  const [shopPage, setShopPage] = useState(1);
  const [shopsPerPage, setShopsPerPage] = useState(5);
  const [productsPerSeller, setProductsPerSeller] = useState(5);
  const [cartLanguage, setCartLanguage] = useState(() => {
    const stored = localStorage.getItem('cartLanguage');
    return stored === 'CN' ? 'CN' : 'VN';
  });
  const [addProductsOpen, setAddProductsOpen] = useState(false);

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
    [groups]
  );

  const allSkus = useMemo(
    () => normalizedGroups.flatMap((group: any) => group.cartSkus),
    [normalizedGroups]
  );

  const selectedSkus = useMemo(
    () => allSkus.filter((sku: any) => selectedSkuIds.includes(String(sku.id))),
    [allSkus, selectedSkuIds]
  );

  const totals = useMemo(
    () => ({
      totalGroups: normalizedGroups.length,
      totalSkus: allSkus.length,
      totalQuantity: allSkus.reduce((sum: number, sku: any) => sum + Number(sku.quantity || 0), 0),
      selectedSkus: selectedSkus.length,
      selectedQuantity: selectedSkus.reduce(
        (sum: number, sku: any) => sum + Number(sku.quantity || 0),
        0
      ),
      selectedAmount: selectedSkus.reduce(
        (sum: number, sku: any) => sum + getSkuAmount(sku),
        0
      ),
      selectedForeignAmount: selectedSkus.reduce(
        (sum: number, sku: any) =>
          sum +
          Number(sku?.salePrice ?? sku?.product?.salePrice ?? 0) *
            Number(sku.quantity || 0),
        0
      ),
      selectedGroups: new Set(selectedSkus.map((sku: any) => sku.cartGroupId)).size,
    }),
    [allSkus, normalizedGroups.length, selectedSkus]
  );

  const visibleGroups = useMemo(() => {
    const start = (shopPage - 1) * shopsPerPage;
    return normalizedGroups.slice(start, start + shopsPerPage);
  }, [normalizedGroups, shopPage, shopsPerPage]);

  const toggleSku = (skuId: string, checked: boolean) => {
    setSelectedSkuIds((current) =>
      checked ? Array.from(new Set([...current, skuId])) : current.filter((id) => id !== skuId)
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
    if (!quantity || quantity < 1 || quantity === Number(sku.quantity || 0)) return;
    await updateSkuMutation.mutateAsync({
      id: String(sku.id),
      payload: { quantity },
    });
  };

  const deleteSku = async (skuId: string) => {
    await deleteSkuMutation.mutateAsync(skuId);
    setSelectedSkuIds((current) => current.filter((id) => id !== skuId));
  };

  const deleteGroup = async (group: any) => {
    await deleteGroupMutation.mutateAsync(String(group.id));
    const groupSkuIds = group.cartSkus.map((sku: any) => String(sku.id));
    setSelectedSkuIds((current) => current.filter((id) => !groupSkuIds.includes(id)));
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
    const nextLanguage = checked ? 'VN' : 'CN';
    setCartLanguage(nextLanguage);
    localStorage.setItem('cartLanguage', nextLanguage);
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
      'CNY',
    totals,
    refetch,
    toggleSku,
    toggleGroup,
    clearSelection,
    selectAll,
    updateQuantity,
    deleteSku,
    deleteGroup,
    deleteAll,
    deleteSelected,
    shopPage,
    shopsPerPage,
    productsPerSeller,
    showTranslatedNames: cartLanguage === 'VN',
    addProductsOpen,
    setShopPage,
    setProductsPerSeller,
    setShowTranslatedNames,
    setAddProductsOpen,
    changeShopsPerPage,
    isUpdating: updateSkuMutation.isPending,
    deletingSkuId: deleteSkuMutation.variables,
    isDeletingSelected: deleteSkusMutation.isPending,
    deletingGroupId: deleteGroupMutation.variables,
    isDeletingAll: deleteAllMutation.isPending,
  };
};
