import React from 'react';
import { Button as AntButton, Tag, Empty, Skeleton as AntSkeleton } from 'antd';
import { PlusOutlined, EditOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';

interface AddressStyle3Props {
    addresses: any[];
    isLoading: boolean;
}

export const AddressStyle3: React.FC<AddressStyle3Props> = ({ addresses, isLoading }) => {
    if (isLoading) return <AntSkeleton active />;

    return (
        <div className="address-style-3 space-y-6">
            <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest m-0">Danh sách địa chỉ</p>
                <AntButton type="primary" shape="circle" icon={<PlusOutlined />} className="shadow-lg shadow-primary/30" />
            </div>

            {addresses?.length === 0 ? (
                <Empty description="Chưa có địa chỉ nào" />
            ) : (
                addresses?.map((addr) => (
                    <div key={addr.id} className="bg-white p-6 rounded-[2.5rem] shadow-md border border-gray-50 relative overflow-hidden active:scale-[0.98] transition-all">
                        <div className={`absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8 ${addr.isDefault ? 'bg-primary/10' : 'bg-gray-50'}`}></div>
                        
                        <div className="flex items-start gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${addr.isDefault ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400'}`}>
                                {addr.type === 'home' ? <HomeOutlined style={{ fontSize: '20px' }} /> : <ShoppingOutlined style={{ fontSize: '20px' }} />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-base font-black text-gray-900 truncate">{addr.receiverName}</div>
                                    <div className="text-primary cursor-pointer"><EditOutlined /></div>
                                </div>
                                <div className="text-xs font-bold text-gray-400 mb-3">{addr.receiverPhone}</div>
                                
                                <div className="text-sm font-medium text-gray-600 line-clamp-2 leading-relaxed">
                                    {addr.address}, {addr.wardName}, {addr.districtName}, {addr.provinceName}
                                </div>

                                {addr.isDefault && (
                                    <div className="mt-4 flex">
                                        <Tag className="rounded-full px-3 py-0.5 m-0 border-0 bg-primary/10 text-primary font-black text-[9px] uppercase">
                                            Mặc định
                                        </Tag>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}

            <AntButton type="dashed" block className="h-14 rounded-[1.5rem] border-2 border-dashed border-gray-200 text-gray-400 font-black hover:border-primary hover:text-primary transition-all">
                Thêm vị trí mới
            </AntButton>
        </div>
    );
};
