import { Layout as AntLayout, Drawer, Button, Select, Avatar } from "antd";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  LogoutOutlined,
  CarOutlined,
  AlertOutlined,
  BoxPlotOutlined,
  BellOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  WalletOutlined,
  DollarOutlined,
  BarChartOutlined,
  PayCircleOutlined,
  DownOutlined,
  GlobalOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ThemeSwitcher } from "@repo/theme-provider";

import { useCustomerBalance, useCustomerProfile, useLogout } from "@repo/hooks";
import { useLanguage, useTranslation } from "@repo/i18n";
import { moneyFormat } from "@repo/util";
import DepositModal from "../DepositModal";

const { Header, Content } = AntLayout;

export const LayoutStyleThanhla = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const currentPath = `${location.pathname}${location.search}`;
  const { t } = useTranslation();
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentLoggedUser") || "{}");
    } catch {
      return {};
    }
  }, []);
  const { data: profile } = useCustomerProfile();
  const { data: balanceData } = useCustomerBalance();
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
    t("navigation.member");
  const balance = Number(balanceData?.balance ?? currentUser?.balance ?? 0);

  const { handleLogout } = useLogout({
    onSuccess: () => navigate("/login"),
  });

  type DrawerItem = {
    key: string;
    label: string;
    icon: ReactNode;
    path?: string;
    collapsible?: boolean;
    onClick?: () => void;
  };

  const drawerItems: DrawerItem[] = [
    {
      key: "deposit",
      label: t("header.deposit"),
      icon: <DollarOutlined />,
      onClick: () => {
        setDrawerVisible(false);
        setDepositModalOpen(true);
      },
    },
    {
      key: "/dashboard",
      label: "Bảng Chung",
      icon: <FileTextOutlined />,
      path: "/dashboard",
    },
    {
      key: "/orders",
      label: "Đơn Hàng",
      icon: <BellOutlined />,
      path: "/orders",
      collapsible: true,
    },
    {
      key: "/shipments",
      label: "Đơn Ký Gửi",
      icon: <BoxPlotOutlined />,
      path: "/shipments",
    },
    {
      key: "global",
      label: "Global",
      icon: <GlobalOutlined />,
      path: "/carts",
      collapsible: true,
    },
    {
      key: "/delivery-requests",
      label: "Giao Hàng",
      icon: <CarOutlined />,
      path: "/delivery-requests",
      collapsible: true,
    },
    {
      key: "/waybills",
      label: t("navigation.waybill_short"),
      icon: <BarcodeOutlined />,
      path: "/waybills",
    },
    {
      key: "/transactions",
      label: t("navigation.transactions"),
      icon: <CalendarOutlined />,
      path: "/transactions",
    },
    {
      key: "/packages",
      label: "Hàng sai lỗi",
      icon: <FileTextOutlined />,
      path: "/packages",
    },
    {
      key: "/peer-payments",
      label: "Yêu cầu thanh toán",
      icon: <PayCircleOutlined />,
      path: "/peer-payments",
    },
    {
      key: "/claims",
      label: "Khiếu Nại",
      icon: <AlertOutlined />,
      path: "/claims",
    },
    {
      key: "/withdrawal-slips",
      label: "Yêu cầu rút tiền",
      icon: <WalletOutlined />,
      path: "/withdrawal-slips",
    },
    {
      key: "/cash-request",
      label: "Yêu cầu thu tiền mặt",
      icon: <DollarOutlined />,
      path: "/cash-request",
    },
    {
      key: "/statistics",
      label: "Thống kê chi tiêu",
      icon: <BarChartOutlined />,
      path: "/statistics",
    },
    {
      key: "/profile?tab=faqs",
      label: "Hướng dẫn",
      icon: <QuestionCircleOutlined />,
      path: "/profile?tab=faqs",
    },
  ];

  const renderDrawerItem = (item: DrawerItem) => {
    const content = (
      <>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[22px] text-neutral-900 dark:text-neutral-100">
          {item.icon}
        </span>
        <span className="min-w-0 flex-1 text-[18px] font-medium leading-6 text-neutral-800 dark:text-neutral-100">
          {item.label}
        </span>
        {item.collapsible ? (
          <DownOutlined className="text-sm text-neutral-900 dark:text-neutral-100" />
        ) : null}
      </>
    );
    const className = `flex min-h-[62px] items-center gap-4 px-7 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
      item.path === currentPath || item.path === location.pathname
        ? "bg-neutral-50 dark:bg-neutral-900"
        : ""
    }`;

    if (item.onClick) {
      return (
        <button
          key={item.key}
          type="button"
          onClick={item.onClick}
          className={`${className} w-full border-0 bg-transparent text-left`}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        key={item.key}
        to={item.path || "/"}
        onClick={() => setDrawerVisible(false)}
        className={className}
      >
        {content}
      </Link>
    );
  };

  return (
    <AntLayout className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Header Glassmorphism */}
      <Header className="flex items-center justify-between gap-3 px-6 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 h-16 sticky top-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            type="text"
            icon={<MenuOutlined className="text-xl dark:text-white" />}
            onClick={() => setDrawerVisible(true)}
          />
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black">
            T
          </div>
          <span className="font-black tracking-tighter text-lg dark:text-white">
            THANHLA
          </span>
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

      <Content className="pb-24 pt-4">
        <div className="px-4">
          <Outlet />
        </div>
      </Content>

      {/* Standard Full-Width Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16 flex items-center justify-around z-[1000] pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("dashboard") ? "text-primary" : "text-gray-400"}`}
        >
          <HomeOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {t("navigation.home")}
          </span>
        </Link>

        <Link
          to="/orders"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("orders") ? "text-primary" : "text-gray-400"}`}
        >
          <FileTextOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {t("navigation.orders")}
          </span>
        </Link>

        <Link
          to="/carts"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("carts") ? "text-primary" : "text-gray-400"}`}
        >
          <ShoppingCartOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {t("navigation.cart")}
          </span>
        </Link>

        <Link
          to="/notifications"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("notifications") ? "text-primary" : "text-gray-400"}`}
        >
          <BellOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {t("navigation.notifications")}
          </span>
        </Link>
      </div>

      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        zIndex={9999}
        width="92vw"
        styles={{
          header: { display: "none" },
          body: { padding: 0 },
          content: { overflow: "hidden" },
        }}
      >
        <div className="flex h-full flex-col bg-white dark:bg-neutral-950">
          <Link
            to="/profile"
            onClick={() => setDrawerVisible(false)}
            className="flex min-h-[132px] items-center gap-5 border-b border-neutral-200 px-7 dark:border-neutral-800"
          >
            <Avatar
              size={72}
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(displayName)}`}
              className="shrink-0 bg-neutral-100"
            />
            <div className="min-w-0">
              <div className="truncate text-[20px] font-bold leading-7 text-neutral-950 dark:text-white">
                {displayName}
              </div>
              <div className="text-[16px] font-medium leading-6 text-green-600">
                {balance >= 0 ? "+" : ""}
                {moneyFormat(balance)}
              </div>
              {userSubtitle ? (
                <div className="truncate text-xs text-neutral-400">
                  {userSubtitle}
                </div>
              ) : null}
            </div>
          </Link>

          <div className="min-h-0 flex-1 overflow-y-auto py-4">
            {drawerItems.map(renderDrawerItem)}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              disabled
              className="flex min-h-[58px] w-full items-center gap-4 border-0 bg-transparent px-7 text-left text-neutral-300"
            >
              <DesktopOutlined className="h-8 w-8 text-[22px]" />
              <span className="text-[18px] font-medium">
                Sử dụng phiên bản desktop
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDrawerVisible(false);
                handleLogout();
              }}
              className="flex min-h-[58px] w-full items-center gap-4 border-0 bg-transparent px-7 text-left text-neutral-300"
            >
              <LogoutOutlined className="h-8 w-8 text-[22px]" />
              <span className="text-[18px] font-medium">
                {t("navigation.logout")}
              </span>
            </button>
          </div>
        </div>
      </Drawer>
      <DepositModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
    </AntLayout>
  );
};

export default LayoutStyleThanhla;
