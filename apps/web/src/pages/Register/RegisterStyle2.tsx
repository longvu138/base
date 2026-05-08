import { Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, User, Mail, Phone, BadgeInfo } from 'lucide-react';

/**
 * RegisterStyle2 — Giao diện cho Thanhla (gd2)
 * Phong cách Modern Split-Screen tương tự LoginStyle2.
 */
export const RegisterStyle2 = ({ form, onFinish, isLoading }: any) => {
    return (
        <div className="min-h-screen flex w-full bg-white dark:bg-[#0a0a0a]">
            {/* Left side: Graphic/Branding */}
            <div className="hidden lg:flex w-1/2 bg-primary/5 flex-col justify-between p-12 border-r border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 font-black text-3xl text-primary tracking-tight">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">T</div>
                        THANHLA
                    </div>
                </div>
                
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                        Khởi Đầu <br/>
                        <span className="text-primary">Hành Trình Mới.</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Đăng ký tài khoản ngay hôm nay để trải nghiệm hệ sinh thái Logistics thế hệ mới.
                    </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 -right-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Right side: Register Form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-[480px] my-auto py-8">
                    <div className="mb-8 text-center lg:text-left">
                        <div className="lg:hidden flex items-center justify-center lg:justify-start gap-2 font-black text-3xl text-primary tracking-tight mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">T</div>
                            THANHLA
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Đăng ký tài khoản</h2>
                        <p className="text-gray-500 dark:text-gray-400">Điền thông tin bên dưới để bắt đầu sử dụng.</p>
                    </div>

                    <Form
                        name="register"
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                        className="space-y-4"
                        requiredMark={false}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                                className="mb-0"
                            >
                                <Input
                                    prefix={<User className="text-gray-400 mr-2" size={18} />}
                                    className="h-12 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-base"
                                    placeholder="Tên đăng nhập"
                                />
                            </Form.Item>

                            <Form.Item
                                name="fullname"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                                className="mb-0"
                            >
                                <Input
                                    prefix={<BadgeInfo className="text-gray-400 mr-2" size={18} />}
                                    className="h-12 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-base"
                                    placeholder="Họ và tên"
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                            className="mb-0"
                        >
                            <Input
                                prefix={<Mail className="text-gray-400 mr-2" size={18} />}
                                className="h-12 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-base"
                                placeholder="Email"
                            />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            className="mb-0"
                        >
                            <Input
                                prefix={<Phone className="text-gray-400 mr-2" size={18} />}
                                className="h-12 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-base"
                                placeholder="Số điện thoại"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            className="mb-0"
                        >
                            <Input.Password
                                prefix={<Lock className="text-gray-400 mr-2" size={18} />}
                                className="h-12 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-base"
                                placeholder="Mật khẩu"
                            />
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
                            className="mb-0"
                        >
                            <Input.Password
                                prefix={<Lock className="text-gray-400 mr-2" size={18} />}
                                className="h-12 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-base"
                                placeholder="Xác nhận mật khẩu"
                            />
                        </Form.Item>

                        <Form.Item className="pt-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isLoading}
                                className="w-full h-14 rounded-xl font-bold text-lg bg-primary hover:opacity-90 shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group"
                            >
                                Đăng ký
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-6">
                            <span className="text-gray-500 dark:text-gray-400">Đã có tài khoản? </span>
                            <Link to="/login" className="font-bold text-primary hover:text-blue-700">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};
