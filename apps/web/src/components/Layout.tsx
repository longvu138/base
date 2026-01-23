import { Layout as AntLayout, Menu, Typography, Select } from 'antd';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ThemeSwitcher } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { useState, useEffect } from 'react';

const { Header, Content, Footer } = AntLayout;
const { Title } = Typography;

function Layout() {
    const location = useLocation();

    // Lấy tenant hiện tại từ storage (chỉ để hiển thị value trong Select)
    const [currentTenant, setCurrentTenant] = useState(() => {
        return localStorage.getItem('selected-tenant') || 'default';
    });

    // Cập nhật Select khi có sự kiện bên ngoài
    useEffect(() => {
        const handleSync = (e: any) => setCurrentTenant(e.detail);
        window.addEventListener('app:tenant-changed', handleSync);
        return () => window.removeEventListener('app:tenant-changed', handleSync);
    }, []);

    const handleTenantUpdate = (value: string) => {
        setCurrentTenant(value);
        dispatchTenantChange(value); // Inject thẳng thông tin tenant mới
    };

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: <Link to="/">Home</Link>,
        },
        {
            key: '/about',
            icon: <InfoCircleOutlined />,
            label: <Link to="/about">About</Link>,
        },
    ];

    return (
        <AntLayout className="min-h-screen">
            <Header className="flex items-center justify-between px-8 bg-white dark:bg-dark-container shadow-sm">
                <div className="flex items-center gap-4">
                    <Title level={3} className="!mb-0 text-primary">
                        Web App
                    </Title>
                </div>
                <div className="flex items-center gap-6">
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        className="border-0 bg-transparent"
                    />
                    <Select
                        value={currentTenant}
                        onChange={handleTenantUpdate}
                        options={getTenantOptions()}
                        style={{ width: 180 }}
                        placeholder="Select Tenant"
                    />
                    <ThemeSwitcher />
                </div>
            </Header>
            <Content className="p-8 bg-gray-50 dark:bg-dark-bg min-h-0 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </Content>
            <Footer className="text-center bg-white dark:bg-dark-container border-t border-gray-100 dark:border-gray-800">
                Turbo Monorepo Ant Design Theme ©2026
            </Footer>
        </AntLayout>
    );
}

export default Layout;
