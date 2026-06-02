import { Layout as AntLayout, Menu, Drawer, Button, Select } from "antd";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  LogoutOutlined,
  HeartFilled,
  CarOutlined,
  AlertOutlined,
  FileTextOutlined,
  BoxPlotOutlined,
  TransactionOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SendOutlined,
  TagOutlined,
  QuestionCircleOutlined,
  WalletOutlined,
  DollarOutlined,
  BellOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useMemo, useState, useEffect } from "react";
import { ThemeSwitcher } from "@repo/theme-provider";
import { getTenantOptions, dispatchTenantChange } from "@repo/tenant-config";
import { useCustomerProfile, useLogout } from "@repo/hooks";
import { useLanguage, useTranslation } from "@repo/i18n";

const { Header, Content } = AntLayout;

const getCurrentLoggedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("currentLoggedUser") || "{}");
  } catch {
    return {};
  }
};

function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  const storedUser = useMemo(getCurrentLoggedUser, []);
  const { data: profile } = useCustomerProfile();
  const currentUser = profile || storedUser;
  const displayName =
    currentUser?.fullname ||
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.username ||
    t("navigation.user");
  const userSubtitle =
    currentUser?.username ||
    currentUser?.email ||
    currentUser?.phone ||
    currentUser?.code ||
    "";

  const { handleLogout } = useLogout({
    onSuccess: () => navigate("/login"),
  });

  const [currentTenant, setCurrentTenant] = useState(() => {
    return localStorage.getItem("selected-tenant") || "baogam";
  });

  useEffect(() => {
    const handleSync = (e: any) => setCurrentTenant(e.detail);
    window.addEventListener("app:tenant-changed", handleSync);
    return () => window.removeEventListener("app:tenant-changed", handleSync);
  }, []);

  const handleTenantUpdate = (value: string) => {
    setCurrentTenant(value);
    dispatchTenantChange(value);
  };

  const menuItems = [
    {
      key: "/dashboard",
      icon: <HomeOutlined />,
      label: (
        <Link to="/dashboard" onClick={() => setDrawerVisible(false)}>
          {t("navigation.dashboard")}
        </Link>
      ),
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: (
        <Link to="/orders" onClick={() => setDrawerVisible(false)}>
          {t("navigation.orders")}
        </Link>
      ),
    },
    {
      key: "/shipments",
      icon: <CarOutlined />,
      label: (
        <Link to="/shipments" onClick={() => setDrawerVisible(false)}>
          {t("navigation.shipments")}
        </Link>
      ),
    },
    {
      key: "/packages",
      icon: <BoxPlotOutlined />,
      label: (
        <Link to="/packages" onClick={() => setDrawerVisible(false)}>
          {t("navigation.packages")}
        </Link>
      ),
    },
    {
      key: "/claims",
      icon: <AlertOutlined />,
      label: (
        <Link to="/claims" onClick={() => setDrawerVisible(false)}>
          {t("navigation.claims")}
        </Link>
      ),
    },
    {
      key: "/transactions",
      icon: <TransactionOutlined />,
      label: (
        <Link to="/transactions" onClick={() => setDrawerVisible(false)}>
          {t("navigation.transactions")}
        </Link>
      ),
    },
    {
      key: "/withdrawal-slips",
      icon: <WalletOutlined />,
      label: (
        <Link to="/withdrawal-slips" onClick={() => setDrawerVisible(false)}>
          {t("navigation.withdrawal_slips")}
        </Link>
      ),
    },
    {
      key: "/cash-request",
      icon: <DollarOutlined />,
      label: (
        <Link to="/cash-request" onClick={() => setDrawerVisible(false)}>
          {t("navigation.cash_request")}
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "/delivery-notes",
      icon: <FileTextOutlined />,
      label: (
        <Link to="/delivery-notes" onClick={() => setDrawerVisible(false)}>
          {t("navigation.delivery_notes")}
        </Link>
      ),
    },
    {
      key: "/lieferscheine",
      icon: <CarOutlined />,
      label: (
        <Link to="/lieferscheine" onClick={() => setDrawerVisible(false)}>
          {t("navigation.lieferscheine")}
        </Link>
      ),
    },
    {
      key: "/delivery-requests",
      icon: <SendOutlined />,
      label: (
        <Link to="/delivery-requests" onClick={() => setDrawerVisible(false)}>
          {t("navigation.delivery_requests")}
        </Link>
      ),
    },
    {
      key: "/waybills",
      icon: <TagOutlined />,
      label: (
        <Link to="/waybills" onClick={() => setDrawerVisible(false)}>
          {t("navigation.waybill_short")}
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: (
        <Link to="/profile" onClick={() => setDrawerVisible(false)}>
          {t("navigation.profile")}
        </Link>
      ),
    },
    {
      key: "/notifications",
      icon: <BellOutlined />,
      label: (
        <Link to="/notifications" onClick={() => setDrawerVisible(false)}>
          {t("navigation.notifications")}
        </Link>
      ),
    },
    {
      key: "/statistics",
      icon: <BarChartOutlined />,
      label: (
        <Link to="/statistics" onClick={() => setDrawerVisible(false)}>
          {t("navigation.statistics")}
        </Link>
      ),
    },
    {
      key: "/address",
      icon: <EnvironmentOutlined />,
      label: (
        <Link to="/address" onClick={() => setDrawerVisible(false)}>
          {t("navigation.address_short")}
        </Link>
      ),
    },
    {
      key: "/vouchers",
      icon: <TagOutlined />,
      label: (
        <Link to="/vouchers" onClick={() => setDrawerVisible(false)}>
          {t("navigation.vouchers")}
        </Link>
      ),
    },
    {
      key: "/wishlist",
      icon: <HeartFilled />,
      label: (
        <Link to="/wishlist" onClick={() => setDrawerVisible(false)}>
          {t("navigation.wishlist_short")}
        </Link>
      ),
    },
    {
      key: "/faqs",
      icon: <QuestionCircleOutlined />,
      label: (
        <Link to="/faqs" onClick={() => setDrawerVisible(false)}>
          {t("navigation.faqs_short")}
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-500">{t("navigation.logout")}</span>,
      onClick: () => {
        setDrawerVisible(false);
        handleLogout();
      },
    },
  ];

  return (
    <AntLayout className="min-h-screen">
      <Header className="flex items-center justify-between gap-3 px-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 h-14 sticky top-0 z-50">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            type="text"
            icon={<MenuOutlined className="text-lg" />}
            onClick={() => setDrawerVisible(true)}
          />
          <Select
            value={currentTenant}
            onChange={handleTenantUpdate}
            options={getTenantOptions()}
            size="small"
            style={{ width: 100 }}
            variant="borderless"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="scale-90">
            <ThemeSwitcher />
          </div>
          <Select
            value={currentLanguage.code}
            onChange={changeLanguage}
            options={availableLanguages.map((lang) => ({
              value: lang.code,
              label: lang.flag,
            }))}
            size="small"
            style={{ width: 60 }}
            variant="borderless"
            suffixIcon={null}
          />
        </div>
      </Header>

      <Drawer
        title={t("navigation.menu")}
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
        width={260}
      >
        <div className="p-4 bg-gray-50 dark:bg-gray-800 mb-2">
          <div className="font-bold dark:text-white">{displayName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {userSubtitle}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map((item) => item as any)}
          className="border-0"
        />
      </Drawer>

      <Content className="bg-layout min-h-0 overflow-auto pb-20">
        <div className="p-4">
          <Outlet />
        </div>
      </Content>

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-16 flex items-center justify-around z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("dashboard") ? "text-primary" : "text-gray-400"}`}
        >
          <HomeOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {t("navigation.home")}
          </span>
        </Link>
        <Link
          to="/orders"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("orders") ? "text-primary" : "text-gray-400"}`}
        >
          <FileTextOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {t("navigation.orders")}
          </span>
        </Link>
        <Link
          to="/carts"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("carts") ? "text-primary" : "text-gray-400"}`}
        >
          <ShoppingCartOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {t("navigation.cart")}
          </span>
        </Link>
        <Link
          to="/notifications"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("notifications") ? "text-primary" : "text-gray-400"}`}
        >
          <BellOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {t("navigation.notifications")}
          </span>
        </Link>
      </div>
    </AntLayout>
  );
}

export default Layout;
