import { App } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useAddressesQuery } from "../useAddressHooks";
import {
  useBiffinConnectionQuery,
  useCheckShoppingCartLoanableMutation,
  useCreateCustomerOrderMutation,
  useCustomerBalance,
  useCustomerProfile,
  useDraftOrderQuery,
  useUpdateDraftOrderMutation,
} from "../useCustomerHooks";
import { useTranslation } from "@repo/i18n";
import { useTheme as useTenantTheme } from "@repo/theme-provider";
import { LocalStoreUtil, moneyCeil } from "@repo/util";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export const DEFAULT_METHOD_SELECTED = "default";
export const BIFFIN_METHOD_SELECTED = "cam_do";

export const getErrorTitle = (error: any) =>
  error?.response?.data?.title ||
  error?.response?.data?.message ||
  error?.title ||
  error?.message;

export const getSkus = (merchant: any) =>
  Array.isArray(merchant?.products)
    ? merchant.products.flatMap((product: any) =>
        Array.isArray(product?.skus)
          ? product.skus.map((sku: any) => ({ ...sku, product }))
          : [],
      )
    : Array.isArray(merchant?.skus)
      ? merchant.skus
      : [];

export const getDraftMerchantTotalValue = (merchant: any) => {
  const merchantTotal = Number(merchant?.exchangedTotalValue || 0);
  if (merchantTotal > 0) return merchantTotal;

  return getSkus(merchant).reduce((sum: number, sku: any) => {
    const quantity = Number(sku?.quantity || 0);
    const skuTotal =
      sku?.bargainPrice !== null && sku?.bargainPrice !== undefined
        ? Number(sku?.exchangedBargainPrice || 0) * quantity
        : Number(
            sku?.exchangedTotalAmount ??
              Number(sku?.exchangedSalePrice || 0) * quantity,
          );
    return sum + skuTotal;
  }, 0);
};

export const percentToMoney = (percent: number | string, amount: number) =>
  moneyCeil((Number(percent || 0) * Number(amount || 0)) / 100);

export const sumDraftOrderCouponDiscount = (data: any) =>
  (Array.isArray(data?.merchantCoupons) ? data.merchantCoupons : []).reduce(
    (total: number, merchantCoupon: any) =>
      total +
      (Array.isArray(merchantCoupon?.coupons)
        ? merchantCoupon.coupons.reduce(
            (sum: number, coupon: any) =>
              sum + Number(coupon?.totalDiscountFee || 0),
            0,
          )
        : 0),
    0,
  );

const getFinishOrderProducts = (order: any) => {
  if (Array.isArray(order?.products)) return order.products;
  if (Array.isArray(order?.skus)) return order.skus;
  return [];
};

const getFinishOrderProductQuantity = (product: any) => {
  if (Array.isArray(product?.skus)) {
    return product.skus.reduce(
      (sum: number, sku: any) => sum + Number(sku?.quantity || 0),
      0,
    );
  }
  return Number(product?.quantity || 0);
};

const getFinishOrderQuantity = (order: any) =>
  getFinishOrderProducts(order).reduce(
    (sum: number, product: any) =>
      sum + getFinishOrderProductQuantity(product),
    0,
  );

const getFinishOrderAmount = (order: any) =>
  order?.exchangedTotalValue ??
  order?.totalValue ??
  order?.totalAmount ??
  order?.grandTotal ??
  0;

const buildCartCheckoutFinishOrder = ({
  currentProjectInfo,
  fallbackProjectName,
  listCarts = [],
}: {
  currentProjectInfo?: any;
  fallbackProjectName: string;
  listCarts?: any[];
}) => {
  const projectName = currentProjectInfo?.name || fallbackProjectName;
  const orders = listCarts.map((order: any) => {
    const products = getFinishOrderProducts(order);
    const code = order?.code || order?.orderCode;

    return {
      raw: order,
      code,
      orderPath: code ? `/orders/${code}` : "/orders",
      merchantUrl: order?.merchantUrl,
      marketplaceImage: order?.marketplace?.image,
      merchantImage: order?.image || order?.merchantImage,
      merchantName: order?.merchantName || order?.merchantCode || "---",
      quantity: getFinishOrderQuantity(order),
      productCount: products.length,
      amount: getFinishOrderAmount(order),
    };
  });

  return {
    hasOrders: orders.length > 0,
    orders,
    projectName,
  };
};

const moneyToPercent = (money: number | string, amount: number | string) => {
  const total = Number(amount || 0);
  if (!total) return 0;
  return Number(((Number(money || 0) / total) * 100).toFixed(2));
};

const readJsonStorage = (key: string) => {
  try {
    return LocalStoreUtil.getJson(key) || {};
  } catch {
    return {};
  }
};

const isFullProjectInfo = (projectInfo: any) =>
  Boolean(projectInfo?.tenantConfig?.generalConfig);

const openPopupCenter = (
  { url, title, w, h }: { url: string; title: string; w: number; h: number },
  callback?: (popup: Window | null) => void,
) => {
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    window.screen.width;
  const height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    window.screen.height;
  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;
  const popup = window.open(
    url,
    title,
    `scrollbars=yes,width=${w / systemZoom},height=${h / systemZoom},top=${top},left=${left}`,
  );

  popup?.focus();
  callback?.(popup);
};

const createBiffinUrl = ({
  username,
  partnerId,
  redirectUri,
  phone,
  email,
  fullname,
}: {
  username?: string;
  partnerId?: string;
  redirectUri?: string;
  phone?: string;
  email?: string;
  fullname?: string;
}) => {
  const nonce =
    window.crypto?.randomUUID?.() || `${Date.now()}${Math.random()}`;
  LocalStoreUtil.setItem("FinUuid", nonce);
  const params = new URLSearchParams({
    partner_id: partnerId || "",
    identify_id: username || "",
    nonce,
    phone: phone || "",
    email: email || "",
    full_name: fullname || "",
  });

  return `${redirectUri || ""}?${params.toString()}`;
};

export const useCartCheckoutPage = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { tenantConfig } = useTenantTheme();
  const { draftOrderId } = useParams();
  const { data: draftOrder, isLoading } = useDraftOrderQuery(draftOrderId);
  const { data: profile } = useCustomerProfile();
  const { data: balanceData } = useCustomerBalance();
  const { data: addresses, isFetching: isFetchingAddresses } =
    useAddressesQuery({
      page: 0,
      receivingAddress: false,
      size: 9999,
      sort: "defaultAddress:desc,createdAt:desc",
    });
  const isAddressesFetching = isFetchingAddresses;
  const { data: receivingAddresses, isFetching: isFetchingReceivingAddresses } =
    useAddressesQuery({
      page: 0,
      receivingAddress: true,
      size: 9999,
      sort: "defaultAddress:desc,createdAt:desc",
    });
  const {
    mutateAsync: updateDraftOrderAsync,
    isPending: isUpdatingDraftOrder,
  } = useUpdateDraftOrderMutation(draftOrderId);
  const createOrder = useCreateCustomerOrderMutation();
  const {
    mutateAsync: checkShoppingCartLoanableAsync,
    isPending: isCheckingShoppingCartLoanable,
  } = useCheckShoppingCartLoanableMutation();
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [appliedVouchers, setAppliedVouchers] = useState<any[]>([]);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [savePassword, setSavePassword] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);
  const [loanAmount, setLoanAmount] = useState(0);
  const [totalLoanAmount, setTotalLoanAmount] = useState(0);
  const [isDraftOrderLoanable, setIsDraftOrderLoanable] = useState(false);
  const storedProjectInfo = useMemo(
    () => readJsonStorage("currentProjectInfo"),
    [],
  );
  const currentProjectInfo = useMemo(() => {
    if (isFullProjectInfo(tenantConfig)) return tenantConfig;
    if (isFullProjectInfo(storedProjectInfo)) return storedProjectInfo;
    return tenantConfig || storedProjectInfo;
  }, [storedProjectInfo, tenantConfig]);
  const projectConfig = useMemo(
    () => currentProjectInfo?.tenantConfig || {},
    [currentProjectInfo],
  );
  const orderConfig = projectConfig?.orderConfig || {};
  const generalConfig = projectConfig?.generalConfig || {};
  const storedLoggedUser = useMemo(
    () => readJsonStorage("currentLoggedUser"),
    [],
  );
  const currentLoggedUser = useMemo(
    () => ({
      ...storedLoggedUser,
      ...profile,
      customerAuthorities:
        profile?.customerAuthorities || storedLoggedUser?.customerAuthorities,
      customerGroup: profile?.customerGroup || storedLoggedUser?.customerGroup,
      customerEmdLevel:
        profile?.customerEmdLevel || storedLoggedUser?.customerEmdLevel,
    }),
    [profile, storedLoggedUser],
  );
  const shopkeeperConfig = useMemo(
    () => projectConfig?.externalIntegrationConfig?.shopkeeper || {},
    [projectConfig],
  );
  const isEnabledBiffin =
    Boolean(currentLoggedUser?.customerAuthorities?.shopkeeper) &&
    Boolean(shopkeeperConfig?.enabled) &&
    Boolean(shopkeeperConfig?.enabledOrder);
  const {
    data: biffinConnection,
    refetch: refetchBiffinConnection,
    isFetching: isFetchingBiffinConnection,
  } = useBiffinConnectionQuery(isEnabledBiffin);
  const isConnectedBiffin = Boolean(
    biffinConnection?.token && biffinConnection?.tenantId,
  );
  const tenantPercent = useMemo(() => {
    const customerLevel = currentLoggedUser?.customerEmdLevel;
    const customerGroup = currentLoggedUser?.customerGroup;
    let percent = Number(projectConfig?.emdPercent || 0);

    if (customerGroup?.emdPercent) percent = Number(customerGroup.emdPercent);
    if (customerGroup?.code === "default" && customerLevel?.emdPercent) {
      percent = Number(customerLevel.emdPercent);
    }

    return percent;
  }, [currentLoggedUser, projectConfig]);
  const [depositOnDemand, setDepositOnDemand] = useState<
    number | string | undefined
  >();
  const [depositExpanded, setDepositExpanded] = useState(true);
  const merchants = useMemo(
    () => (Array.isArray(draftOrder?.merchants) ? draftOrder.merchants : []),
    [draftOrder],
  );
  const draftOrderTotalValue = useMemo(() => {
    return Number(draftOrder?.exchangedTotalValue || 0);
  }, [draftOrder?.exchangedTotalValue]);
  const sortedMerchants = useMemo(
    () =>
      merchants
        .slice()
        .sort(
          (left: any, right: any) =>
            Number(Boolean(right?.crossedThreshold)) -
            Number(Boolean(left?.crossedThreshold)),
        ),
    [merchants],
  );
  const crossedThresholdMerchants = merchants.filter(
    (merchant: any) => merchant?.crossedThreshold === false,
  );
  const draftAddressIsReceiving = !!draftOrder?.address?.receivingAddress;
  const isUsingReceiveAddress =
    draftAddressIsReceiving || !!draftOrder?.receiptAddress;
  const selectedAddressData = isUsingReceiveAddress
    ? draftOrder?.receiptAddress &&
      typeof draftOrder.receiptAddress === "object"
      ? draftOrder.receiptAddress
      : undefined
    : draftOrder?.address && typeof draftOrder.address === "object"
      ? draftOrder.address
      : undefined;
  const selectedAddressId =
    selectedAddressData?.id ||
    (isUsingReceiveAddress
      ? draftOrder?.receiptAddress?.id || draftOrder?.receiptAddress
      : draftOrder?.address?.id || draftOrder?.address);
  const selectedReceiveAddressData =
    isUsingReceiveAddress &&
    draftOrder?.address &&
    typeof draftOrder.address === "object"
      ? draftOrder.address
      : undefined;
  const selectedReceiveAddressId = isUsingReceiveAddress
    ? draftOrder?.address?.id || draftOrder?.address
    : undefined;
  const totalLink = crossedThresholdMerchants.reduce(
    (sum: number, merchant: any) => sum + getSkus(merchant).length,
    0,
  );
  const totalQuantity = crossedThresholdMerchants.reduce(
    (sum: number, merchant: any) =>
      sum +
      getSkus(merchant).reduce(
        (merchantSum: number, sku: any) =>
          merchantSum + Number(sku.quantity || 0),
        0,
      ),
    0,
  );
  const balance = Number(balanceData?.balance || profile?.balance || 0);
  const creditLimit = Number(balanceData?.creditLimit || 0);
  const totalCoupon = appliedVouchers.reduce(
    (sum, item) => sum + Number(item?.totalDiscountFee || 0),
    0,
  );
  const suspensionSchedule = currentProjectInfo?.suspensionSchedule;
  const isOrderSuspended =
    suspensionSchedule &&
    Array.isArray(suspensionSchedule.appliedFor) &&
    suspensionSchedule.appliedFor.some(
      (item: string) => item === "ALL" || item === "ORDER",
    );
  const depositPercentages = Array.isArray(orderConfig.depositPercentage)
    ? orderConfig.depositPercentage
    : [];
  const loanPercentages = useMemo(
    () =>
      Array.isArray(shopkeeperConfig?.loanPercentage)
        ? shopkeeperConfig.loanPercentage
        : [],
    [shopkeeperConfig],
  );
  const pierced = shopkeeperConfig?.pierced;
  const trueStrike = currentLoggedUser?.customerGroup?.trueStrike;
  const checkForceTrueStrike = trueStrike === null ? pierced : trueStrike;
  const biffinOptions = useMemo(() => {
    const percentBiffin = moneyToPercent(totalLoanAmount, draftOrderTotalValue);
    const listPercent =
      loanPercentages.length > 0
        ? [
            ...loanPercentages.filter(
              (item: any) => item?.rate < percentBiffin,
            ),
            { rate: percentBiffin },
          ]
        : [{ rate: percentBiffin }];

    return listPercent
      .sort((left: any, right: any) => Number(left?.rate) - Number(right?.rate))
      .map((item: any, index: number) => ({
        key: index,
        label: t("cartCheckout.advanceCapitalPercent", {
          bifinValue: item?.rate,
          value: 100 - Number(item?.rate || 0),
        }),
        money: percentToMoney(
          100 - Number(item?.rate || 0),
          draftOrderTotalValue,
        ),
        percent: item?.rate,
        moneyBifin:
          draftOrderTotalValue -
          percentToMoney(100 - Number(item?.rate || 0), draftOrderTotalValue),
      }));
  }, [draftOrderTotalValue, loanPercentages, t, totalLoanAmount]);
  const [depositMethodValue, setDepositMethodValue] = useState<{
    method: string;
    percent: number | string;
  }>({
    method: DEFAULT_METHOD_SELECTED,
    percent: tenantPercent,
  });
  const showDefaultDepositOption = !checkForceTrueStrike && tenantPercent === 0;
  const demandDepositPercentages =
    !checkForceTrueStrike && orderConfig.depositOnDemand
      ? depositPercentages.filter(
          (percent: number | string) => percent !== tenantPercent,
        )
      : [];
  const hasDepositOptions =
    showDefaultDepositOption ||
    demandDepositPercentages.length > 0 ||
    isEnabledBiffin;
  const selectedBiffinMoney =
    depositMethodValue.method === BIFFIN_METHOD_SELECTED
      ? Number(
          biffinOptions.find(
            (item: any) => item?.percent === depositMethodValue.percent,
          )?.moneyBifin || loanAmount,
        )
      : 0;
  const selectedBiffinPercent =
    depositMethodValue.method === BIFFIN_METHOD_SELECTED
      ? Number(depositMethodValue.percent || 0)
      : 0;
  const selectedCustomerPercent = 100 - selectedBiffinPercent;
  const canRechargeForDeposit =
    (isConnectedBiffin &&
      isDraftOrderLoanable &&
      depositMethodValue.method === BIFFIN_METHOD_SELECTED) ||
    depositMethodValue.method === DEFAULT_METHOD_SELECTED;
  const lackOfMoney =
    Number(draftOrder?.emdAmount || 0) >
    balance + creditLimit + selectedBiffinMoney;
  const totalLackOfMoney = moneyCeil(
    Number(draftOrder?.emdAmount || 0) - balance - selectedBiffinMoney,
  );
  const isOrderButtonDisabled = Boolean(
    createOrder.isPending ||
      (isEnabledBiffin
        ? depositMethodValue.method === BIFFIN_METHOD_SELECTED &&
          (!isConnectedBiffin || !isDraftOrderLoanable)
        : isOrderSuspended),
  );
  const isBiffinLoading =
    isFetchingBiffinConnection || isCheckingShoppingCartLoanable;
  const notifyDraftOrderError = useCallback(
    (error: any) => {
      const title = getErrorTitle(error);
      if (title === "Network fail") return;

      const messageByTitle: Record<string, string> = {
        order_service_domestic_invalid:
          "message.address_order_service_domestic_invalid",
        order_service_international_invalid:
          "message.address_order_service_international_invalid",
      };

      notification.error({
        message: t(
          messageByTitle[title] || title || "message.unconnected_error",
        ),
      });
    },
    [notification, t],
  );
  const handleChangeDepositPercent = useCallback(
    async (percent: number | string) => {
      setDepositMethodValue({
        method: DEFAULT_METHOD_SELECTED,
        percent,
      });
      setDepositOnDemand(percent);
      setLoanAmount(0);

      try {
        await updateDraftOrderAsync({
          tags: [],
          depositOnDemand: percent,
        });
      } catch (error) {
        notifyDraftOrderError(error);
      }
    },
    [notifyDraftOrderError, updateDraftOrderAsync],
  );
  const handleChangeBiffinOption = useCallback(
    async (item: any) => {
      const selectedLoanAmount = Number(item?.moneyBifin || 0);
      const maxLoanPercent = moneyToPercent(
        totalLoanAmount,
        draftOrderTotalValue,
      );
      const loanPercentage =
        item?.percent === maxLoanPercent ? null : item?.percent;

      setDepositMethodValue({
        method: BIFFIN_METHOD_SELECTED,
        percent: item?.percent,
      });
      setLoanAmount(selectedLoanAmount);
      setDepositOnDemand(undefined);
      LocalStoreUtil.setItem("lastOptionBifin", String(item?.percent));

      try {
        await updateDraftOrderAsync({ tags: [BIFFIN_METHOD_SELECTED] });
        await checkShoppingCartLoanableAsync({
          draftOrderId: draftOrder?.id,
          loanAmount: selectedLoanAmount,
          loanPercentage,
        });
      } catch (error) {
        notifyDraftOrderError(error);
      }
    },
    [
      checkShoppingCartLoanableAsync,
      draftOrder,
      draftOrderTotalValue,
      notifyDraftOrderError,
      totalLoanAmount,
      updateDraftOrderAsync,
    ],
  );
  const openConnectBiffin = useCallback(() => {
    const url = createBiffinUrl({
      username: currentLoggedUser?.username,
      partnerId: shopkeeperConfig?.partnerId,
      redirectUri: shopkeeperConfig?.redirectUri,
      phone: currentLoggedUser?.phone,
      email: currentLoggedUser?.email,
      fullname: currentLoggedUser?.fullname,
    });

    openPopupCenter(
      {
        url,
        title: "Bifiin Authentication",
        w: 1100,
        h: 600,
      },
      (popup) => {
        const timer = window.setInterval(() => {
          if (!popup || popup.closed) {
            window.clearInterval(timer);
            refetchBiffinConnection();
          }
        }, 500);
      },
    );
  }, [currentLoggedUser, refetchBiffinConnection, shopkeeperConfig]);
  const selectAddress = useCallback(
    async (address: string | number) => {
      try {
        const depositOnDemand =
          draftOrder?.tags?.length > 0 ? undefined : draftOrder?.emdPercent;

        return await updateDraftOrderAsync({
          receiptAddress: null,
          address,
          depositOnDemand,
        });
      } catch (error) {
        notifyDraftOrderError(error);
        throw error;
      }
    },
    [draftOrder, notifyDraftOrderError, updateDraftOrderAsync],
  );
  const selectReceiveAddress = useCallback(
    async (address: string | number) => {
      try {
        return await updateDraftOrderAsync({
          receiptAddress: selectedAddressId,
          address,
          depositOnDemand:
            draftOrder?.tags?.length > 0 ? undefined : draftOrder?.emdPercent,
        });
      } catch (error) {
        notifyDraftOrderError(error);
        throw error;
      }
    },
    [
      draftOrder,
      notifyDraftOrderError,
      selectedAddressId,
      updateDraftOrderAsync,
    ],
  );
  const removeReceiveAddress = useCallback(async () => {
    try {
      return await updateDraftOrderAsync({
        receiptAddress: null,
        address: selectedAddressId,
        depositOnDemand:
          draftOrder?.tags?.length > 0 ? undefined : draftOrder?.emdPercent,
      });
    } catch (error) {
      notifyDraftOrderError(error);
      throw error;
    }
  }, [
    draftOrder,
    notifyDraftOrderError,
    selectedAddressId,
    updateDraftOrderAsync,
  ]);

  useEffect(() => {
    if (!isEnabledBiffin || !isConnectedBiffin || !draftOrder?.id) return;

    let mounted = true;
    checkShoppingCartLoanableAsync({ draftOrderId: draftOrder.id })
      .then((result: any) => {
        if (!mounted) return;
        if (result?.status === "success") {
          const loans = Array.isArray(result?.loans) ? result.loans : [];
          setIsDraftOrderLoanable(true);
          setTotalLoanAmount(
            loans.reduce(
              (sum: number, item: any) => sum + Number(item?.loanAmount || 0),
              0,
            ),
          );
        } else {
          setIsDraftOrderLoanable(false);
          setTotalLoanAmount(0);
        }
      })
      .catch((error: any) => {
        if (!mounted) return;
        setIsDraftOrderLoanable(false);
        setTotalLoanAmount(0);
        notifyDraftOrderError(error);
      });

    return () => {
      mounted = false;
    };
  }, [
    checkShoppingCartLoanableAsync,
    draftOrder?.id,
    isConnectedBiffin,
    isEnabledBiffin,
    notifyDraftOrderError,
  ]);

  useEffect(() => {
    if (
      !totalLoanAmount ||
      !isEnabledBiffin ||
      !isConnectedBiffin ||
      biffinOptions.length === 0
    ) {
      return;
    }

    const minBiffin = biffinOptions[0];
    const lastOption = Number(LocalStoreUtil.getItem("lastOptionBifin"));
    const selected =
      biffinOptions.find((item: any) => item?.percent === lastOption) ||
      minBiffin;

    setDepositMethodValue({
      method: BIFFIN_METHOD_SELECTED,
      percent: selected?.percent,
    });
    setLoanAmount(Number(selected?.moneyBifin || 0));
    setDepositOnDemand(undefined);

    updateDraftOrderAsync({ tags: [BIFFIN_METHOD_SELECTED] })
      .then(() =>
        checkShoppingCartLoanableAsync({
          draftOrderId: draftOrder?.id,
          loanAmount: Number(selected?.moneyBifin || 0),
          loanPercentage: biffinOptions.length === 1 ? null : selected?.percent,
        }),
      )
      .catch((error) => {
        notifyDraftOrderError(error);
      });
  }, [
    biffinOptions,
    checkShoppingCartLoanableAsync,
    draftOrder?.id,
    isConnectedBiffin,
    isEnabledBiffin,
    notifyDraftOrderError,
    totalLoanAmount,
    updateDraftOrderAsync,
  ]);

  useEffect(() => {
    if (
      depositMethodValue.method !== BIFFIN_METHOD_SELECTED &&
      depositOnDemand === undefined &&
      tenantPercent !== undefined
    ) {
      setDepositOnDemand(tenantPercent);
      setDepositMethodValue({
        method: DEFAULT_METHOD_SELECTED,
        percent: tenantPercent,
      });
    }
  }, [depositMethodValue.method, depositOnDemand, tenantPercent]);

  const submitOrder = async (secret?: string) => {
    if (!draftOrder) return;
    if (!selectedAddressId) {
      notification.error({ message: t("cartCheckout.choose_address_error") });
      return;
    }
    if (pinOpen && !secret) {
      setPinError(t("cartCheckout.input_pin_error"));
      return;
    }

    const payload: Record<string, any> = {
      draftOrder: draftOrder.id,
      loanAmount,
      couponCodes:
        appliedVouchers.length > 0
          ? appliedVouchers.map((item) => item.code)
          : undefined,
      depositOnDemand,
    };
    if (secret) {
      payload.password = secret;
      if (savePassword) payload.savePassword = true;
    }

    try {
      const result = await createOrder.mutateAsync(payload);
      LocalStoreUtil.setItem("pinToken", result?.headers?.["x-pin-token"] || "");
      setPin("");
      setPinError("");
      setPinOpen(false);
      queryClient.invalidateQueries({ queryKey: ["customer.cart.items"] });
      queryClient.invalidateQueries({
        queryKey: ["customer.cart.items.infinite"],
      });
      queryClient.invalidateQueries({ queryKey: ["customer.cart.statistics"] });
      queryClient.invalidateQueries({ queryKey: ["orders.list"] });
      queryClient.invalidateQueries({ queryKey: ["orders.statistic"] });
      notification.success({ message: t("message.success") });
      const createdOrders = Array.isArray(result?.data) ? result.data : [];
      setCreatedOrders(createdOrders);
    } catch (error: any) {
      const title = getErrorTitle(error);
      if (title === "empty_password") {
        LocalStoreUtil.setItem("pinToken", "");
        setPin("");
        setPinError("");
        setPinOpen(true);
        return;
      }
      if (
        title === "password_not_match" ||
        title === "invalid_password" ||
        title === "invalid_pin"
      ) {
        LocalStoreUtil.setItem("pinToken", "");
        if (pinOpen) {
          setPinError(t("cartCheckout.incorrect_pin"));
        } else {
          setPin("");
          setPinError("");
          setPinOpen(true);
        }
        return;
      }
      const messageByTitle: Record<string, string> = {
        insufficient_balance: "cartCheckout.not_enough_money",
        config_group_changed: "cartCheckout.considering_before_deposit",
        system_currently_suspended: "cartCheckout.order_sespension",
        warehouse_location_not_mapped: "message.warehouse_location_not_mapped",
        other_marketplace_disabled: "message.other_marketplace_disabled",
        order_service_requires: "error.service_change",
        order_service_require_groups: "error.service_change",
        order_service_excludes: "error.service_change",
        order_service_exclude_groups: "error.service_change",
      };
      notification.error({
        message: t(messageByTitle[title] || `message.${title || "error"}`),
      });
    }
  };

  const finishOrder = useMemo(
    () =>
      buildCartCheckoutFinishOrder({
        currentProjectInfo,
        fallbackProjectName: t("cartFinishOrder.we"),
        listCarts: createdOrders,
      }),
    [createdOrders, currentProjectInfo, t],
  );

  return {
    addresses,
    appliedVouchers,
    balance,
    biffinOptions,
    canRechargeForDeposit,
    createOrder,
    createdOrders,
    finishOrder,
    creditLimit,
    crossedThresholdMerchants,
    currentProjectInfo,
    demandDepositPercentages,
    depositExpanded,
    depositMethodValue,
    depositModalOpen,
    depositOnDemand,
    draftOrder,
    draftOrderTotalValue,
    draftOrderId,
    generalConfig,
    handleChangeBiffinOption,
    handleChangeDepositPercent,
    hasDepositOptions,
    isAddressesFetching,
    isBiffinLoading,
    isConnectedBiffin,
    isDraftOrderLoanable,
    isEnabledBiffin,
    isFetchingAddresses,
    isFetchingReceivingAddresses,
    isLoading,
    isOrderButtonDisabled,
    isUpdatingDraftOrder,
    isUsingReceiveAddress,
    lackOfMoney,
    merchants,
    openConnectBiffin,
    pin,
    pinError,
    receivingAddresses,
    removeReceiveAddress,
    savePassword,
    selectAddress,
    selectReceiveAddress,
    selectedAddressData,
    selectedAddressId,
    selectedBiffinMoney,
    selectedBiffinPercent,
    selectedCustomerPercent,
    selectedReceiveAddressData,
    selectedReceiveAddressId,
    setAppliedVouchers,
    setDepositExpanded,
    setDepositModalOpen,
    setPin,
    setPinError,
    setPinOpen,
    setSavePassword,
    setVoucherOpen,
    showDefaultDepositOption,
    sortedMerchants,
    submitOrder,
    tenantPercent,
    totalCoupon,
    totalLackOfMoney,
    totalLink,
    totalQuantity,
    voucherOpen,
    pinOpen,
  };
};
