import { useMemo, useState } from "react";
import { createElement } from "react";
import { App } from "antd";
import {
  EnvironmentOutlined,
  FileDoneOutlined,
  GiftOutlined,
  HeartOutlined,
  MoneyCollectOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ShareAltOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useTheme } from "@repo/theme-provider";
import { useTranslation } from "@repo/i18n";
import {
  useChangeCustomerPassword,
  useChangeCustomerPin,
  useCustomerBalance,
  useCustomerProfile,
  useRecoverCustomerPin,
  useUpdateCustomerProfile,
} from "@repo/hooks";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";

export type ProfileMode =
  | "profile"
  | "password"
  | "pin"
  | "address"
  | "transactions"
  | "notifications"
  | "faqs"
  | "vouchers"
  | "vip-levels"
  | "purchasing-account"
  | "telegram"
  | "saved-products";

const profileModes: ProfileMode[] = [
  "profile",
  "password",
  "pin",
  "address",
  "transactions",
  "notifications",
  "faqs",
  "vouchers",
  "vip-levels",
  "purchasing-account",
  "telegram",
  "saved-products",
];

const resolveProfileError = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.title ||
  error?.message ||
  fallback;

export const useProfilePage = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tenantConfig } = useTheme();
  const projectConfig: any = tenantConfig?.tenantConfig || {};
  const generalConfig = projectConfig.generalConfig || {};
  const showCustomerLevel = generalConfig.enableRewardPoint !== false && generalConfig.enableCustomerLevel !== false;

  const tab = searchParams.get("tab") as ProfileMode | null;
  const mode = tab && profileModes.includes(tab) ? tab : "profile";
  const setMode = (nextMode: ProfileMode) => {
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      if (nextMode === "profile") {
        params.delete("tab");
      } else {
        params.set("tab", nextMode);
      }
      return params;
    });
  };
  const [recoverPinOpen, setRecoverPinOpen] = useState(false);
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const { data: profile, isLoading: isProfileLoading } = useCustomerProfile();
  const { data: balanceData, isLoading: isBalanceLoading } = useCustomerBalance();
  const updateProfile = useUpdateCustomerProfile();
  const changePassword = useChangeCustomerPassword();
  const changePin = useChangeCustomerPin();
  const recoverPin = useRecoverCustomerPin();

  const user = useMemo(
    () => ({
      fullname: profile?.fullname || "",
      username: profile?.username || "",
      code: profile?.code || profile?.id || "",
      avatar: profile?.avatar,
      email: profile?.email || "",
      phone: profile?.phone || "",
      dob: profile?.dob || "",
      gender: profile?.gender || "",
      contactAddress: profile?.contactAddress || "",
      rewardPoint: Number(profile?.rewardPoint || 0),
      customerLevel: profile?.customerLevel,
      balance: Number(balanceData?.balance ?? profile?.balance ?? 0),
      authorities: profile?.customerAuthorities || {},
      customerEmdLevel: profile?.customerEmdLevel,
    }),
    [balanceData?.balance, profile],
  );

  const menuItems = useMemo(() => {
    const items = [
      {
        key: "/profile",
        icon: createElement(UserOutlined),
        label: t("customer_info.account_info"),
      },
      {
        key: "/address",
        icon: createElement(EnvironmentOutlined),
        label: t("customer_info.address"),
      },
      {
        key: "/transactions",
        icon: createElement(FileDoneOutlined),
        label: t("customer_info.transaction_history"),
      },
      {
        key: "/notifications",
        icon: createElement(SettingOutlined),
        label: t("userProfile.notification_config"),
      },
      {
        key: "/faqs",
        icon: createElement(QuestionCircleOutlined),
        label: t("customer_info.guide"),
      },
      {
        key: "/vouchers",
        icon: createElement(GiftOutlined),
        label: t("customer_info.voucher_list"),
      },
    ];

    items.push(
      {
        key: "/profile/vip-levels",
        icon: createElement(MoneyCollectOutlined),
        label: t("customer_info.accumulated_point"),
      },
      {
        key: "/profile/purchasing-account",
        icon: createElement(UserSwitchOutlined),
        label: t("customer_info.lending_account"),
      },
      {
        key: "/profile/telegram",
        icon: createElement(ShareAltOutlined),
        label: t("userProfile.connect_telegram"),
      },
      {
        key: "/profile/products",
        icon: createElement(HeartOutlined),
        label: t("customer_info.saved_product"),
      },
    );

    return items;
  }, [t]);

  const updateField = async (name: string, value: string) => {
    const payloadValue = name === "dob" && value ? dayjs(value).endOf("day").toISOString() : value;
    try {
      await updateProfile.mutateAsync({ [name]: payloadValue });
      notification.success({ message: t("message.success") });
    } catch (error: any) {
      notification.error({ message: resolveProfileError(error, t("common.error")) });
    }
  };

  const requestEmailUpdate = (email: string) => {
    setPendingEmail(email);
    setEmailConfirmOpen(true);
  };

  const confirmEmailUpdate = async (password: string) => {
    try {
      await updateProfile.mutateAsync({ email: pendingEmail, password });
      notification.success({ message: t("userProfile.mail_change_success_plain", { newMail: pendingEmail }) });
      setEmailConfirmOpen(false);
      setPendingEmail("");
    } catch (error: any) {
      notification.error({ message: resolveProfileError(error, t("common.error")) });
    }
  };

  const submitPassword = async (values: any) => {
    try {
      await changePassword.mutateAsync(values);
      notification.success({ message: t("message.success") });
      setMode("profile");
    } catch (error: any) {
      notification.error({ message: resolveProfileError(error, t("common.error")) });
    }
  };

  const submitPin = async (values: any) => {
    try {
      await changePin.mutateAsync(values);
      notification.success({ message: t("message.success") });
      setMode("profile");
    } catch (error: any) {
      notification.error({ message: resolveProfileError(error, t("common.error")) });
    }
  };

  const submitRecoverPin = async (password: string) => {
    try {
      await recoverPin.mutateAsync({ password });
      notification.success({ message: t("forgot_pin.check_email") });
      setRecoverPinOpen(false);
    } catch (error: any) {
      notification.error({ message: resolveProfileError(error, t("common.error")) });
    }
  };

  return {
    t,
    user,
    showVipLevelBox: showCustomerLevel,
    menuItems,
    mode,
    setMode,
    recoverPinOpen,
    setRecoverPinOpen,
    emailConfirmOpen,
    setEmailConfirmOpen,
    isLoading: isProfileLoading || isBalanceLoading,
    isSubmitting:
      updateProfile.isPending ||
      changePassword.isPending ||
      changePin.isPending ||
      recoverPin.isPending,
    updateField,
    requestEmailUpdate,
    confirmEmailUpdate,
    submitPassword,
    submitPin,
    submitRecoverPin,
  };
};
