import React from 'react';
import { Form, Input as AntInput, Button as AntButton, Checkbox, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLogin } from '@repo/hooks';
import { appConfig } from '@repo/config';

/**
 * Giao diện đăng nhập 3 — Ant Design (Split Screen Style)
 * Dành cho Gobiz Logistics (gd3)
 */
export const LoginStyle3: React.FC = () => {
    const navigate = useNavigate();

    const login = useLogin({
        clientId: appConfig.clientId,
        onSuccess: () => navigate('/orders'),
        showMessage: (type, msg) => {
            type === 'success' ? message.success(msg) : message.error(msg);
        }
    });

    const onFinish = (values: any) => {
        login.handleLogin({
            username: values.username,
            password: values.password,
        });
    };

    return (
        <div className="flex h-screen bg-white dark:bg-[#1f1f1f]">
            {/* Left Side: Illustration/Cover */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="z-10 text-white space-y-6 max-w-lg">
                    <h1 className="text-5xl font-extrabold leading-tight">
                        Gobiz <br /> Logistics System
                    </h1>
                    <p className="text-xl opacity-90">
                        Quản lý đơn hàng và vận chuyển chuyên nghiệp, tối ưu hóa quy trình kinh doanh của bạn.
                    </p>
                    <div className="pt-8">
                        <div className="inline-block p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                            <span className="text-sm font-medium">Phiên bản 2026 Enterprise</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-left space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Chào mừng trở lại
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Vui lòng đăng nhập vào tài khoản của bạn để tiếp tục.
                        </p>
                    </div>

                    <Form
                        name="login_gobiz"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        size="large"
                        className="mt-8"
                    >
                        <Form.Item
                            name="username"
                            label="Tên đăng nhập"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                        >
                            <AntInput
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="Username"
                                className="rounded-lg h-12"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <AntInput.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Password"
                                className="rounded-lg h-12"
                            />
                        </Form.Item>

                        <div className="flex items-center justify-between mb-6">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Ghi nhớ mật khẩu</Checkbox>
                            </Form.Item>
                            <a className="text-primary font-medium hover:underline text-sm" href="">
                                Quên mật khẩu?
                            </a>
                        </div>

                        <Form.Item>
                            <AntButton
                                type="primary"
                                htmlType="submit"
                                className="w-full h-12 rounded-lg text-lg font-bold shadow-lg shadow-primary/20"
                                loading={login.isLoading}
                            >
                                Đăng nhập ngay
                            </AntButton>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};
