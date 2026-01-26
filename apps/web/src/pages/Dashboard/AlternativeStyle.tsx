import { Wallet, Package, ShoppingCart, Truck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Dashboard } from '@repo/ui';
import { Button } from 'antd';

interface DashboardProps {
    data: any;
}

export const AlternativeStyle = ({ data }: DashboardProps) => {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-6">Tổng quan (Layout B)</h2>

            <div className="flex lg:flex-row gap-6 h-full">


                <div className="w-full lg:w-1/3 flex flex-col gap-6">

                    <div className="bg-primary/0 rounded-2xl p-6 text-primary shadow-lg">
                        <div className="flex items-center gap-2 opacity-80 mb-1">
                            <Wallet size={20} />
                            <span className="text-sm font-medium">Số dư khả dụng</span>
                        </div>
                        <div className="text-4xl font-bold mb-6 tracking-tight">
                            {(data.user.balance / 1000000).toFixed(3)} <span className="text-lg opacity-60 font-normal">đ</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                                <ArrowDownLeft size={18} /> Nạp tiền
                            </Button>
                            <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                                <ArrowUpRight size={18} /> Rút tiền
                            </Button>
                        </div>
                    </div>


                    <div className="flex flex-col gap-4">
                        <Dashboard.StatCard
                            title="Tiền hàng đã mua"
                            value={(data.stats.purchased.value / 1000000).toFixed(1) + ' Tr'}
                            icon={<ShoppingCart size={20} />}
                            variant="clean"
                            description="Tổng tích lũy"
                        />
                        <Dashboard.StatCard
                            title="Công nợ cần thanh toán"
                            value={(data.stats.ready.debt / 1000000).toFixed(1) + ' Tr'}
                            icon={<Wallet size={20} />}
                            variant="clean"
                            className="border-l-4 border-l-orange-500"
                        />
                    </div>
                </div>


                <div className="w-full lg:w-2/3 flex flex-col gap-6">


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Dashboard.StatCard
                            title="Chờ mua"
                            value={data.stats.initialize}
                            variant="clean"
                            className="bg-blue-50/50 border-blue-100"
                        />
                        <Dashboard.StatCard
                            title="Đang vận chuyển"
                            value={data.stats.shipping.count}
                            variant="clean"
                            className="bg-purple-50/50 border-purple-100"
                            icon={<Truck className="text-purple-500" />}
                        />
                        <Dashboard.StatCard
                            title="Kho VN"
                            value={data.stats.arrived}
                            variant="clean"
                            className="bg-green-50/50 border-green-100"
                            icon={<Package className="text-green-500" />}
                        />
                    </div>


                    <div className="bg-container-bg rounded-xl border border-border shadow-sm flex-1 p-6">
                        <h3 className="font-bold text-inherit mb-4 flex items-center gap-2">
                            <Package size={20} className="text-gray-400" />
                            Trạng thái đơn hàng
                        </h3>

                        <div className="space-y-4">
                            <ProgressStatus label="Đã đặt cọc" count={data.stats.deposited} total={2000} color="bg-blue-500" />
                            <ProgressStatus label="Người bán giao" count={data.stats.delivered.count} total={2000} color="bg-indigo-500" />
                            <ProgressStatus label="Đang về kho" count={data.stats.shipping.count} total={200} color="bg-purple-500" />
                            <ProgressStatus label="Sẵn sàng giao" count={data.stats.ready.count} total={200} color="bg-green-500" />
                            <ProgressStatus label="Đã nhận" count={data.stats.received} total={5000} color="bg-gray-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ProgressStatus = ({ label, count, total, color }: any) => {
    const percent = Math.min((count / (total || 1)) * 100, 100);
    return (
        <div className="flex items-center gap-4">
            <div className="w-32 text-sm text-gray-600 font-medium">{label}</div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
            </div>
            <div className="w-16 text-right font-bold text-gray-800">{count}</div>
        </div>
    );
}
