import { Form, Input, Button, Typography, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, ArrowRightOutlined, RocketOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './RegisterStyle3.css';

const { Title, Text } = Typography;

export const RegisterStyle3 = ({ form, onFinish, isLoading }: any) => {
    return (
        <div className="register-mobile-style3">
            <div className="header-blob">
                <div className="blob-content">
                    <RocketOutlined className="rocket-icon" />
                    <Title level={2} className="text-white m-0">Gia nhập Gobiz</Title>
                    <Text className="text-white-50">Vận hành thông minh trong tầm tay</Text>
                </div>
            </div>

            <div className="form-wrapper-mobile">
                <Card className="modern-register-card">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="fullname"
                            label={<span className="label-bold">Họ và tên</span>}
                            rules={[{ required: true, message: 'Nhập họ tên!' }]}
                        >
                            <Input prefix={<IdcardOutlined />} placeholder="Họ và tên của bạn" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="username"
                            label={<span className="label-bold">Tên đăng nhập</span>}
                            rules={[{ required: true, message: 'Nhập tên đăng nhập!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label={<span className="label-bold">Email</span>}
                            rules={[
                                { required: true, message: 'Nhập email!' },
                                { type: 'email', message: 'Sai định dạng!' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label={<span className="label-bold">Số điện thoại</span>}
                            rules={[{ required: true, message: 'Nhập số điện thoại!' }]}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="+84 ..." size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span className="label-bold">Mật khẩu</span>}
                            rules={[{ required: true, message: 'Nhập mật khẩu!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item className="mt-6">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                block 
                                size="large" 
                                loading={isLoading} 
                                className="premium-btn"
                                icon={<ArrowRightOutlined />}
                                iconPosition="end"
                            >
                                ĐĂNG KÝ NGAY
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-4">
                            <Text type="secondary">Bạn đã có tài khoản? </Text>
                            <Link to="/login" className="login-text-bold">Đăng nhập</Link>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default RegisterStyle3;
