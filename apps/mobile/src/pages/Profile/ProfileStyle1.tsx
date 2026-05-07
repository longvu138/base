import React from 'react';
import { Card, Avatar, Descriptions, Skeleton } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface ProfileStyle1Props {
    profile: any;
    isLoading: boolean;
}

export const ProfileStyle1: React.FC<ProfileStyle1Props> = ({ profile, isLoading }) => {
    if (isLoading) return <Skeleton active />;

    return (
        <Card className="rounded-xl shadow-sm border-0">
            <div className="flex flex-col items-center mb-6">
                <Avatar size={80} icon={<UserOutlined />} src={profile?.avatar} />
                <h2 className="mt-4 text-xl font-bold">{profile?.fullName || profile?.username}</h2>
                <p className="text-gray-500">{profile?.email}</p>
            </div>

            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Mã thành viên">{profile?.customerCode}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{profile?.phone}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{profile?.address}</Descriptions.Item>
                <Descriptions.Item label="Ngày tham gia">{profile?.createdAt}</Descriptions.Item>
            </Descriptions>
        </Card>
    );
};
