import React from 'react';
import { Card, Tag, Button, Empty, Skeleton } from 'antd';
import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';

interface AddressStyle1Props {
    addresses: any[];
    isLoading: boolean;
}

export const AddressStyle1: React.FC<AddressStyle1Props> = ({ addresses, isLoading }) => {
    if (isLoading) return <Skeleton active />;

    return (
        <div className="space-y-4">
            <Button type="dashed" block icon={<PlusOutlined />} className="h-12 rounded-xl border-primary text-primary">
                Thêm địa chỉ mới
            </Button>

            {addresses?.length === 0 ? (
                <Empty description="Chưa có địa chỉ nào" />
            ) : (
                addresses?.map((addr) => (
                    <Card key={addr.id} className="rounded-xl shadow-sm border-0">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-base">{addr.receiverName}</span>
                            {addr.isDefault && <Tag color="primary" className="m-0 rounded-md">Mặc định</Tag>}
                        </div>
                        <div className="text-gray-500 text-sm mb-1">{addr.receiverPhone}</div>
                        <div className="text-gray-600 text-sm flex gap-2">
                            <EnvironmentOutlined className="mt-1 flex-shrink-0" />
                            <span>{addr.address}, {addr.wardName}, {addr.districtName}, {addr.provinceName}</span>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};
