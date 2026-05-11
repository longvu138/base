import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Select, Dropdown, Avatar } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LogoutOutlined,
    SolutionOutlined,
    WalletOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { useLanguage } from '@repo/i18n';
import { Languages } from 'lucide-react';
import { useLogout, useCustomerProfile, useCustomerBalance } from '@repo/hooks';
import { useNavigation } from './Navigation';
import { appConfig } from '@repo/config';

const { Header, Content, Footer } = AntLayout;

/**
 * ThanhlaLayout - Giao diện dành riêng cho Thanhla (gd2)
 * Phong cách Top Navigation (Horizontal Menu), không dùng Sidebar.
 */
export const ThanhlaLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
    const { data: profile } = useCustomerProfile();
    const { data: balanceData } = useCustomerBalance();

    const { handleLogout } = useLogout({
        onSuccess: () => navigate('/login')
    });

    const [currentTenant, setCurrentTenant] = useState(() => {
        return localStorage.getItem('selected-tenant') || 'thanhla';
    });

    useEffect(() => {
        const handleSync = (e: any) => setCurrentTenant(e.detail);
        window.addEventListener('app:tenant-changed', handleSync);
        return () => window.removeEventListener('app:tenant-changed', handleSync);
    }, []);

    const handleTenantUpdate = (value: string) => {
        setCurrentTenant(value);
        dispatchTenantChange(value);
    };

    const menuItems = useNavigation();
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
                        selectedKeys={[location.pathname]}
                        items={antMenuItems}
                        className="flex-1 min-w-0 border-b-0 bg-transparent dark:!bg-[#141414] font-medium"
                    />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 ml-4">
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

                    {appConfig.enableTenantSelector && (
                        <Select
                            value={currentTenant}
                            onChange={handleTenantUpdate}
                            options={getTenantOptions()}
                            style={{ width: 150 }}
                            bordered={false}
                            className="font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        />
                    )}

                    <ThemeSwitcher />

                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'profile',
                                    icon: <SolutionOutlined />,
                                    label: <Link to="/profile">Thông tin cá nhân</Link>,
                                },
                                {
                                    key: 'topup',
                                    icon: <WalletOutlined />,
                                    label: 'Nạp tiền',
                                },
                                {
                                    key: 'spending',
                                    icon: <LineChartOutlined />,
                                    label: 'Thống kê chi tiêu',
                                },
                                {
                                    type: 'divider',
                                },
                                {
                                    key: 'logout',
                                    icon: <LogoutOutlined />,
                                    label: 'Đăng xuất',
                                    danger: true,
                                    onClick: handleLogout,
                                },
                            ],
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
                Thanhla Logistics ©{new Date().getFullYear()} Created with Style 2
            </Footer>
        </AntLayout>
    );
}

export default ThanhlaLayout;
