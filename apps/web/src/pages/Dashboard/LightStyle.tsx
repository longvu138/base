import { Wallet, Home, Package, CheckCircle, Truck, XCircle, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { Dashboard } from '@repo/ui';

interface DashboardProps {
    data: any;
}

export const LightStyle = ({ data }: DashboardProps) => {
    return (
        <Dashboard title="Tổng quan">

            <Dashboard.Section columns={2}>
                <Dashboard.StatCard
                    title="Số dư tài khoản"
                    value={`${(data.user.balance / 1000000).toFixed(3)}đ`}
                    variant="clean"
                    icon={<Wallet className="text-primary" size={24} />}
                    action={
                        <a href="#" className="flex items-center gap-1 text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
                            Nạp tiền <ChevronRight size={14} />
                        </a>
                    }
                />

                <Dashboard.StatCard
                    title="Đơn hàng về kho"
                    value={data.stats.arrived}
                    description="Sẵn sàng để yêu cầu giao hàng"
                    variant="clean"
                    icon={<Home className="text-primary" size={24} />}
                    action={
                        <a href="#" className="flex items-center gap-1 text-primary text-sm font-semibold hover:opacity-80 transition-opacity">
                            Tạo yêu cầu giao <ChevronRight size={14} />
                        </a>
                    }
                />
            </Dashboard.Section>


            <Dashboard.Section
                title="Theo dõi đơn hàng"
                columns={4}
                extra={<a href="#" className="text-primary text-sm font-medium hover:underline">Xem tất cả →</a>}
            >
                <StatusCount label="Chờ xác nhận" count={data.stats.initialize || 0} icon={<Clock size={20} />} />
                <StatusCount label="Đã đặt cọc" count={data.stats.deposited} highlight icon={<CreditCard size={20} />} />
                <StatusCount label="Hàng về kho" count={data.stats.arrived} highlight icon={<Package size={20} />} />
                <StatusCount label="Vận chuyển QT" count={data.stats.shipping || 0} icon={<Truck size={20} />} />
                <StatusCount label="Chờ giao" count={data.stats.ready || 0} icon={<Package size={20} />} />
                <StatusCount label="Đang giao" count={data.stats.delivering || 0} icon={<Truck size={20} />} />
                <StatusCount label="Đã nhận hàng" count={data.stats.received || 0} icon={<CheckCircle size={20} />} />
                <StatusCount label="Đã hủy" count={data.stats.cancelled || 0} icon={<XCircle size={20} />} />
            </Dashboard.Section>
        </Dashboard>
    );
};

const StatusCount = ({ label, count, highlight, icon }: any) => (
    <div className="bg-container-bg p-5 rounded-xl border border-border flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary/20 transition-all duration-200 group cursor-pointer">
        <div className={`${highlight ? 'text-primary bg-primary/10' : 'text-gray-400 bg-layout'} p-2.5 rounded-full group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="flex flex-col items-center gap-0.5">
            <span className={`text-2xl font-bold leading-none ${highlight ? 'text-primary' : ''}`}>
                {count > 0 ? count.toLocaleString('vi-VN') : 0}
            </span>
            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider text-center">{label}</span>
        </div>
    </div>
);
