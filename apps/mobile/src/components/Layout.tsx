import { Layout as AntLayout, Menu, Drawer, Button, Select } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeOutlined, ShoppingCartOutlined, MenuOutlined, LogoutOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { useLogout } from '@repo/hooks';
import { useLanguage, useTranslation } from '@repo/i18n';

const { Header, Content } = AntLayout;

function Layout() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();

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
            label: <Link to="/dashboard" onClick={() => setDrawerVisible(false)}>{t('ui.dashboard', { defaultValue: 'Bảng điều khiển' })}</Link>,
        },
        {
            key: '/orders',
            icon: <ShoppingCartOutlined />,
            label: <Link to="/orders" onClick={() => setDrawerVisible(false)}>{t('orders.title')}</Link>,
        },
        {
            key: '/about',
            icon: <InfoCircleOutlined />,
            label: <Link to="/about" onClick={() => setDrawerVisible(false)}>{t('auth.profile')}</Link>,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined className="text-red-500" />,
            label: <span className="text-red-500">{t('auth.logout')}</span>,
            onClick: () => {
                setDrawerVisible(false);
                handleLogout();
            }
        }
    ];

    return (
        <AntLayout className="min-h-screen">
            <Header className="flex items-center justify-between px-4 bg-white border-b border-gray-100 h-14 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Select
                        value={currentLanguage.code}
                        onChange={changeLanguage}
                        options={availableLanguages.map((lang) => ({
                            value: lang.code,
                            label: lang.flag,
                        }))}
                        size="small"
                        style={{ width: 60 }}
                        bordered={false}
                        suffixIcon={null}
                    />
                    <Select
                        value={currentTenant}
                        onChange={handleTenantUpdate}
                        options={getTenantOptions()}
                        size="small"
                        style={{ width: 100 }}
                        bordered={false}
                        dropdownMatchSelectWidth={false}
                    />
                    <div className="scale-90">
                        <ThemeSwitcher />
                    </div>
                    <Button
                        type="text"
                        icon={<MenuOutlined className="text-lg" />}
                        onClick={() => setDrawerVisible(true)}
                    />
                </div>
            </Header>

            <Drawer
                title="Menu"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                bodyStyle={{ padding: 0 }}
                width={260}
            >
                <div className="p-4 bg-gray-50 mb-2">
                    <div className="font-bold">Admin User</div>
                    <div className="text-xs text-gray-500">admin@tenantos.com</div>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems.map(item => item as any)}
                    className="border-0"
                />
            </Drawer>

            <Content className="bg-layout min-h-0 overflow-auto">
                <div className="p-4">
                    <Outlet />
                </div>
            </Content>

            {/* Bottom Tab Bar for Quick Access */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 h-16 flex items-center justify-around z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <Link to="/dashboard" className={`flex flex-col items-center gap-1 ${location.pathname.includes('dashboard') ? 'text-primary' : 'text-gray-400'}`}>
                    <HomeOutlined className="text-xl" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Dashboard</span>
                </Link>
                <Link to="/orders" className={`flex flex-col items-center gap-1 ${location.pathname.includes('orders') ? 'text-primary' : 'text-gray-400'}`}>
                    <ShoppingCartOutlined className="text-xl" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Orders</span>
                </Link>
                <Link to="/about" className={`flex flex-col items-center gap-1 ${location.pathname.includes('about') ? 'text-primary' : 'text-gray-400'}`}>
                    <InfoCircleOutlined className="text-xl" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Account</span>
                </Link>
                <div onClick={() => setDrawerVisible(true)} className="flex flex-col items-center gap-1 text-gray-400">
                    <MenuOutlined className="text-xl" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Menu</span>
                </div>
            </div>
        </AntLayout>
    );
}

export default Layout;
