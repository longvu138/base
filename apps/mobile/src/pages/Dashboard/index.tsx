import { Card, Typography, Space, Statistic, Progress } from 'antd';
import {
    ShoppingCart,
    Truck,
    CheckCircle,
    AlertCircle,
    Wallet,
    TrendingUp
} from 'lucide-react';
import { useTranslation } from '@repo/i18n';

const { Title, Text } = Typography;

const DASHBOARD_DATA = {
    user: {
        name: "DOAN DUYEN",
        balance: 100100000
    },
    stats: {
        purchased: { count: 30, value: 823850000 },
        delivered: { count: 41, value: 55500000 },
        shipping: { count: 12, items: 45 },
        ready: { count: 3, items: 3, debt: 35000000 },
        initialize: 5,
        deposited: 1139,
        arrived: 69,
        delivering: 5,
        received: 1240,
        cancelled: 2
    }
};

export const Dashboard = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 pb-24">

            <Card className="bg-primary border-0 rounded-2xl overflow-hidden relative shadow-lg shadow-primary/20">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 right-0 p-4 opacity-20">
                    <TrendingUp size={80} className="text-white" />
                </div>

                <Space direction="vertical" size={2} className="relative z-10 w-full">
                    <Text className="text-white/80 font-medium">{t('ui.welcome', { defaultValue: 'Xin chào' })},</Text>
                    <Title level={3} className="!text-white !m-0 !mb-3">{DASHBOARD_DATA.user.name}</Title>

                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md">
                        <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                            <Wallet size={16} />
                            <span>{t('ui.balance', { defaultValue: 'Số dư ví' })}</span>
                        </div>
                        <Title level={2} className="!text-white !m-0">
                            {DASHBOARD_DATA.user.balance.toLocaleString()}đ
                        </Title>
                    </div>
                </Space>
            </Card>


            <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm rounded-xl py-2" bodyStyle={{ padding: '16px 20px' }}>
                    <Statistic
                        title={<Text type="secondary" className="text-xs uppercase font-bold tracking-wider">{t('ui.purchased', { defaultValue: 'Đã mua' })}</Text>}
                        value={DASHBOARD_DATA.stats.purchased.count}
                        prefix={<ShoppingCart size={18} className="text-blue-500 mr-2" />}
                    />
                </Card>
                <Card className="border-0 shadow-sm rounded-xl py-2" bodyStyle={{ padding: '16px 20px' }}>
                    <Statistic
                        title={<Text type="secondary" className="text-xs uppercase font-bold tracking-wider">{t('ui.shipping', { defaultValue: 'Vận chuyển' })}</Text>}
                        value={DASHBOARD_DATA.stats.shipping.count}
                        prefix={<Truck size={18} className="text-orange-500 mr-2" />}
                    />
                </Card>
                <Card className="border-0 shadow-sm rounded-xl py-2" bodyStyle={{ padding: '16px 20px' }}>
                    <Statistic
                        title={<Text type="secondary" className="text-xs uppercase font-bold tracking-wider">{t('ui.received', { defaultValue: 'Đã nhận' })}</Text>}
                        value={DASHBOARD_DATA.stats.received}
                        prefix={<CheckCircle size={18} className="text-green-500 mr-2" />}
                    />
                </Card>
                <Card className="border-0 shadow-sm rounded-xl py-2" bodyStyle={{ padding: '16px 20px' }}>
                    <Statistic
                        title={<Text type="secondary" className="text-xs uppercase font-bold tracking-wider">{t('ui.cancelled', { defaultValue: 'Đã hủy' })}</Text>}
                        value={DASHBOARD_DATA.stats.cancelled}
                        prefix={<AlertCircle size={18} className="text-red-500 mr-2" />}
                    />
                </Card>
            </div>


            <Card className="border-0 shadow-sm rounded-2xl" title={<Title level={5} className="!m-0">{t('ui.order_overview', { defaultValue: 'Tổng quan đơn hàng' })}</Title>}>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <Text className="font-medium">{t('ui.delivered_orders', { defaultValue: 'Đơn đã bàn giao' })}</Text>
                            <Text strong className="text-primary">{DASHBOARD_DATA.stats.delivered.count}</Text>
                        </div>
                        <Progress
                            percent={85}
                            strokeColor="var(--tenant-primary-color)"
                            showInfo={false}
                            strokeWidth={10}
                            trailColor="var(--tenant-bg-layout)"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-y-4">
                        <div className="space-y-1">
                            <div className="text-xs text-gray-400">{t('ui.arrived', { defaultValue: 'Hàng về kho' })}</div>
                            <div className="font-bold text-lg">{DASHBOARD_DATA.stats.arrived}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-gray-400">{t('ui.delivering', { defaultValue: 'Đang phát hàng' })}</div>
                            <div className="font-bold text-lg">{DASHBOARD_DATA.stats.delivering}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-gray-400">{t('ui.deposited', { defaultValue: 'Chờ thanh toán' })}</div>
                            <div className="font-bold text-lg">{DASHBOARD_DATA.stats.deposited}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-gray-400">{t('ui.initialize', { defaultValue: 'Đơn chờ duyệt' })}</div>
                            <div className="font-bold text-lg">{DASHBOARD_DATA.stats.initialize}</div>
                        </div>
                    </div>
                </div>
            </Card>


            {DASHBOARD_DATA.stats.ready.count > 0 && (
                <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30 rounded-2xl">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-orange-800">{DASHBOARD_DATA.stats.ready.count} {t('ui.ready_orders_desc', { defaultValue: 'kiện hàng sẵn sàng giao' })}</div>
                            <div className="text-orange-700 text-sm">{t('ui.ready_debt', { defaultValue: 'Tiền nợ còn thiếu' })}: {DASHBOARD_DATA.stats.ready.debt.toLocaleString()}đ</div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Dashboard;
