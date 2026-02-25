import React, { useState, useEffect } from 'react';
import { Card, Avatar, List, Button, Tag, Row, Col, Input, message, DatePicker, Select } from 'antd';
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
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';

import { useCustomerProfile, useUpdateCustomerProfile } from '@repo/hooks';
import dayjs from 'dayjs';

export const ProfileStyle1: React.FC = () => {
    const { data: profile, isLoading } = useCustomerProfile();
    const updateProfileMutation = useUpdateCustomerProfile();

    if (isLoading) return <div className="p-20 text-center">Đang tải thông tin...</div>;

    const user = {
        name: profile?.fullname || 'Din Din',
        username: profile?.username || 'pockyjr',
        id: profile?.code || profile?.id || 'B770',
        vipLevel: profile?.customerLevel?.name || 'VIP 0',
        points: profile?.rewardPoint || 0,
        maxPoints: profile?.customerLevel?.maxPoint || 500,
        email: profile?.email || 'example@gobiz.vn',
        dob: profile?.dob || '',
        gender: profile?.gender || '',
        phone: profile?.phone || '',
        address: profile?.contactAddress || '',
        avatar: profile?.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=DinDin"
    };

    const handleUpdateSingleField = async (name: string, value: string) => {
        let finalValue = value;
        if (name === 'dob' && value) {
            finalValue = dayjs(value).toISOString();
        }
        try {
            await updateProfileMutation.mutateAsync({ [name]: finalValue });
            message.success(`Cập nhật thành công!`);
        } catch (error) {
            message.error('Cập nhật thất bại.');
            throw error;
        }
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
                    {/* Information Details Card */}
                    <Card className="rounded-xl shadow-sm mb-6">
                        <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                            <InfoItem label="Tên đăng nhập" name="username" value={user.username} />
                            <InfoItem label="Email" name="email" value={user.email} editable onSave={handleUpdateSingleField} />
                            <InfoItem label="Họ và tên" name="fullname" value={user.name} editable onSave={handleUpdateSingleField} />
                            <InfoItem
                                label="Giới tính"
                                name="gender"
                                value={user.gender}
                                editable
                                onSave={handleUpdateSingleField}
                                type="select"
                                options={[
                                    { label: 'Nam', value: 'male' },
                                    { label: 'Nữ', value: 'female' },
                                    { label: '---', value: '' }
                                ]}
                            />
                            <InfoItem label="Ngày sinh" name="dob" value={user.dob} editable onSave={handleUpdateSingleField} />
                            <InfoItem label="Số điện thoại" name="phone" value={user.phone} editable onSave={handleUpdateSingleField} />
                            <InfoItem label="Địa chỉ liên hệ" name="contactAddress" value={user.address} editable onSave={handleUpdateSingleField} className="col-span-2" />
                        </div>

                        <div className="flex flex-wrap gap-4 mt-10 pt-6 border-t border-gray-100">
                            <Button className="h-10 px-6 rounded-lg text-primary border-primary hover:bg-primary/5">
                                Thay đổi mật khẩu
                            </Button>
                            <Button className="h-10 px-6 rounded-lg text-primary border-primary hover:bg-primary/5" icon={<EditOutlined />}>
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
    name: string;
    editable?: boolean;
    className?: string;
    type?: 'text' | 'select';
    options?: { label: string, value: string }[];
    onSave?: (name: string, value: string) => Promise<void>;
}> = ({ label, value, name, editable, className, type = 'text', options = [], onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [tempValue, setTempValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setLocalValue(value);
        setTempValue(value);
    }, [value]);

    const handleSave = async () => {
        if (!onSave) return;
        const confirmedValue = tempValue;
        setIsLoading(true);
        try {
            await onSave(name, confirmedValue);
            setLocalValue(confirmedValue);
            setIsEditing(false);
        } catch (error) {
            // Error handled in parent
        } finally {
            setIsLoading(false);
        }
    };

    const getDisplayValue = () => {
        const valToUse = localValue;
        if (name === 'dob' && valToUse) return dayjs(valToUse).format('DD/MM/YYYY');
        if (type === 'select' && options.length > 0) {
            const option = options.find(opt => opt.value === valToUse);
            return option ? option.label : '---';
        }
        return valToUse || '—';
    };

    return (
        <div className={`flex flex-col gap-1 group ${className}`}>
            <span className="text-gray-400 text-sm font-medium">{label}:</span>
            <div className="flex items-center gap-3 min-h-[32px]">
                {isEditing ? (
                    <div className="flex items-center gap-2 w-full">
                        {name === 'dob' ? (
                            <DatePicker
                                size="small"
                                className="w-full !rounded-lg text-sm font-bold h-8"
                                value={tempValue ? dayjs(tempValue) : null}
                                onChange={(date) => setTempValue(date ? date.format('YYYY-MM-DD') : '')}
                                format="DD/MM/YYYY"
                                autoFocus
                                disabled={isLoading}
                            />
                        ) : type === 'select' ? (
                            <Select
                                size="small"
                                className="w-full !rounded-lg text-sm font-bold h-8"
                                value={tempValue}
                                onChange={(val) => setTempValue(val)}
                                options={options}
                                autoFocus
                                defaultOpen
                                disabled={isLoading}
                            />
                        ) : (
                            <Input
                                size="small"
                                className="!rounded-lg text-sm font-bold h-8"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                autoFocus
                                disabled={isLoading}
                                onPressEnter={handleSave}
                                onBlur={() => !isLoading && setIsEditing(false)}
                            />
                        )}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckOutlined className="text-[12px]" />}
                                loading={isLoading}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleSave}
                                className="!rounded-lg shadow-none h-7 w-7 flex items-center justify-center min-w-[28px]"
                            />
                            <Button
                                size="small"
                                icon={<CloseOutlined className="text-[12px]" />}
                                disabled={isLoading}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    setIsEditing(false);
                                    setTempValue(localValue);
                                }}
                                className="!rounded-lg shadow-none h-7 w-7 flex items-center justify-center min-w-[28px]"
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <span className="font-bold text-gray-800 text-base">{getDisplayValue()}</span>
                        {editable && name !== 'username' && (
                            <EditOutlined
                                className="text-primary text-sm cursor-pointer transition-all transform hover:scale-125"
                                onClick={() => setIsEditing(true)}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileStyle1;
