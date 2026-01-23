import { Layout as AntLayout, Menu, Typography, Drawer, Button, Select } from 'antd';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeOutlined, InfoCircleOutlined, MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';

const { Header, Content, Footer } = AntLayout;
const { Title } = Typography;

function Layout() {
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);

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
            key: '/',
            icon: <HomeOutlined />,
            label: <Link to="/" onClick={() => setDrawerVisible(false)}>Home</Link>,
        },
        {
            key: '/about',
            icon: <InfoCircleOutlined />,
            label: <Link to="/about" onClick={() => setDrawerVisible(false)}>About</Link>,
        },
    ];

    return (
        <AntLayout className="min-h-screen">
            <Header className="flex items-center justify-between px-4 bg-white dark:bg-dark-container shadow-sm sticky top-0 z-50">
                <Title level={4} className="!mb-0 text-primary">
                    Mobile App
                </Title>
                <div className="flex items-center gap-2">
                    <Select
                        value={currentTenant}
                        onChange={handleTenantUpdate}
                        options={getTenantOptions()}
                        size="small"
                        style={{ width: 150 }}
                        placeholder="Tenant"
                    />
                    <div className="scale-90">
                        <ThemeSwitcher />
                    </div>
                    <Button
                        type="text"
                        icon={<MenuOutlined className="text-xl" />}
                        onClick={() => setDrawerVisible(true)}
                        className="lg:hidden"
                    />
                </div>
            </Header>

            <Drawer
                title="Navigation"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                bodyStyle={{ padding: 0 }}
            >
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    className="border-0"
                />
            </Drawer>

            <Content className="bg-gray-50 dark:bg-dark-bg min-h-0 overflow-auto">
                <div className="px-4 py-6">
                    <Outlet />
                </div>
            </Content>

            <Footer className="text-center bg-white dark:bg-dark-container border-t border-gray-100 dark:border-gray-800 text-xs py-4">
                Mobile Version ©2026
            </Footer>
        </AntLayout>
    );
}

export default Layout;
