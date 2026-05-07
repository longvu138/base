import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Select, Button, Avatar, Space, Dropdown } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    SolutionOutlined,
    WalletOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { useLanguage } from '@repo/i18n';
import { Languages } from 'lucide-react';
import { useLogout, useCustomerProfile, useCustomerBalance } from '@repo/hooks';
import { formatCurrency } from '@repo/util';
import { useNavigation } from './Navigation';


const { Header, Sider, Content } = AntLayout;

/**
 * SpecializedLayout - Giao diện dành riêng cho Gobiz (gd3)
 * Tập trung vào tính hiện đại, Sidebar bo tròn, Header nổi
 */
const SpecializedLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
    const [collapsed, setCollapsed] = useState(false);
    const { data: profile } = useCustomerProfile();
    const { data: balanceData } = useCustomerBalance();
    const { handleLogout } = useLogout({ onSuccess: () => navigate('/login') });

    const [currentTenant, setCurrentTenant] = useState(() => localStorage.getItem('selected-tenant') || 'baogam');
    useEffect(() => {
        const handleSync = (e: any) => setCurrentTenant(e.detail);
        window.addEventListener('app:tenant-changed', handleSync);
        return () => window.removeEventListener('app:tenant-changed', handleSync);
    }, []);

    const menuItems = useNavigation();
    const antMenuItems = menuItems.map(item => ({
        key: item.path,
        icon: item.icon,
        label: <Link to={item.path}>{item.label}</Link>,
    }));

    return (
        <AntLayout className="h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={260}
                className="!bg-white dark:!bg-[#141414] border-r border-gray-100 dark:border-gray-800 m-4 rounded-2xl shadow-sm"
                trigger={null}
            >
                <div className="h-20 flex items-center justify-center font-black text-2xl text-primary bg-white dark:bg-[#141414] rounded-t-2xl uppercase tracking-tighter">
                    {collapsed ? 'G' : 'Gobiz OS'}
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={antMenuItems}
                    className="border-0 px-2 dark:!bg-[#141414]"
                    style={{ background: 'transparent' }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                    <Button
                        type="default"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        danger
                        className="w-full flex items-center justify-center rounded-xl border-red-100 hover:bg-red-50"
                    >
                        {!collapsed && 'Đăng xuất'}
                    </Button>
                </div>
            </Sider>

            <AntLayout className="bg-transparent overflow-hidden">
                <Header className="mt-4 mb-2 flex items-center justify-between bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all h-16">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-lg dark:text-gray-400"
                    />

                    <div className="flex items-center gap-6">
                        <Space className="flex">
                            <Select
                                value={currentLanguage.code}
                                onChange={changeLanguage}
                                options={availableLanguages.map((lang) => ({
                                    value: lang.code,
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <span>{lang.flag}</span>
                                            <span className="dark:text-gray-300 font-medium">{lang.code.toUpperCase()}</span>
                                        </div>
                                    ),
                                }))}
                                style={{ width: 100 }}
                                variant='borderless'
                                suffixIcon={<Languages size={14} className="text-gray-400" />}
                            />

                            <Select
                                value={currentTenant}
                                onChange={(val) => dispatchTenantChange(val)}
                                options={getTenantOptions()}
                                style={{ width: 160 }}
                                variant='borderless'
                                className="font-bold text-gray-800 dark:text-gray-200"
                            />
                        </Space>

                        <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-800 mx-2" />

                        <ThemeSwitcher />

                        <Button type="text" icon={<BellOutlined />} className="text-gray-400 hover:text-primary" />

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
                        >
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 px-2 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 min-w-[140px]">
                                {(!profile && !balanceData) ? (
                                    <div className="flex items-center gap-2 animate-pulse">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                                        <div className="flex flex-col gap-1">
                                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded" />
                                            <div className="w-20 h-2 bg-gray-100 dark:bg-gray-800 rounded" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Avatar
                                            src={profile?.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=DinDin"}
                                            size="default"
                                            className="border border-primary/20"
                                        />
                                        <div className='flex flex-col gap-0.5'>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                                {profile?.fullname || profile?.username || 'Din Din'}
                                            </span>
                                            <span className="text-xs text-primary font-black">
                                                +{formatCurrency(balanceData?.balance || profile?.balance || 0)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="overflow-auto pr-6">
                    <Outlet />
                </Content>
            </AntLayout>
        </AntLayout>
    );
};

export default SpecializedLayout;
