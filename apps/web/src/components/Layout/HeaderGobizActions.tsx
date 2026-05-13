import { useState } from "react";
import { Button, Dropdown, Space, Typography, theme } from "antd";
import type { MenuProps } from "antd";
import {
  DownOutlined,
  HomeOutlined,
  LineChartOutlined,
  LogoutOutlined,
  SolutionOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useTheme } from "@repo/theme-provider";
import { useTranslation } from "@repo/i18n";
import { useCurrentExchangeRate, useNavigationMenus } from "@repo/hooks";
import { moneyFormat } from "@repo/util";
import DepositModal from "../DepositModal";

const normalizeRates = (data: any) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

export const HeaderExchangeRate = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { tenantConfig } = useTheme();
  const { data } = useCurrentExchangeRate();
  const rates = normalizeRates(data);
  const projectConfig: any = tenantConfig?.tenantConfig || {};
  const orderConfig = projectConfig.orderConfig || {};
  const shipmentConfig = projectConfig.shipmentConfig || {};
  const defaultCurrency = projectConfig.defaultCurrency || projectConfig.currency?.code || "VND";
  const rate =
    rates.find((item: any) => item?.exchange === defaultCurrency) || rates[0];

  if (!rate || rates.length >= 2 || (!shipmentConfig.enable && orderConfig.disable)) {
    return null;
  }

  return (
    <Typography.Text type="secondary" style={{ whiteSpace: "nowrap", fontSize: token.fontSizeSM }}>
      {t("header.exchange")}{" "}
      <Typography.Text strong>
        {moneyFormat(1, rate.base)} = {moneyFormat(rate.rate, rate.exchange)}
      </Typography.Text>
    </Typography.Text>
  );
};

export const HeaderSupportMenu = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { data: menuFooter = [] } = useNavigationMenus();

  const items: MenuProps["items"] = menuFooter.map((item: any, index: number) => ({
    key: item.id || item.href || index,
    label: (
      <a href={item.href} target={item.target || "_blank"} rel="noreferrer">
        <Typography.Text ellipsis style={{ maxWidth: 220 }}>
          {item.name}
        </Typography.Text>
      </a>
    ),
  }));

  if (!items.length) return null;

  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      placement="bottomRight"
      dropdownRender={(menu) => (
        <div
          style={{
            maxWidth: 280,
            maxHeight: 320,
            overflow: "auto",
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
            background: token.colorBgElevated,
          }}
        >
          {menu}
        </div>
      )}
    >
      <Button type="text" size="small">
        <Space size={4}>
          {t("header.support")}
          <DownOutlined style={{ fontSize: 10 }} />
        </Space>
      </Button>
    </Dropdown>
  );
};

export const HeaderHomeLink = () => {
  const { t } = useTranslation();
  const { tenantConfig } = useTheme();
  const projectConfig: any = tenantConfig?.tenantConfig || {};
  const homePageLink =
    projectConfig.internalLink?.poseidon?.landing ||
    (tenantConfig?.domain ? `//${tenantConfig.domain}` : "");

  if (!homePageLink) return null;

  return (
    <Button type="link" size="small" href={homePageLink} target="_blank" icon={<HomeOutlined />}>
      {t("header.homepage")}
    </Button>
  );
};

export const HeaderDepositButton = () => {
  const { t } = useTranslation();
  const { tenantConfig } = useTheme();
  const [open, setOpen] = useState(false);
  const depositWizard = tenantConfig?.tenantConfig?.generalConfig?.depositWizard;

  if (depositWizard === false) return null;

  return (
    <>
      <Button
        type="link"
        size="small"
        icon={<WalletOutlined />}
        onClick={() => setOpen(true)}
      >
        {t("header.deposit")}
      </Button>
      {open && <DepositModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
};

export const HeaderGobizActions = () => (
  <>
    <HeaderHomeLink />
    <HeaderSupportMenu />
    <HeaderExchangeRate />
    <HeaderDepositButton />
  </>
);

export const profileMenuItems = ({
  t,
  handleLogout,
  onDeposit,
}: {
  t: (key: string) => string;
  handleLogout: () => void;
  onDeposit?: () => void;
}): MenuProps["items"] => [
  {
    key: "profile",
    icon: <SolutionOutlined />,
    label: <Link to="/profile">{t("customer_info.personal_info")}</Link>,
  },
  {
    key: "topup",
    icon: <WalletOutlined />,
    label: onDeposit ? t("header.deposit") : <Link to="/transactions">{t("header.deposit")}</Link>,
    onClick: onDeposit,
  },
  {
    key: "spending",
    icon: <LineChartOutlined />,
    label: <Link to="/transactions">{t("header.statistics")}</Link>,
  },
  { type: "divider" },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    danger: true,
    label: t("login.logout_btn"),
    onClick: handleLogout,
  },
];

export default HeaderGobizActions;
