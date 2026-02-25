import { Layout as AntLayout, Menu, Select, Button, Dropdown, Avatar, Space } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DownOutlined,
    SolutionOutlined,
    WalletOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { useState, useEffect } from 'react';
import { useLanguage } from '@repo/i18n';
import { Languages } from 'lucide-react';
import { useLogout, useCustomerProfile, useCustomerBalance } from '@repo/hooks';
import { useNavigation } from './Navigation';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const { Header, Sider, Content } = AntLayout;

export const VerticalLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
    const [collapsed, setCollapsed] = useState(false);
    const { data: profile } = useCustomerProfile();
    const { data: balanceData } = useCustomerBalance();

    const { handleLogout } = useLogout({
        onSuccess: () => navigate('/login')
    });

    const [currentTenant, setCurrentTenant] = useState(() => {
        return localStorage.getItem('selected-tenant') || 'baogam';
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
        <AntLayout className="h-screen overflow-hidden">
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                theme="dark"
                className="!bg-white dark:!bg-[#141414] border-r border-gray-200 dark:border-gray-800"
                width={240}
                trigger={
                    <div className="bg-white dark:bg-[#141414] border-r border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors">
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </div>
                }
            >
                <div
                    className="h-16 flex items-center justify-center font-bold text-xl text-primary cursor-pointer border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800"
                    onClick={() => navigate('/')}
                >
                    {collapsed ? 'WA' : 'Web App'}
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={antMenuItems}
                    className="border-0 h-[calc(100vh-64px-56px)] dark:!bg-[#141414]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-14 flex items-center justify-center border-t border-gray-200 dark:border-gray-800 dark:bg-[#141414]">
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        danger
                        className="w-full"
                    >
                        {!collapsed && 'Logout'}
                    </Button>
                </div>
            </Sider>

            <AntLayout className="h-screen flex flex-col">
                <Header className="flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div></div>

                    <div className="flex items-center gap-4">
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

                        <Select
                            value={currentTenant}
                            onChange={handleTenantUpdate}
                            options={getTenantOptions()}
                            style={{ width: 140 }}
                            bordered={false}
                            placeholder="Select Tenant"
                        />

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

                        <ThemeSwitcher />
                    </div>
                </Header>

                <Content className="bg-layout overflow-auto flex-1 min-h-0">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </Content>
            </AntLayout>
        </AntLayout>
    );
}

export default VerticalLayout;
