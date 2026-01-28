import { Layout as AntLayout, Menu, Select, Button } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    HomeOutlined,
    ShoppingCartOutlined,
    LogoutOutlined,
    WalletOutlined,
    CarOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { useState, useEffect } from 'react';
import { useLanguage } from '@repo/i18n';
import { Languages } from 'lucide-react';
import { useLogout } from '@repo/hooks';

const { Header, Sider, Content } = AntLayout;

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
    const [collapsed, setCollapsed] = useState(false);

    const { handleLogout } = useLogout({
        onSuccess: () => navigate('/login')
    });

    const [currentTenant, setCurrentTenant] = useState(() => {
        return localStorage.getItem('selected-tenant') || 'default';
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

    const menuItems = [
        {
            key: '/dashboard',
            icon: <HomeOutlined />,
            label: <Link to="/dashboard">Dashboard</Link>,
        },
        {
            key: '/orders',
            icon: <ShoppingCartOutlined />,
            label: <Link to="/orders">Orders</Link>,
        },
        {
            key: '/shipments',
            icon: <CarOutlined />,
            label: <Link to="/shipments">Shipments</Link>,
        },
        {
            key: '/transactions',
            icon: <WalletOutlined />,
            label: <Link to="/transactions">Transactions</Link>,
        },
    ];

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
                    items={menuItems}
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

export default Layout;
