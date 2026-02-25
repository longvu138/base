import React, { useState, useEffect } from 'react';
import { Avatar, Button, Tag, Row, Col, Space, Divider, Typography, Skeleton, Input, message, DatePicker, Select } from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SafetyCertificateOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    LockOutlined,
    CheckOutlined,
    CloseOutlined,
    KeyOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useCustomerProfile, useCustomerBalance, useUpdateCustomerProfile } from '@repo/hooks';
import { formatCurrency } from '@repo/util';
import dayjs from 'dayjs';
import './ProfileStyle3.css';

const { Title, Text } = Typography;

export const ProfileStyle3: React.FC = () => {
    const { data: profile, isLoading: isProfileLoading } = useCustomerProfile();
    const { data: balanceData, isLoading: isBalanceLoading } = useCustomerBalance();
    const updateProfileMutation = useUpdateCustomerProfile();

    if (isProfileLoading || isBalanceLoading) {
        return (
            <div className="p-10 max-w-[1200px] mx-auto">
                <Skeleton active avatar paragraph={{ rows: 10 }} />
            </div>
        );
    }

    const user = {
        name: profile?.fullname || '',
        username: profile?.username || '',
        id: profile?.code || profile?.id || '',
        vipLevel: profile?.customerLevel?.name || 'Standard',
        points: profile?.rewardPoint || 0,
        maxPoints: profile?.customerLevel?.maxPoint || 500,
        email: profile?.email || '',
        phone: profile?.phone || '',
        dob: profile?.dob || '',
        gender: profile?.gender || '',
        address: profile?.contactAddress || '',
        avatar: profile?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=DinDin",
        balance: balanceData?.balance || 0
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

    return (
        <div className="ps3-container max-w-[1200px] mx-auto py-8 px-4 space-y-8">
            {/* Hero Header Card - Light Theme Refresh */}
            <div className="ps3-hero-card p-8 bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800">
                <div className="ps3-hero-overlay opacity-[0.03]" />
                <Row gutter={[32, 32]} align="middle" className="relative z-10">
                    <Col>
                        <div className="relative">
                            <Avatar
                                size={120}
                                src={user.avatar}
                                icon={<UserOutlined />}
                                className="border-4 border-gray-50 dark:border-gray-800 shadow-xl"
                            />
                            <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900" />
                        </div>
                    </Col>
                    <Col flex="1">
                        <div className="space-y-1">
                            <Space align="center" size={12}>
                                <Title level={2} className="!m-0 font-black text-gray-800 dark:text-white">
                                    {user.name || profile?.username}
                                </Title>
                                <Tag color="gold" className="!rounded-full !px-3 font-bold border-0 bg-yellow-400 text-yellow-900">
                                    {user.vipLevel}
                                </Tag>
                            </Space>
                            <div className="flex items-center gap-4 text-gray-400 font-medium">
                                <span>@{user.username}</span>
                                <Divider type="vertical" className="border-gray-200 dark:border-gray-700" />
                                <span>ID: {user.id}</span>
                            </div>
                        </div>

                        <div className="mt-6 max-w-md">
                            <div className="flex justify-between items-end mb-2">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    Tiến trình thăng hạng
                                </Text>
                                <Text className="text-primary text-xs font-black">
                                    {user.points.toLocaleString()} / {user.maxPoints.toLocaleString()}
                                </Text>
                            </div>
                            <div className="ps3-progress-container !bg-gray-100 dark:!bg-gray-800">
                                <div
                                    className="ps3-progress-bar !bg-primary"
                                    style={{ width: `${Math.min((user.points / user.maxPoints) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </Col>
                    <Col md={6} xs={24}>
                        <div className="flex flex-col gap-3">
                            <div className="ps3-stat-item bg-primary/5 border-primary/10">
                                <Text className="text-primary/60 block text-[10px] font-bold uppercase tracking-widest">
                                    Số dư khả dụng
                                </Text>
                                <Title level={3} className="!m-0 !mt-1 font-black !text-primary">
                                    {formatCurrency(user.balance)}
                                </Title>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Row gutter={[24, 24]}>
                {/* Left Side: Personal Info */}
                <Col lg={16} span={24}>
                    <div className="ps3-card p-6 h-full">
                        <div className="flex justify-between items-center mb-8">
                            <Title level={4} className="!m-0 font-black flex items-center gap-3">
                                <SafetyCertificateOutlined className="text-primary" />
                                Thông tin tài khoản
                            </Title>
                        </div>

                        <div className="ps3-info-grid">
                            <InfoItem icon={<UserOutlined />} label="Họ và tên" name="fullname" value={user.name} onSave={handleUpdateSingleField} />
                            <InfoItem icon={<MailOutlined />} label="Email liên hệ" name="email" value={user.email} onSave={handleUpdateSingleField} />
                            <InfoItem icon={<PhoneOutlined />} label="Số điện thoại" name="phone" value={user.phone} onSave={handleUpdateSingleField} />
                            <InfoItem icon={<CalendarOutlined />} label="Ngày sinh" name="dob" type="date" value={user.dob} onSave={handleUpdateSingleField} />
                            <InfoItem
                                icon={<UserOutlined />}
                                label="Giới tính"
                                name="gender"
                                type="select"
                                value={user.gender}
                                onSave={handleUpdateSingleField}
                                options={[
                                    { label: 'Nam', value: 'male' },
                                    { label: 'Nữ', value: 'female' },
                                    { label: '---', value: '' }
                                ]}
                            />
                            <InfoItem icon={<EnvironmentOutlined />} label="Địa chỉ" name="contactAddress" value={user.address} onSave={handleUpdateSingleField} />
                        </div>

                        <Divider className="my-8" />

                        <div className="flex flex-wrap gap-4">
                            <Button icon={<LockOutlined />} className="ps3-btn-outline">
                                Thay đổi mật khẩu
                            </Button>
                            <Button icon={<KeyOutlined />} className="ps3-btn-outline">
                                Thay đổi mã PIN
                            </Button>
                            <Button icon={<ReloadOutlined />} className="ps3-btn-outline">
                                Khôi phục mã PIN
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const InfoItem: React.FC<{
    icon: any,
    label: string,
    name: string,
    value: string,
    type?: 'text' | 'date' | 'select',
    options?: { label: string, value: string }[],
    onSave: (name: string, value: string) => Promise<void>
}> = ({ icon, label, name, value, type = 'text', options = [], onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [tempValue, setTempValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setLocalValue(value);
        setTempValue(value);
    }, [value]);

    const handleUpdate = async () => {
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
        <div
            className="ps3-info-item group p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800 cursor-pointer"
            onClick={() => !isEditing && name !== 'username' && setIsEditing(true)}
        >
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 ps3-info-label">
                    {React.cloneElement(icon as React.ReactElement, { className: 'text-[10px]' })}
                    {label}
                </div>
                {!isEditing && name !== 'username' && (
                    <EditOutlined className="text-primary transition-colors" />
                )}
            </div>

            {isEditing ? (
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {type === 'date' ? (
                        <DatePicker
                            size="small"
                            className="w-full !rounded-lg text-sm font-medium"
                            value={tempValue ? dayjs(tempValue) : null}
                            onChange={(date) => setTempValue(date ? date.format('YYYY-MM-DD') : '')}
                            format="DD/MM/YYYY"
                            autoFocus
                            disabled={isLoading}
                        />
                    ) : type === 'select' ? (
                        <Select
                            size="small"
                            className="w-full !rounded-lg text-sm font-medium"
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
                            className="!rounded-lg text-sm font-medium"
                            value={tempValue}
                            onChange={e => setTempValue(e.target.value)}
                            autoFocus
                            disabled={isLoading}
                            onPressEnter={handleUpdate}
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
                            onClick={handleUpdate}
                            className="!rounded-lg shadow-none flex items-center justify-center w-7 h-7 min-w-[28px]"
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
                            className="!rounded-lg shadow-none flex items-center justify-center w-7 h-7 min-w-[28px]"
                        />
                    </div>
                </div>
            ) : (
                <div className="ps3-info-value flex items-center justify-between">
                    <span className="truncate">{getDisplayValue()}</span>
                </div>
            )}
        </div>
    );
};


export default ProfileStyle3;
