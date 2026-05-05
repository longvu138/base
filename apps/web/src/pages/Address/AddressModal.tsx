import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Checkbox, Button, Row, Col, message } from 'antd';
import { useLocationsQuery, useCreateAddressMutation, useUpdateAddressMutation } from '@repo/hooks';

interface AddressModalProps {
    open: boolean;
    onClose: () => void;
    initialValues?: any;
    isEdit?: boolean;
}

export const AddressModal: React.FC<AddressModalProps> = ({
    open,
    onClose,
    initialValues,
    isEdit = false,
}) => {
    const [form] = Form.useForm();
    const createMutation = useCreateAddressMutation();
    const updateMutation = useUpdateAddressMutation();

    // Cascading state codes
    const [countryCode, setCountryCode] = useState<string>('VN');
    const [provinceCode, setProvinceCode] = useState<string | null>(null);
    const [districtCode, setDistrictCode] = useState<string | null>(null);

    // Queries
    // Country list - User provided parent=VN for what they called "Quốc gia"
    // Usually there's a list of countries, but I will follow the pattern.
    // Let's assume the first level is fixed to Vietnam or we get it from an API with parent=null if needed.
    // However, user explicitly gave parent=VN for "Quốc gia".
    const { data: provinces, isLoading: loadingProvinces } = useLocationsQuery({ parent: countryCode, size: 1000 });
    const { data: districts, isLoading: loadingDistricts } = useLocationsQuery({ parent: provinceCode, size: 1000 });
    const { data: wards, isLoading: loadingWards } = useLocationsQuery({ parent: districtCode, size: 1000 });

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
                setCountryCode(initialValues.countryCode || 'VN');
                setProvinceCode(initialValues.provinceCode || null);
                setDistrictCode(initialValues.districtCode || null);
            } else {
                form.resetFields();
                setCountryCode('VN');
                setProvinceCode(null);
                setDistrictCode(null);
                form.setFieldsValue({ countryCode: 'VN' });
            }
        }
    }, [open, initialValues, form]);

    const handleCountryChange = (value: string) => {
        setCountryCode(value);
        setProvinceCode(null);
        setDistrictCode(null);
        form.setFieldsValue({ provinceCode: null, districtCode: null, wardCode: null });
    };

    const handleProvinceChange = (value: string) => {
        setProvinceCode(value);
        setDistrictCode(null);
        form.setFieldsValue({ districtCode: null, wardCode: null });
    };

    const handleDistrictChange = (value: string) => {
        setDistrictCode(value);
        form.setFieldsValue({ wardCode: null });
    };

    const onFinish = async (values: any) => {
        // Find names for labels if necessary, though usually API wants codes.
        // Enrich values with names if backend requires it
        const province = provinces?.find(p => p.code === values.provinceCode);
        const district = districts?.find(d => d.code === values.districtCode);
        const ward = wards?.find(w => w.code === values.wardCode);

        const payload = {
            ...values,
            province: province?.name,
            district: district?.name,
            ward: ward?.name,
            country: 'Việt Nam' // Assuming VN
        };

        try {
            if (isEdit && initialValues?.id) {
                await updateMutation.mutateAsync({ id: initialValues.id, data: payload });
                message.success('Cập nhật địa chỉ thành công');
            } else {
                await createMutation.mutateAsync(payload);
                message.success('Thêm địa chỉ mới thành công');
            }
            onClose();
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    return (
        <Modal
            title={<span className="text-xl font-bold text-primary uppercase">{isEdit ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</span>}
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
            centered
            className="address-modal"
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ isDefault: false, countryCode: 'VN' }}
                className="mt-4"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Họ tên"
                            name="contactName"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input placeholder="Họ tên" className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Điện thoại"
                            name="contactPhone"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                        >
                            <Input placeholder="Điện thoại" className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Quốc gia"
                            name="countryCode"
                            rules={[{ required: true, message: 'Vui lòng chọn quốc gia' }]}
                        >
                            <Select
                                placeholder="Chọn quốc gia"
                                className="h-10 rounded-lg"
                                onChange={handleCountryChange}
                                options={[
                                    { value: 'VN', label: 'Việt Nam' }
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Tỉnh/Thành phố"
                            name="provinceCode"
                            rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                        >
                            <Select
                                placeholder="Chọn tỉnh thành phố"
                                className="h-10 rounded-lg"
                                loading={loadingProvinces}
                                onChange={handleProvinceChange}
                                options={provinces?.map(p => ({ value: p.code, label: p.name }))}
                                showSearch
                                filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Quận/Huyện"
                            name="districtCode"
                            rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                        >
                            <Select
                                placeholder="Chọn quận huyện"
                                className="h-10 rounded-lg"
                                loading={loadingDistricts}
                                onChange={handleDistrictChange}
                                disabled={!provinceCode}
                                options={districts?.map(d => ({ value: d.code, label: d.name }))}
                                showSearch
                                filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Phường/Xã"
                            name="wardCode"
                            rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                        >
                            <Select
                                placeholder="Chọn phường xã"
                                className="h-10 rounded-lg"
                                loading={loadingWards}
                                disabled={!districtCode}
                                options={wards?.map(w => ({ value: w.code, label: w.name }))}
                                showSearch
                                filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                        >
                            <Input placeholder="Địa chỉ" className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Tên địa chỉ"
                            name="label"
                        >
                            <Input placeholder="Tên địa chỉ" className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Mã bưu chính"
                            name="postalCode"
                        >
                            <Input placeholder="Mã bưu chính" className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="note">
                    <Input.TextArea placeholder="Viết vài dòng ghi chú..." rows={3} className="rounded-lg" />
                </Form.Item>

                <Form.Item name="isDefault" valuePropName="checked">
                    <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                </Form.Item>

                <div className="flex justify-center gap-4 mt-6">
                    <Button onClick={onClose} className="h-11 px-10 rounded-lg font-bold border-gray-300">
                        HỦY BỎ
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={createMutation.isPending || updateMutation.isPending}
                        className="h-11 px-10 rounded-lg font-bold shadow-lg shadow-primary/20"
                    >
                        {isEdit ? 'CẬP NHẬT' : 'THÊM ĐỊA CHỈ'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
