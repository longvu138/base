import { Card, Skeleton } from 'antd';

export const VouchersStyle1 = ({ vouchers, isLoading }: any) => {
    if (isLoading) return <Skeleton active />;
    return (
        <div className="space-y-4">
            {vouchers?.map((v: any) => (
                <Card key={v.id} className="rounded-xl border-0 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
                    <div className="flex">
                        <div className="w-24 bg-primary flex items-center justify-center text-white font-bold p-2 text-center">
                            {v.discountValue?.toLocaleString()}{v.discountType === 'percent' ? '%' : 'đ'}
                        </div>
                        <div className="flex-1 p-4">
                            <div className="font-bold mb-1">{v.code}</div>
                            <div className="text-xs text-gray-500 mb-2">{v.description}</div>
                            <div className="text-[10px] text-gray-400">HSD: {v.expiredAt}</div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
