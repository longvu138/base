import { useMemo, useState } from "react";
import { createElement } from "react";
import { notification } from "antd";
import {
  AppstoreAddOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  GiftOutlined,
  HeartOutlined,
  MessageOutlined,
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

export type ProfileMode = "profile" | "password" | "pin";

export const useProfilePage = () => {
  const { t } = useTranslation();
  const { tenantConfig } = useTheme();
  const projectConfig: any = tenantConfig?.tenantConfig || {};
  const orderConfig = projectConfig.orderConfig || {};
  const generalConfig = projectConfig.generalConfig || {};
  const zaloConfig = projectConfig.zaloConfig || {};
  const externalConfig = projectConfig.externalIntegrationConfig || {};
  const diorConfig = projectConfig.diorConfig || {};

  const [mode, setMode] = useState<ProfileMode>("profile");
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
    ];

    if (generalConfig.peerPaymentEnabled) {
      items.push({
        key: "/profile/purchasing-account",
        icon: createElement(UserSwitchOutlined),
        label: t("customer_info.purchasingAccount"),
      });
    }

    if (externalConfig.shopkeeper?.enabled && user.authorities?.shopkeeper) {
      items.push({
        key: "/profile/bifiin",
        icon: createElement(UserSwitchOutlined),
        label: t("customer_info.bifin"),
      });
    }

    if (zaloConfig.zaloOaId) {
      items.push({
        key: "/profile/zalo",
        icon: createElement(MessageOutlined),
        label: t("customer_info.zalo"),
      });
    }

    items.push({
      key: "/profile/address",
      icon: createElement(EnvironmentOutlined),
      label: t("customer_info.your_address"),
    });

    if (user.authorities?.openAPI) {
      items.push({
        key: "/profile/connect-application",
        icon: createElement(ShareAltOutlined),
        label: t("userProfile.connect_application"),
      });
    }

    if (diorConfig.showHermes) {
      items.push({
        key: "/profile/transactions",
        icon: createElement(FileDoneOutlined),
        label: diorConfig.enabled
          ? t("customer_info.transaction_history_old")
          : t("customer_info.transaction_history"),
      });
    }

    if (diorConfig.enabled) {
      items.push({
        key: "/profile/new-transactions",
        icon: createElement(FileDoneOutlined),
        label: t("customer_info.transaction_history"),
      });
    }

    if (generalConfig.enableRewardPoint && generalConfig.enableCustomerLevel) {
      items.push({
        key: "/profile/vip-levels",
        icon: createElement(MoneyCollectOutlined),
        label: t("customer_info.accumulated_point"),
      });
    }

    if (!orderConfig.disable) {
      items.push({
        key: "/profile/products",
        icon: createElement(HeartOutlined),
        label: t("customer_info.saved_product"),
      });
    }

    items.push(
      {
        key: "/profile/faqs",
        icon: createElement(QuestionCircleOutlined),
        label: t("customer_info.frequently_asked_question"),
      },
      {
        key: "/profile/coupon",
        icon: createElement(GiftOutlined),
        label: t("customer_info.coupon"),
      },
    );

    if (externalConfig.telegramConfig?.enabled) {
      items.push({
        key: "/profile/telegram",
        icon: createElement(AppstoreAddOutlined),
        label: t("userProfile.telegram"),
      });
    }

    items.push({
      key: "/profile/notification",
      icon: createElement(SettingOutlined),
      label: t("userProfile.notification_config"),
    });

    return items;
  }, [diorConfig.enabled, diorConfig.showHermes, externalConfig, generalConfig, orderConfig.disable, t, user.authorities, zaloConfig.zaloOaId]);

  const updateField = async (name: string, value: string) => {
    const payloadValue = name === "dob" && value ? dayjs(value).endOf("day").toISOString() : value;
    await updateProfile.mutateAsync({ [name]: payloadValue });
    notification.success({ message: t("message.success") });
  };

  const requestEmailUpdate = (email: string) => {
    setPendingEmail(email);
    setEmailConfirmOpen(true);
  };

  const confirmEmailUpdate = async (password: string) => {
    await updateProfile.mutateAsync({ email: pendingEmail, password });
    notification.success({ message: t("userProfile.mail_change_success_plain", { newMail: pendingEmail }) });
    setEmailConfirmOpen(false);
    setPendingEmail("");
  };

  const submitPassword = async (values: any) => {
    await changePassword.mutateAsync(values);
    notification.success({ message: t("message.success") });
    setMode("profile");
  };

  const submitPin = async (values: any) => {
    await changePin.mutateAsync(values);
    notification.success({ message: t("message.success") });
    setMode("profile");
  };

  const submitRecoverPin = async (password: string) => {
    await recoverPin.mutateAsync({ password });
    notification.success({ message: t("forgot_pin.check_email") });
    setRecoverPinOpen(false);
  };

  return {
    t,
    user,
    showVipLevelBox: !!(generalConfig.enableRewardPoint && generalConfig.enableCustomerLevel),
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
