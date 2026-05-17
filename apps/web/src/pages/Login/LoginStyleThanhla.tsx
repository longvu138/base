import { Form, Input, Button, message } from 'antd';
import { useLogin } from '@repo/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { appConfig } from '@repo/config';
import { useTranslation } from '@repo/i18n';
import { ArrowRight, Lock, User } from 'lucide-react';

/**
 * LoginStyleThanhla — Giao diện cho Thanhla (thanhla)
 * Phong cách Modern Split-Screen.
 */
export const LoginStyleThanhla = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const login = useLogin({
        clientId: appConfig.clientId,
        onSuccess: () => navigate('/orders'),
        showMessage: (type, msg) => {
            type === 'success' ? message.success(msg) : message.error(msg);
        }
    });

    const onFinish = (values: any) => {
        login.handleLogin(values);
    };

    return (
        <div className="min-h-screen flex w-full bg-white dark:bg-[#0a0a0a]">
            {/* Left side: Graphic/Branding */}
            <div className="hidden lg:flex w-1/2 bg-primary/5 flex-col justify-between p-12 border-r border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className="relative z-10">
                    {login.projectInfo?.tenantConfig?.logoStandard ? (
                        <img
                            src={login.projectInfo.tenantConfig.logoStandard}
                            alt="logo"
                            className="h-28 object-contain"
                        />
                    ) : (
                        <div className="flex items-center gap-2 font-black text-3xl text-primary tracking-tight">
                            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">T</div>
                            THANHLA
                        </div>
                    )}
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                        Logistics <br />
                        <span className="text-primary">Next Generation.</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Quản lý vận đơn, đơn hàng, và tài chính trong một nền tảng duy nhất với giao diện Thanhla Style 2.
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Right side: Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-[420px]">
                    <div className="mb-12 text-center lg:text-left">
                        <div className="lg:hidden flex items-center justify-center lg:justify-start gap-2 mb-8">
                            {login.projectInfo?.tenantConfig?.logoStandard ? (
                                <img
                                    src={login.projectInfo.tenantConfig.logoStandard}
                                    alt="logo"
                                    className="h-28 object-contain"
                                />
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">T</div>
                                    <span className="font-black text-3xl text-primary tracking-tight">THANHLA</span>
                                </>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('auth.login.title')}</h2>
                        <p className="text-gray-500 dark:text-gray-400">Đăng nhập để trải nghiệm không gian làm việc mới.</p>
                    </div>

                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                        className="space-y-6"
                        requiredMark={false}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: t('auth.login.usernameRequired') }]}
                        >
                            <Input
                                prefix={<User className="text-gray-400 mr-2" size={18} />}
                                className="h-14 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-base"
                                placeholder={t('auth.login.username')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: t('auth.login.passwordRequired') }]}
                        >
                            <Input.Password
                                prefix={<Lock className="text-gray-400 mr-2" size={18} />}
                                className="h-14 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-base"
                                placeholder={t('auth.login.password')}
                            />
                        </Form.Item>

                        <div className="flex items-center justify-end -mt-2">
                            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-blue-700">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Form.Item className="pt-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={login.isLoading}
                                className="w-full h-14 rounded-xl font-bold text-lg bg-primary hover:opacity-90 shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group"
                            >
                                {t('auth.login.loginButton')}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-8">
                            <span className="text-gray-500 dark:text-gray-400">Chưa có tài khoản? </span>
                            <Link to="/register" className="font-bold text-primary hover:text-blue-700">
                                {t('auth.login.signUp')}
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};
