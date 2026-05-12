import React from 'react';
import { Button, Tooltip, Empty, Skeleton } from 'antd';
import { CopyOutlined, HeartOutlined, QuestionCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { useOrderProductsQuery } from '@repo/hooks';


interface ProductTabProps {
    orderCode: string;
}


const money = (val: any, currency = 'đ'): string => {
    if (val === null || val === undefined || isNaN(Number(val))) return '---';
    return Number(val).toLocaleString('vi-VN') + (currency === 'đ' ? 'đ' : ` ${currency}`);
};

const yen = (val: any): string => {
    if (val === null || val === undefined || isNaN(Number(val))) return '---';
    return '¥' + Number(val).toLocaleString('en-US');
};

export const ProductTab: React.FC<ProductTabProps> = ({ orderCode }) => {
    const { data: products, isLoading } = useOrderProductsQuery(orderCode);

    if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
    if (!products || products.length === 0) return <Empty description="Không có sản phẩm" />;

    const totalQty = products.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
    const totalActualQty = products.reduce((sum: number, p: any) => sum + (p.actualQuantity || 0), 0);

    return (
        <div className="product-tab-container">
            {/* Header section as seen in screenshot */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4 rounded-t-lg">
                <div className="flex items-center gap-12 flex-1">
                    <div className="font-semibold text-gray-700 min-w-[80px]">Sản phẩm</div>
                    
                    <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">{totalQty}/</span>
                        <span className="text-gray-400">{totalActualQty || '--'}</span>
                        <Tooltip title="Số lượng đặt / Số lượng thực tế">
                            <QuestionCircleOutlined className="text-gray-300 text-xs ml-1 cursor-help" />
                        </Tooltip>
                    </div>

                    <div className="text-sm font-medium text-gray-700">Đơn giá</div>
                    <div className="text-sm font-medium text-gray-700">Tiền hàng</div>
                </div>
                <Button icon={<DownloadOutlined />} size="middle" className="rounded-lg font-medium">
                    Xuất Excel
                </Button>
            </div>

            {/* Product list */}
            <div className="divide-y divide-gray-100">
                {products.map((product: any) => (
                    <div key={product.id} className="p-4 hover:bg-gray-50/30 transition-colors">
                        <div className="flex items-start gap-4">
                            {/* Image */}
                            <div className="w-20 h-20 rounded border border-gray-100 overflow-hidden flex-shrink-0 bg-white">
                                <img 
                                    src={product.image || product.thumb} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>

                            {/* Details Container */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between gap-4">
                                    {/* Name and Meta */}
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-1">
                                            {product.name}
                                        </div>
                                        <div className="text-xs text-gray-400 mb-2">
                                            {product.properties?.map((p: any) => p.value).join(' ')}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-mono text-gray-500">#{product.sku || product.code}</span>
                                            <Button 
                                                type="text" 
                                                size="small" 
                                                icon={<CopyOutlined className="text-[10px]" />} 
                                                className="h-auto p-0.5 text-blue-400 hover:text-blue-600"
                                                onClick={() => navigator.clipboard.writeText(product.sku || product.code)}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats (Align with header) */}
                                    <div className="flex items-start gap-12 w-3/5">
                                        {/* Qty */}
                                        <div className="min-w-[80px] text-sm">
                                            <span className="font-bold">{product.quantity}</span>
                                            <span className="text-gray-400">/</span>
                                            <span className="text-gray-400">{product.actualQuantity || '---'}</span>
                                        </div>

                                        {/* Unit Price */}
                                        <div className="min-w-[100px]">
                                            <div className="text-sm font-bold text-gray-900">{money(product.unitPrice)}</div>
                                            <div className="text-xs text-gray-400">{yen(product.price)}</div>
                                        </div>

                                        {/* Total Amount */}
                                        <div className="min-w-[100px]">
                                            <div className="text-sm font-bold text-gray-900">{money(product.totalPrice || (product.unitPrice * product.quantity))}</div>
                                            <div className="text-xs text-gray-400">{yen(product.amount || (product.price * product.quantity))}</div>
                                        </div>

                                        {/* Save Action */}
                                        <div className="flex-shrink-0">
                                            <Button 
                                                type="text" 
                                                icon={<HeartOutlined className="text-blue-400" />} 
                                                className="text-blue-400 hover:text-blue-600 text-xs flex items-center gap-1 font-medium"
                                            >
                                                Lưu
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Notes */}
                                <div className="mt-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-blue-400 cursor-pointer hover:underline">Ghi chú cho sản phẩm:</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <span>Ghi chú cá nhân cho sản phẩm này?</span>
                                        <Tooltip title="Ghi chú riêng tư">
                                            <QuestionCircleOutlined className="text-gray-300 cursor-help" />
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
