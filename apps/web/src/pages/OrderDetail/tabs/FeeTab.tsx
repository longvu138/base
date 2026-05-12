import React, { useState } from 'react';
import { Row, Col, Typography, Divider, Button, Modal, Input, Space, Skeleton, Tooltip } from 'antd';
import { InfoCircleOutlined, SafetyCertificateOutlined, TagOutlined } from '@ant-design/icons';
import { useOrderFeesQuery } from '@repo/hooks';

const { Text, Title } = Typography;

interface FeeTabProps {
    orderCode: string;
    order: any;
}

export const FeeTab: React.FC<FeeTabProps> = ({ orderCode, order }) => {
    const { data: fees, isLoading } = useOrderFeesQuery(orderCode);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState('');

    if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;

    const money = (val: any) => (val !== null && val !== undefined ? Number(val).toLocaleString('vi-VN') + 'đ' : '0đ');

    // Group fees
    const serviceFees = fees?.filter((f: any) => !f.type?.shipping) || [];
    const shippingFees = fees?.filter((f: any) => f.type?.shipping) || [];

    const totalFees = fees?.reduce((sum: number, f: any) => sum + (f.actualAmount || 0), 0) || 0;

    return (
        <div className="fee-tab-container p-4">
            <Row gutter={40}>
                {/* Left Side: Fee Lists */}
                <Col span={15}>
                    <div className="space-y-8">
                        {/* Service Fees */}
                        <section>
                            <Title level={5} className="text-gray-900 mb-6 uppercase text-xs tracking-wider font-bold">
                                PHÍ DỊCH VỤ
                            </Title>
                            <div className="space-y-4">
                                {serviceFees.length > 0 ? serviceFees.map((f: any) => (
                                    <div key={f.id} className="flex justify-between items-center py-1 group">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-700 font-medium">{f.type?.name || f.service}</span>
                                            <Space size={4} className="opacity-40 group-hover:opacity-100 transition-opacity">
                                                <Tooltip title="Thông tin phí">
                                                    <InfoCircleOutlined className="text-[14px] cursor-help" />
                                                </Tooltip>
                                                <Tooltip title="Phí hệ thống">
                                                    <SafetyCertificateOutlined className="text-[14px] cursor-help" />
                                                </Tooltip>
                                            </Space>
                                        </div>
                                        <span className="font-semibold text-gray-900">{money(f.actualAmount)}</span>
                                    </div>
                                )) : <div className="text-gray-400 italic text-sm">Không có phí dịch vụ</div>}
                            </div>
                        </section>

                        <Divider className="my-8" />

                        {/* Shipping Fees */}
                        <section>
                            <Title level={5} className="text-gray-900 mb-6 uppercase text-xs tracking-wider font-bold">
                                PHÍ VẬN CHUYỂN
                            </Title>
                            <div className="space-y-4">
                                {shippingFees.length > 0 ? shippingFees.map((f: any) => (
                                    <div key={f.id} className="flex justify-between items-center py-1 group">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-700 font-medium">{f.type?.name || f.service}</span>
                                            <Space size={4} className="opacity-40 group-hover:opacity-100 transition-opacity">
                                                <Tooltip title="Thông tin phí">
                                                    <InfoCircleOutlined className="text-[14px] cursor-help" />
                                                </Tooltip>
                                                <Tooltip title="Phí hệ thống">
                                                    <SafetyCertificateOutlined className="text-[14px] cursor-help" />
                                                </Tooltip>
                                            </Space>
                                        </div>
                                        <span className="font-semibold text-gray-900">{money(f.actualAmount)}</span>
                                    </div>
                                )) : <div className="text-gray-400 italic text-sm">Không có phí vận chuyển</div>}
                            </div>
                        </section>
                    </div>
                </Col>

                {/* Right Side: Blue Summary Box */}
                <Col span={9}>
                    <div className="bg-blue-500 text-white rounded-xl p-6 shadow-lg shadow-blue-100/50">
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="opacity-80">Tiền hàng</span>
                                <span className="font-bold">{money(order.itemsTotal)} {order.itemsTotalYen ? `(¥${order.itemsTotalYen})` : ''}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-80">Giảm giá từ NCC</span>
                                <span className="font-bold">{money(order.supplierDiscount || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-80">Tiền VC nội địa</span>
                                <span className="font-bold">{money(order.domesticShippingFee || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-80">Tổng tiền phí</span>
                                <span className="font-bold">{money(totalFees)}</span>
                            </div>

                            <Divider className="border-white/20 my-4" />

                            <div className="flex justify-between items-center text-base">
                                <span className="font-bold uppercase tracking-wide">Tổng chi phí</span>
                                <span className="text-xl font-black">{money(order.grandTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-80">Đã thanh toán</span>
                                <span className="font-bold">{money(order.paidAmount || order.grandTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-80">Dịch vụ trả lại</span>
                                <span className="font-bold">{money(order.returnServiceFee || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="opacity-80">Cần thanh toán</span>
                                <span className="text-lg font-bold">{money(Math.max(0, (order.grandTotal || 0) - (order.paidAmount || 0)))}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button 
                            type="text" 
                            icon={<TagOutlined />} 
                            className="text-gray-500 hover:text-blue-500 font-medium"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Mã giảm giá
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Discount Code Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <TagOutlined className="text-blue-500" />
                        <span>Áp dụng mã giảm giá</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>Hủy</Button>,
                    <Button key="apply" type="primary" onClick={() => setIsModalOpen(false)}>Áp dụng</Button>
                ]}
                centered
            >
                <div className="py-4">
                    <Text className="text-gray-500 block mb-3 text-xs">Nhập mã ưu đãi hoặc mã giảm giá của bạn vào đây</Text>
                    <Input 
                        placeholder="Ví dụ: GOVOUCHER2025" 
                        size="large"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="rounded-lg"
                        autoFocus
                    />
                </div>
            </Modal>
        </div>
    );
};
