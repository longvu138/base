import { Layout as AntLayout, Menu, Typography, Select, Avatar, Dropdown } from 'antd';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, InfoCircleOutlined, UserOutlined, LogoutOutlined, AppstoreOutlined } from '@ant-design/icons';
import { ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { useState, useEffect } from 'react';
import { useLanguage } from '@repo/i18n';
import { Languages } from 'lucide-react';
import { useLogout } from '@repo/hooks';

const { Header, Content } = AntLayout;
const { Title } = Typography;

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
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
            icon: <AppstoreOutlined />,
            label: <Link to="/dashboard">Dashboard</Link>,
        },
        {
            key: '/orders',
            icon: <ShoppingCartOutlined />,
            label: <Link to="/orders">Orders</Link>,
        },
        {
            key: '/shipments',
            icon: <InfoCircleOutlined />,
            label: <Link to="/shipments">Shipments</Link>,
        },
    ];

    const userMenu = {
        items: [
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'Hồ sơ cá nhân',
            },
            {
                type: 'divider' as const,
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                danger: true,
                onClick: handleLogout
            },
        ]
    };

    return (
        <AntLayout className="min-h-screen">
            <Header className="flex items-center justify-between px-8 shadow-sm">
                <div className="flex items-center gap-8">
                    <Title level={3} className="!mb-0 text-primary cursor-pointer select-none" onClick={() => navigate('/')}>
                        Web App
                    </Title>

                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        className="border-0 bg-transparent min-w-[300px]"
                        style={{ lineHeight: '64px' }}
                    />
                </div>

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

                    <div className="w-px h-6 bg-gray-200 mx-2"></div>

                    {/* User Profile & Logout */}
                    <Dropdown menu={userMenu} placement="bottomRight" arrow>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-full transition-colors">
                            <Avatar size="small" icon={<UserOutlined />} className="bg-primary" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:inline-block">Admin User</span>
                        </div>
                    </Dropdown>
                </div>
            </Header>
            <Content className="bg-layout">
                <div className="p-6">
                    <Outlet />
                </div>
            </Content>

        </AntLayout>
    );
}

export default Layout;
