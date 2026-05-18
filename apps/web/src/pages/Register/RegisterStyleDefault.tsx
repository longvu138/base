import { Form, Input, Button, Card, Typography, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

export const RegisterStyleDefault = ({ form, onFinish, isLoading, projectInfo }: any) => {
    const bgImage = projectInfo?.tenantConfig?.generalConfig?.registerBackgroundImage;
    console.log("bgImage", projectInfo);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            background: bgImage ? `url(${bgImage}) center/cover no-repeat` : '#f0f2f5',
            padding: '40px 0'
        }}>
            <Card style={{ width: 450, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    {!bgImage && projectInfo?.tenantConfig?.logoStandard && (
                        <div style={{ marginBottom: 20 }}>
                            <img 
                                src={projectInfo.tenantConfig.logoStandard} 
                                alt="logo" 
                                style={{ height: 64, objectFit: 'contain' }} 
                            />
                        </div>
                    )}
                    <Title level={2}>Đăng ký tài khoản</Title>
                    <Text type="secondary">Tham gia cùng chúng tôi ngay hôm nay</Text>
                </div>

                <Form
                    form={form}
                    name="register_default"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                            { min: 6, message: 'Tên đăng nhập không được ít hơn 6 ký tự!' },
                            { pattern: /^[a-zA-Z0-9]+$/, message: 'Tên đăng nhập không được chứa ký tự đặc biệt!' },
                            {
                                validator: (_, value) => {
                                    if (value && /^\d+$/.test(value)) {
                                        return Promise.reject(new Error('Tên đăng nhập không được chứa toàn số!'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="fullname"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input prefix={<IdcardOutlined />} placeholder="Họ và tên" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        getValueFromEvent={(e) => e.target.value.replace(/[^0-9]/g, '')}
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa chữ số!' }
                        ]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="ref"
                    >
                        <Input prefix={<UserAddOutlined />} placeholder="Mã giới thiệu (nếu có)" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="terms"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản và chính sách!')),
                            },
                        ]}
                    >
                        <Checkbox>
                            Tôi đồng ý với <Link to="/terms">điều khoản và chính sách</Link>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={isLoading} style={{ borderRadius: 8 }}>
                            Đăng ký
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">Đã có tài khoản? </Text>
                        <Link to="/login">Đăng nhập ngay</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterStyleDefault;
