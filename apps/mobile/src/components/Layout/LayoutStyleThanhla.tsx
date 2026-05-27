import { Layout as AntLayout, Drawer, Button, Select, Avatar } from "antd";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  MenuOutlined,
  LogoutOutlined,
  HeartFilled,
  CarOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { ThemeSwitcher } from "@repo/theme-provider";

import { useLogout } from "@repo/hooks";
import { useLanguage } from "@repo/i18n";

const { Header, Content } = AntLayout;

/**
 * LayoutStyleThanhla (Mobile Thanhla)
 * Thiết kế hiện đại với Tab Bar bo tròn và Header trong suốt (Glassmorphism).
 */
export const LayoutStyleThanhla = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();

  const { handleLogout } = useLogout({
    onSuccess: () => navigate("/login"),
  });

  return (
    <AntLayout className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Header Glassmorphism */}
      <Header className="flex items-center justify-between gap-3 px-6 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 h-16 sticky top-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black">
            T
          </div>
          <span className="font-black tracking-tighter text-lg dark:text-white">
            THANHLA
          </span>
          <Button
            type="text"
            icon={<BellOutlined className="text-xl dark:text-white" />}
          />
          <Avatar
            size="small"
            src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Thanhla"
            className="border-2 border-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="scale-90">
            <ThemeSwitcher />
          </div>
          <Button
            type="text"
            icon={<MenuOutlined className="text-xl dark:text-white" />}
            onClick={() => setDrawerVisible(true)}
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
            Home
          </span>
        </Link>

        <Link
          to="/orders"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("orders") ? "text-primary" : "text-gray-400"}`}
        >
          <ShoppingCartOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Orders
          </span>
        </Link>

        <div
          onClick={() => setDrawerVisible(true)}
          className="flex flex-col items-center gap-1 text-gray-400 active:text-primary cursor-pointer"
        >
          <MenuOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Menu
          </span>
        </div>

        <Link
          to="/wishlist"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("wishlist") ? "text-primary" : "text-gray-400"}`}
        >
          <HeartFilled className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Wishlist
          </span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 ${location.pathname.includes("profile") ? "text-primary" : "text-gray-400"}`}
        >
          <UserOutlined className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Account
          </span>
        </Link>
      </div>

      {/* Menu Drawer */}
      <Drawer
        title={<div className="font-black text-xl">THANHLA MENU</div>}
        placement="bottom"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        height="85%"
        zIndex={9999}
        className="rounded-t-[40px] dark:bg-gray-950"
        styles={{
          header: { padding: "24px 24px 12px", borderBottom: "none" },
          body: { padding: "0 24px 24px" },
        }}
      >
        <div className="flex flex-col gap-8">
          {/* Profile Section */}
          <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-[32px]">
            <Avatar
              size={56}
              src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Thanhla"
              className="border-2 border-white dark:border-gray-800 shadow-sm"
            />
            <div className="flex-1">
              <div className="font-black text-lg dark:text-white leading-tight">
                Thanhla User
              </div>
              <div className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                Premium Partner
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 font-bold uppercase">
                Số dư
              </div>
              <div className="font-black text-primary text-lg">5.400.000đ</div>
            </div>
          </div>

          {/* Menu Grid - COMPLETE ITEMS */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { path: "/shipments", icon: <CarOutlined />, label: "Ký gửi" },
              {
                path: "/packages",
                icon: <ShoppingCartOutlined />,
                label: "Kiện hàng",
              },
              { path: "/claims", icon: <HomeOutlined />, label: "Khiếu nại" },
              {
                path: "/transactions",
                icon: <ShoppingCartOutlined />,
                label: "Giao dịch",
              },
              {
                path: "/withdrawal-slips",
                icon: <UserOutlined />,
                label: "Rút tiền",
              },
              {
                path: "/delivery-notes",
                icon: <CarOutlined />,
                label: "Phiếu xuất",
              },
              {
                path: "/lieferscheine",
                icon: <CarOutlined />,
                label: "Phiếu giao",
              },
              {
                path: "/delivery-requests",
                icon: <ShoppingCartOutlined />,
                label: "YC giao hàng",
              },
              { path: "/waybills", icon: <HomeOutlined />, label: "Vận đơn" },
              { path: "/address", icon: <UserOutlined />, label: "Địa chỉ" },
              {
                path: "/vouchers",
                icon: <HeartFilled />,
                label: "Mã giảm giá",
              },
              { path: "/faqs", icon: <HomeOutlined />, label: "Hỏi đáp" },
              { path: "/about", icon: <UserOutlined />, label: "Thông tin" },
            ].map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setDrawerVisible(false)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-[24px] hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
              >
                <div className="text-xl text-primary">{item.icon}</div>
                <span className="text-[10px] font-black uppercase text-center text-gray-600 dark:text-gray-400 leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm dark:text-white">
                  Giao diện tối
                </span>
              </div>
              <Select
                value={currentLanguage.code}
                onChange={changeLanguage}
                options={availableLanguages.map((lang) => ({
                  value: lang.code,
                  label: lang.flag + " " + lang.code.toUpperCase(),
                }))}
                size="small"
                variant="borderless"
                className="font-bold"
              />
            </div>

            <div
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 p-5 bg-red-500 text-white rounded-3xl cursor-pointer font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/30"
            >
              <LogoutOutlined />
              <span>Đăng xuất hệ thống</span>
            </div>
          </div>
        </div>
      </Drawer>
    </AntLayout>
  );
};

export default LayoutStyleThanhla;
