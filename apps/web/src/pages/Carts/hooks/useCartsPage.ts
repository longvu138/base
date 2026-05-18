import { useEffect, useMemo, useRef, useState } from "react";
import { App } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useCartItemsQuery,
  useOrderServicesQuery,
  useCurrentExchangeRate,
  useCustomerProfile,
  useDeleteAllCartMutation,
  useDeleteCartGroupMutation,
  useDeleteCartSkuMutation,
  useDeleteCartSkusMutation,
  useUpdateCartSkuMutation,
  useUpdateCartGroupMutation,
  useUpdateCartServicesMutation,
  useUpdatePreferredServicesMutation,
  useAddWishlistItemMutation,
  useCreateDraftOrderMutation,
  useShipmentServiceGroupsQuery,
} from "@repo/hooks";
import { sameCodes } from "../cartViewModel";

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

const QUANTITY_UPDATE_DEBOUNCE_MS = 500;
const SKU_NOTE_UPDATE_DEBOUNCE_MS = 500;

export const useCartsPage = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const shopPage = Number(searchParams.get("page") || 1);
  const shopsPerPage = Number(searchParams.get("size") || 5);
  const {
    data: cartItemsResult,
    isLoading,
    isFetching,
    refetch,
  } = useCartItemsQuery({
    page: Math.max(shopPage - 1, 0),
    size: shopsPerPage,
  });
  const groups = cartItemsResult?.data || [];
  const { data: exchangeRates = [] } = useCurrentExchangeRate();
  const { data: orderServices = [] } = useOrderServicesQuery();
  const { data: orderServiceGroups = [] } = useShipmentServiceGroupsQuery();
  const { data: profile } = useCustomerProfile();
  const updateSkuMutation = useUpdateCartSkuMutation();
  const updateCartGroupMutation = useUpdateCartGroupMutation();
  const updateCartServicesMutation = useUpdateCartServicesMutation();
  const updatePreferredServicesMutation = useUpdatePreferredServicesMutation();
  const createDraftOrderMutation = useCreateDraftOrderMutation();
  const deleteSkuMutation = useDeleteCartSkuMutation();
  const deleteSkusMutation = useDeleteCartSkusMutation();
  const deleteGroupMutation = useDeleteCartGroupMutation();
  const deleteAllMutation = useDeleteAllCartMutation();
  const addWishlistItemMutation = useAddWishlistItemMutation();
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>([]);
  const [savedSkuIds, setSavedSkuIds] = useState<string[]>([]);
  const [savingSkuId, setSavingSkuId] = useState<string | null>(null);
  const [draftQuantities, setDraftQuantities] = useState<
    Record<string, number>
  >({});
  const [serviceDrafts, setServiceDrafts] = useState<Record<string, string[]>>(
    {},
  );
  const [cartGroupDrafts, setCartGroupDrafts] = useState<Record<string, any>>(
    {},
  );
  const [skuNoteDrafts, setSkuNoteDrafts] = useState<Record<string, any>>({});
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);
  const quantityUpdateTimers = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const skuNoteUpdateTimers = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const [productsPerSeller, setProductsPerSellerState] = useState(() =>
    Number(localStorage.getItem("productPerMerchant") || 5),
  );
  const [cartLanguage, setCartLanguage] = useState(() => {
    const stored = localStorage.getItem("cartLanguage");
    return stored === "CN" ? "CN" : "VN";
  });
  const [addProductsOpen, setAddProductsOpen] = useState(false);
  const [editingPriceSku, setEditingPriceSku] = useState<any>(null);
  const [draftOrder, setDraftOrder] = useState<any>(null);

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

  useEffect(() => {
    setDraftQuantities((current) => {
      const next = { ...current };
      let changed = false;

      allSkus.forEach((sku: any) => {
        const skuId = String(sku.id);
        if (
          next[skuId] !== undefined &&
          Number(sku.quantity || 0) === next[skuId]
        ) {
          delete next[skuId];
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [allSkus]);

  useEffect(() => {
    setSkuNoteDrafts((current) => {
      const next = { ...current };
      let changed = false;

      allSkus.forEach((sku: any) => {
        const skuId = String(sku.id);
        if (!next[skuId]) {
          next[skuId] = {
            note: sku.note || "",
            remark: sku.remark || "",
          };
          changed = true;
        }
      });

      Object.keys(next).forEach((skuId) => {
        if (!allSkus.some((sku: any) => String(sku.id) === skuId)) {
          delete next[skuId];
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [allSkus]);

  useEffect(() => {
    setServiceDrafts((current) => {
      const next = { ...current };
      let changed = false;

      normalizedGroups.forEach((group: any) => {
        const groupId = String(group.id);
        if (!next[groupId]) {
          next[groupId] = Array.isArray(group.services)
            ? group.services.map((service: any) => service.code).filter(Boolean)
            : [];
          changed = true;
        }
      });

      Object.keys(next).forEach((groupId) => {
        if (
          !normalizedGroups.some((group: any) => String(group.id) === groupId)
        ) {
          delete next[groupId];
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [normalizedGroups]);

  useEffect(() => {
    setCartGroupDrafts((current) => {
      const next = { ...current };
      let changed = false;

      normalizedGroups.forEach((group: any) => {
        const groupId = String(group.id);
        if (!next[groupId]) {
          next[groupId] = {
            note: group.note || "",
            remark: group.remark || "",
            refCustomerCode: group.refCustomerCode || "",
            refOrderCode: group.refOrderCode || "",
          };
          changed = true;
        }
      });

      Object.keys(next).forEach((groupId) => {
        if (
          !normalizedGroups.some((group: any) => String(group.id) === groupId)
        ) {
          delete next[groupId];
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [normalizedGroups]);

  useEffect(
    () => () => {
      Object.values(quantityUpdateTimers.current).forEach(clearTimeout);
      Object.values(skuNoteUpdateTimers.current).forEach(clearTimeout);
    },
    [],
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

  const visibleGroups = normalizedGroups;

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

  const getDisplayQuantity = (sku: any) => {
    const skuId = String(sku.id);
    return draftQuantities[skuId] ?? Number(sku.quantity || 0);
  };

  const updateQuantity = (sku: any, quantity: number | null) => {
    const skuId = String(sku.id);

    if (quantityUpdateTimers.current[skuId]) {
      clearTimeout(quantityUpdateTimers.current[skuId]);
      delete quantityUpdateTimers.current[skuId];
    }

    if (!quantity || quantity < 1) return;

    setDraftQuantities((current) => ({
      ...current,
      [skuId]: quantity,
    }));

    if (quantity === Number(sku.quantity || 0)) {
      setDraftQuantities((current) => {
        const next = { ...current };
        delete next[skuId];
        return next;
      });
      return;
    }

    quantityUpdateTimers.current[skuId] = setTimeout(async () => {
      try {
        await updateSkuMutation.mutateAsync({
          id: skuId,
          payload: { quantity },
        });
      } catch {
        setDraftQuantities((current) => {
          const next = { ...current };
          delete next[skuId];
          return next;
        });
      } finally {
        delete quantityUpdateTimers.current[skuId];
      }
    }, QUANTITY_UPDATE_DEBOUNCE_MS);
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

  const toggleCartService = (group: any, service: any, checked: boolean) => {
    const groupId = String(group.id);
    setServiceDrafts((current) => {
      const selectedCodes =
        current[groupId] ??
        (Array.isArray(group.services)
          ? group.services.map((item: any) => item.code).filter(Boolean)
          : []);
      let nextCodes = [...selectedCodes];

      if (service?.serviceGroup?.single && checked) {
        const sameGroupCodes = orderServices
          .filter(
            (item: any) =>
              item?.serviceGroup?.code === service.serviceGroup.code,
          )
          .map((item: any) => item.code);
        nextCodes = nextCodes.filter((code) => !sameGroupCodes.includes(code));
      }

      if (checked) {
        nextCodes = Array.from(new Set([...nextCodes, service.code]));
      } else {
        nextCodes = nextCodes.filter((code) => code !== service.code);
      }

      return { ...current, [groupId]: nextCodes };
    });
  };

  const saveCartServices = async (group: any) => {
    const groupId = String(group.id);
    await updateCartServicesMutation.mutateAsync({
      id: groupId,
      serviceCodes: serviceDrafts[groupId] || [],
    });
    notification.success({ message: "Lưu dịch vụ thành công" });
  };

  const savePreferredServices = async (group: any) => {
    const groupId = String(group.id);
    await updatePreferredServicesMutation.mutateAsync(
      serviceDrafts[groupId] || [],
    );
    notification.success({ message: "Lưu dịch vụ làm mặc định thành công" });
  };

  const changeCartGroupDraft = (
    groupId: string,
    field: string,
    value: string,
  ) => {
    if (value !== "" && value.trim() === "") return;
    setCartGroupDrafts((current) => ({
      ...current,
      [groupId]: {
        ...(current[groupId] || {}),
        [field]: value,
      },
    }));
  };

  const saveCartGroupField = async (
    group: any,
    field: "note" | "remark" | "refCustomerCode" | "refOrderCode",
  ) => {
    const groupId = String(group.id);
    const value = cartGroupDrafts[groupId]?.[field] || "";
    if ((group[field] || "") === value) return;

    await updateCartGroupMutation.mutateAsync({
      id: groupId,
      payload: { [field]: value },
    });
    notification.success({ message: "Cập nhật thành công" });
  };

  const updateSkuNotes = async (
    sku: any,
    draft: { note?: string; remark?: string },
  ) => {
    await updateSkuMutation.mutateAsync({
      id: String(sku.id),
      payload: {
        note: draft.note || "",
        remark: draft.remark || "",
      },
    });
  };

  const changeSkuNoteDraft = (
    sku: any,
    field: "note" | "remark",
    value: string,
  ) => {
    if (value !== "" && value.trim() === "") return;
    const skuId = String(sku.id);
    const timerKey = `${skuId}-${field}`;
    const nextDraft = {
      ...(skuNoteDrafts[skuId] || {
        note: sku.note || "",
        remark: sku.remark || "",
      }),
      [field]: value,
    };

    setSkuNoteDrafts((current) => ({
      ...current,
      [skuId]: {
        ...(current[skuId] || {}),
        [field]: value,
      },
    }));

    if (skuNoteUpdateTimers.current[timerKey]) {
      clearTimeout(skuNoteUpdateTimers.current[timerKey]);
    }

    skuNoteUpdateTimers.current[timerKey] = setTimeout(async () => {
      if ((sku[field] || "") === value) return;
      try {
        await updateSkuNotes(sku, nextDraft);
      } finally {
        delete skuNoteUpdateTimers.current[timerKey];
      }
    }, SKU_NOTE_UPDATE_DEBOUNCE_MS);
  };

  const saveSkuNoteField = async (sku: any, field: "note" | "remark") => {
    const skuId = String(sku.id);
    const timerKey = `${skuId}-${field}`;
    const value = skuNoteDrafts[skuId]?.[field] || "";
    if ((sku[field] || "") === value) return;

    if (skuNoteUpdateTimers.current[timerKey]) {
      clearTimeout(skuNoteUpdateTimers.current[timerKey]);
      delete skuNoteUpdateTimers.current[timerKey];
    }

    await updateSkuNotes(sku, skuNoteDrafts[skuId] || {});
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

  const placeOrder = async () => {
    if (selectedSkuIds.length === 0) return;

    const selectedGroupIds = new Set(
      selectedSkus.map((sku: any) => String(sku.cartGroupId)),
    );
    const selectedGroups = normalizedGroups.filter((group: any) =>
      selectedGroupIds.has(String(group.id)),
    );

    const groupWithoutServices = selectedGroups.find(
      (group: any) =>
        !Array.isArray(group.services) || group.services.length === 0,
    );
    if (groupWithoutServices) {
      notification.error({ message: "Vui lòng chọn dịch vụ" });
      return;
    }

    const groupWithUnsavedServices = selectedGroups.find((group: any) => {
      const originalCodes = Array.isArray(group.services)
        ? group.services.map((service: any) => service.code).filter(Boolean)
        : [];
      const draftCodes = serviceDrafts[String(group.id)] || originalCodes;
      return !sameCodes(originalCodes, draftCodes);
    });
    if (groupWithUnsavedServices) {
      notification.warning({
        message:
          "Bạn đã thay đổi dịch vụ nhưng chưa lưu. Hãy lưu dịch vụ trước khi đặt hàng.",
      });
      return;
    }

    const result = await createDraftOrderMutation.mutateAsync({
      skus: selectedSkuIds,
    });
    setDraftOrder(result.data);
    navigate(`/carts/checkout/${result.data.id}`);
  };

  const changeShopsPerPage = (value: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("page", "1");
      next.set("size", String(value));
      return next;
    });
  };

  const changeShopPage = (page: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("page", String(page));
      next.set("size", String(shopsPerPage));
      return next;
    });
  };

  const setProductsPerSeller = (value: number) => {
    setProductsPerSellerState(value);
    localStorage.setItem("productPerMerchant", String(value));
    setExpandedGroupIds([]);
  };

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );
  };

  const setShowTranslatedNames = (checked: boolean) => {
    const nextLanguage = checked ? "VN" : "CN";
    setCartLanguage(nextLanguage);
    localStorage.setItem("cartLanguage", nextLanguage);
  };

  return {
    groups: normalizedGroups,
    cartTotalGroups: cartItemsResult?.total || normalizedGroups.length,
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
    getDisplayQuantity,
    updateQuantity,
    updateBargainPrice,
    saveSkuToWishlist,
    savedSkuIds,
    savingSkuId,
    orderServices: orderServices.filter(
      (service: any) => service.onlyStaff !== true,
    ),
    orderServiceGroups,
    serviceDrafts,
    toggleCartService,
    saveCartServices,
    savePreferredServices,
    cartGroupDrafts,
    changeCartGroupDraft,
    saveCartGroupField,
    skuNoteDrafts,
    changeSkuNoteDraft,
    saveSkuNoteField,
    deleteSku,
    deleteGroup,
    deleteAll,
    deleteSelected,
    placeOrder,
    shopPage,
    shopsPerPage,
    productsPerSeller,
    expandedGroupIds,
    toggleGroupExpanded,
    showTranslatedNames: cartLanguage === "VN",
    addProductsOpen,
    editingPriceSku,
    canEditCart: !!(
      profile?.customerAuthorities?.editCart ??
      currentLoggedUser?.customerAuthorities?.editCart
    ),
    setShopPage: changeShopPage,
    setProductsPerSeller,
    setShowTranslatedNames,
    setAddProductsOpen,
    setEditingPriceSku,
    changeShopsPerPage,
    isUpdating: updateSkuMutation.isPending,
    isSavingServices: updateCartServicesMutation.isPending,
    savingServicesGroupId: updateCartServicesMutation.variables?.id,
    isSavingPreferredServices: updatePreferredServicesMutation.isPending,
    isUpdatingCartGroup: updateCartGroupMutation.isPending,
    deletingSkuId:
      deleteSkusMutation.variables?.[0] || deleteSkuMutation.variables,
    isDeletingSelected: deleteSkusMutation.isPending,
    deletingGroupId: deleteGroupMutation.variables,
    isDeletingAll: deleteAllMutation.isPending,
    isPlacingOrder: createDraftOrderMutation.isPending,
    draftOrder,
  };
};
