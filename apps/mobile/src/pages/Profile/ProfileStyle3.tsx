import React from 'react';
import { Avatar, Button as AntButton, Skeleton as AntSkeleton } from 'antd';
import { UserOutlined, EditOutlined, SettingOutlined, WalletOutlined, ShoppingCartOutlined, BellOutlined } from '@ant-design/icons';

interface ProfileStyle3Props {
    profile: any;
    isLoading: boolean;
}

export const ProfileStyle3: React.FC<ProfileStyle3Props> = ({ profile, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-6">
                <AntSkeleton.Avatar active size={100} shape="circle" style={{ display: 'block', margin: '0 auto' }} />
                <AntSkeleton active paragraph={{ rows: 4 }} />
            </div>
        );
    }

    const menuItems = [
        { icon: <ShoppingCartOutlined />, label: 'Đơn hàng của tôi', value: '12 đơn' },
        { icon: <WalletOutlined />, label: 'Ví điện tử', value: '5,000,000đ' },
        { icon: <BellOutlined />, label: 'Thông báo', value: '3 tin mới' },
        { icon: <SettingOutlined />, label: 'Cài đặt tài khoản', value: '' },
    ];

    return (
        <div className="profile-style-3 space-y-8">
            {/* User Info Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-[3rem] text-center relative overflow-hidden border border-white">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                    <div className="inline-block p-1 bg-white rounded-full shadow-xl mb-4">
                        <Avatar size={100} icon={<UserOutlined />} src={profile?.avatar} className="border-4 border-primary/10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 m-0">{profile?.fullName || profile?.username}</h2>
                    <div className="inline-block px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full mt-2 shadow-lg shadow-primary/20">
                        {profile?.customerCode || 'MEMBER'}
                    </div>
                </div>
            </div>

            {/* Quick Actions / Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[2rem] shadow-md border border-gray-50 text-center">
                    <div className="text-2xl font-black text-primary">12</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Đơn hàng</div>
                </div>
                <div className="bg-white p-5 rounded-[2rem] shadow-md border border-gray-50 text-center">
                    <div className="text-2xl font-black text-green-500">5M</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Số dư</div>
                </div>
            </div>

            {/* Menu List */}
            <div className="space-y-3">
                {menuItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500">
                                {item.icon}
                            </div>
                            <span className="font-black text-gray-700">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.value && <span className="text-[11px] font-bold text-primary px-3 py-1 bg-primary/5 rounded-full">{item.value}</span>}
                            <EditOutlined className="text-gray-300" />
                        </div>
                    </div>
                ))}
            </div>

            <AntButton type="primary" danger size="large" block className="h-14 rounded-[1.5rem] font-black shadow-xl shadow-red-500/20 mt-4 border-0">
                Đăng xuất
            </AntButton>
        </div>
    );
};
