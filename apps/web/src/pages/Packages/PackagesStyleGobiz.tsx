import React from 'react';
import { BarcodeOutlined, InboxOutlined } from '@ant-design/icons';
import { Card, Space, Tabs, Typography, theme } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { DeliveryRequestsStyleGobiz } from '../DeliveryRequests/DeliveryRequestsStyleGobiz';
import { PackageStyleGobiz } from './PackageStyleGobiz';

export const PackagesStyleGobiz: React.FC = () => {
    const { token } = theme.useToken();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'packages';

    const handleTabChange = (key: string) => {
        setSearchParams({ tab: key }, { replace: true });
    };

    const items = [
        {
            key: 'packages',
            label: (
                <Space>
                    <BarcodeOutlined />
                    <span>Kien hang</span>
                </Space>
            ),
            children: <PackageStyleGobiz isTabView={true} />,
        },
        {
            key: 'delivery',
            label: (
                <Space>
                    <InboxOutlined />
                    <span>Yeu cau giao hang</span>
                </Space>
            ),
            children: <DeliveryRequestsStyleGobiz isTabView={true} />,
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
                <Typography.Title level={3} style={{ margin: 0 }}>
                    Quan ly Giao hang
                </Typography.Title>
            </Card>

            <Card bodyStyle={{ paddingTop: token.paddingSM }}>
                <Tabs
                    activeKey={activeTab}
                    items={items}
                    onChange={handleTabChange}
                    type="line"
                    size="large"
                />
            </Card>
        </Space>
    );
};
