import React from 'react';
import { Card, Avatar, List, Progress, Button, Tag, Row, Col } from 'antd';
import {
    UserOutlined,
    EditOutlined,
    WalletOutlined,
    LinkOutlined,
    MessageOutlined,
    EnvironmentOutlined,
    AppstoreAddOutlined,
    HistoryOutlined,
    GiftOutlined,
    HeartOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

import { useCustomerProfile } from '@repo/hooks';

export const ProfileStyle1: React.FC = () => {
    const { data: profile, isLoading } = useCustomerProfile();

    if (isLoading) return <div className="p-20 text-center">Đang tải thông tin...</div>;

    const user = {
        name: profile?.fullname || 'Din Din',
        username: profile?.username || 'pockyjr',
        id: profile?.code || profile?.id || 'B770',
        vipLevel: profile?.customerLevel?.name || 'VIP 0',
        points: profile?.rewardPoint || 0,
        maxPoints: profile?.customerLevel?.maxPoint || 500,
        email: profile?.email || 'example@gobiz.vn',
        dob: profile?.dob || '...',
        gender: profile?.gender || '...',
        phone: profile?.phone || '...',
        address: profile?.contactAddress || '...',
        avatar: profile?.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=DinDin"
    };

    const sidebarMenu = [
        { key: 'info', icon: <UserOutlined />, label: 'Thông tin tài khoản', active: true },
        { key: 'loan', icon: <WalletOutlined />, label: 'Tài khoản mượn' },
        { key: 'bifin', icon: <LinkOutlined />, label: 'Liên kết BiFin' },
        { key: 'zalo', icon: <MessageOutlined />, label: 'Zalo' },
        { key: 'address', icon: <EnvironmentOutlined />, label: 'Địa chỉ của bạn' },
        { key: 'apps', icon: <AppstoreAddOutlined />, label: 'Kết nối ứng dụng' },
        { key: 'history_old', icon: <HistoryOutlined />, label: 'Lịch sử giao dịch (cũ)' },
        { key: 'history', icon: <HistoryOutlined />, label: 'Lịch sử giao dịch' },
        { key: 'points', icon: <GiftOutlined />, label: 'Điểm tích lũy' },
        { key: 'saved', icon: <HeartOutlined />, label: 'Sản phẩm đã lưu' },
    ];

    return (
        <div className="max-w-[1400px] mx-auto pb-10">
            <h1 className="text-xl font-bold mb-6">Thông tin cá nhân</h1>

            <Row gutter={24}>
                {/* Left Sidebar */}
                <Col span={6}>
                    <Card
                        className="rounded-xl shadow-sm overflow-hidden mb-6"
                        bodyStyle={{ padding: 0 }}
                    >
                        <div className="flex flex-col items-center py-8 border-b border-gray-100">
                            <Avatar
                                size={100}
                                icon={<UserOutlined />}
                                className="bg-gray-100 text-primary mb-4 p-4"
                                src={user.avatar}
                            />
                            <h2 className="text-xl font-bold m-0">{user.name}</h2>
                            <p className="text-gray-500 text-sm mb-1">{user.username} | {user.id}</p>
                            <Tag color="gold" className="rounded-full px-3 py-0.5 border-0 font-bold">
                                {user.vipLevel} | {user.points.toLocaleString()} điểm
                            </Tag>
                        </div>
                        <List
                            dataSource={sidebarMenu}
                            renderItem={(item) => (
                                <List.Item
                                    className={`px-6 py-4 cursor-pointer transition-colors border-0 border-l-4 ${item.active ? 'bg-primary/5 border-primary text-primary font-medium' : 'hover:bg-gray-50 border-transparent text-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Main Content */}
                <Col span={18}>
                    {/* VIP Progress Card */}
                    {/* <Card
                        className="rounded-xl shadow-sm mb-6 border-0 overflow-hidden"
                        bodyStyle={{
                            background: 'linear-gradient(90deg, #1890ff 0%, #36cfc9 100%)',
                            padding: '30px',
                            color: 'white'
                        }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="text-3xl font-black mb-2 flex items-center gap-2">
                                {user.points.toLocaleString()} / {user.maxPoints}
                                <InfoCircleOutlined className="text-lg opacity-70 cursor-pointer" />
                            </div>
                            <div className="w-full max-w-xl relative pt-4 pb-2">
                                <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-wider">
                                    <span>VIP {user.vipLevel}</span>
                                    <span>VIP {user.vipLevel}</span>
                                </div>
                                <Progress
                                    percent={(user.points / user.maxPoints) * 100}
                                    showInfo={false}
                                    strokeColor="white"
                                    trailColor="rgba(255,255,255,0.2)"
                                    strokeWidth={12}
                                />
                            </div>
                        </div>
                    </Card> */}

                    {/* Information Details Card */}
                    <Card className="rounded-xl shadow-sm mb-6">
                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                            <InfoItem label="Tên đăng nhập" value={user.username} />
                            <InfoItem label="Email" value={user.email} editable />
                            <InfoItem label="Họ và tên" value={user.name} editable />
                            <InfoItem label="Giới tính" value={user.gender} editable />
                            <InfoItem label="Ngày sinh" value={user.dob} editable />
                            <InfoItem label="Số điện thoại" value={user.phone} editable />
                            <InfoItem label="Địa chỉ liên hệ" value={user.address} editable className="col-span-2" />
                        </div>

                        <div className="flex flex-wrap gap-4 mt-10 pt-6 border-t border-gray-100">
                            <Button className="h-10 px-6 rounded-lg text-primary border-primary hover:bg-primary/5">
                                Thay đổi mật khẩu
                            </Button>
                            <Button className="h-10 px-6 rounded-lg text-primary border-primary hover:bg-primary/5">
                                Thay đổi mã PIN
                            </Button>
                            <Button className="h-10 px-6 rounded-lg text-primary border-primary hover:bg-primary/5">
                                Khôi phục mã PIN
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const InfoItem: React.FC<{
    label: string;
    value: string;
    editable?: boolean;
    className?: string;
}> = ({ label, value, editable, className }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <span className="text-gray-400 text-sm">{label}:</span>
        <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">{value}</span>
            {editable && <EditOutlined className="text-primary text-xs cursor-pointer hover:scale-110 transition-transform" />}
        </div>
    </div>
);

export default ProfileStyle1;
