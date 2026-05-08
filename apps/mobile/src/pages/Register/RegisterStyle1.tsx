import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const RegisterStyle1 = ({ form, onFinish, isLoading }: any) => {
    const navigate = useNavigate();

    return (
        <div className="mobile-page-container p-5">
            <div className="mb-8 flex items-center gap-4">
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate(-1)} 
                    className="p-0"
                />
                <Title level={3} className="m-0">Đăng ký tài khoản</Title>
            </div>

            <div className="text-center mb-8">
                <Text type="secondary">Vui lòng điền thông tin để tham gia cùng Gobiz</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    name="fullname"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                    <Input 
                        prefix={<IdcardOutlined className="text-gray-400" />} 
                        placeholder="Họ và tên" 
                        size="large" 
                        className="rounded-xl h-12"
                    />
                </Form.Item>

                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                >
                    <Input 
                        prefix={<UserOutlined className="text-gray-400" />} 
                        placeholder="Tên đăng nhập" 
                        size="large" 
                        className="rounded-xl h-12"
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input 
                        prefix={<MailOutlined className="text-gray-400" />} 
                        placeholder="Địa chỉ Email" 
                        size="large" 
                        className="rounded-xl h-12"
                    />
                </Form.Item>

                <Form.Item
                    name="phone"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                    <Input 
                        prefix={<PhoneOutlined className="text-gray-400" />} 
                        placeholder="Số điện thoại" 
                        size="large" 
                        className="rounded-xl h-12"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password 
                        prefix={<LockOutlined className="text-gray-400" />} 
                        placeholder="Mật khẩu" 
                        size="large" 
                        className="rounded-xl h-12"
                    />
                </Form.Item>

                <Form.Item className="mt-8">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        size="large" 
                        loading={isLoading} 
                        className="rounded-xl h-12 font-bold"
                    >
                        Đăng ký
                    </Button>
                </Form.Item>

                <div className="text-center mt-6">
                    <Text type="secondary">Bạn đã có tài khoản? </Text>
                    <Link to="/login" className="font-bold text-primary">Đăng nhập</Link>
                </div>
            </Form>
        </div>
    );
};

export default RegisterStyle1;
