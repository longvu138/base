import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Select, Dropdown, Avatar } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '@repo/theme-provider';
import { useLanguage, useTranslation } from '@repo/i18n';
import { Languages } from 'lucide-react';
import { useLogout, useCustomerProfile, useCustomerBalance } from '@repo/hooks';
import { useNavigation } from './Navigation';
import HeaderCartLink from './HeaderCartLink';
import HeaderNotificationLink from './HeaderNotificationLink';
import HeaderGobizActions, { profileMenuItems } from './HeaderGobizActions';
import DepositModal from '../DepositModal';

const { Header, Content, Footer } = AntLayout;

/**
 * LayoutStyleThanhla - Giao diện dành riêng cho Thanhla (thanhla)
 * Phong cách Top Navigation (Horizontal Menu), không dùng Sidebar.
 */
export const LayoutStyleThanhla: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
    const { t } = useTranslation();
    const [isDepositModalOpen, setDepositModalOpen] = useState(false);
    const { data: profile } = useCustomerProfile();
    const { data: balanceData } = useCustomerBalance();

    const { handleLogout } = useLogout({
        onSuccess: () => navigate('/login')
    });

    const menuItems = useNavigation();
    const currentPath = `${location.pathname}${location.search}`;
    const activeMenu = menuItems.find(item =>
        currentPath === item.path ||
        (!item.path.includes('?') &&
            item.path !== '/' &&
            (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)))
    );
    const antMenuItems = menuItems.map(item => ({
        key: item.path,
        icon: item.icon,
        label: <Link to={item.path}>{item.label}</Link>,
    }));

    return (
        <AntLayout className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Header / Top Navigation */}
            <Header className="sticky top-0 z-50 w-full flex items-center justify-between px-6 bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-gray-800 shadow-sm h-16 overflow-hidden">
                
                <div className="flex items-center gap-8 flex-1 min-w-0">
                    {/* Logo Area */}
                    <div
                        className="flex items-center gap-2 font-black text-2xl text-primary cursor-pointer tracking-tight"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center text-lg">T</div>
                        <span className="hidden md:inline-block">THANHLA</span>
                    </div>

                    {/* Horizontal Menu */}
                    <Menu
                        mode="horizontal"
                        selectedKeys={activeMenu ? [activeMenu.path] : []}
                        items={antMenuItems}
                        className="flex-1 min-w-0 border-b-0 bg-transparent dark:!bg-[#141414] font-medium"
                    />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 ml-4">
                    <HeaderGobizActions />

                    <Select
                        value={currentLanguage.code}
                        onChange={changeLanguage}
                        options={availableLanguages.map((lang) => ({
                            value: lang.code,
                            label: (
                                <div className="flex items-center gap-2">
                                    <span>{lang.flag}</span>
                                    <span>{lang.code.toUpperCase()}</span>
                                </div>
                            ),
                        }))}
                        style={{ width: 100 }}
                        bordered={false}
                        suffixIcon={<Languages size={14} />}
                    />

                    <ThemeSwitcher />

                    <HeaderNotificationLink />

                    <HeaderCartLink />

                    <Dropdown
                        menu={{
                            items: profileMenuItems({
                                t,
                                handleLogout,
                                onDeposit: () => setDepositModalOpen(true),
                            }),
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 px-3 rounded-full transition-all border border-gray-200 dark:border-gray-700">
                            {(!profile && !balanceData) ? (
                                <div className="flex items-center gap-2 animate-pulse">
                                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
                                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
                                </div>
                            ) : (
                                <>
                                    <Avatar
                                        src={profile?.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=Thanhla"}
                                        size="small"
                                        className="border border-primary/20"
                                    />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden md:inline-block">
                                        {profile?.fullname || profile?.username || 'Thanhla User'}
                                    </span>
                                </>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </Header>

            {/* Main Content Area */}
            <Content className="p-6 md:px-12 lg:px-24 xl:px-48 mx-auto w-full max-w-[1600px] flex-1">
                <div className="bg-transparent rounded-lg">
                    <Outlet />
                </div>
            </Content>

            <Footer className="text-center text-gray-400 bg-transparent pb-6">
                Thanhla Logistics ©{new Date().getFullYear()} Thanhla UI
            </Footer>
            {isDepositModalOpen && (
                <DepositModal
                    open={isDepositModalOpen}
                    onClose={() => setDepositModalOpen(false)}
                />
            )}
        </AntLayout>
    );
}

export default LayoutStyleThanhla;
