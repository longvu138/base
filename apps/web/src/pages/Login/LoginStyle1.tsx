import { Form, Input, Button, message } from 'antd';
import { useLogin } from '@repo/hooks';
import { useNavigate } from 'react-router-dom';
import { appConfig } from '@repo/config';
import { useTranslation } from '@repo/i18n';
import { ArrowRight } from 'lucide-react';

export const LoginStyle1 = () => {
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
        <div className="min-h-screen flex w-full">

            <div className="flex-1 flex items-center justify-center bg-filter dark:bg-filter-dark p-8">
                <div className="w-full max-w-[400px]">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-primary mb-2">{t('auth.login.title')}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{t('auth.login.subtitle')}</p>
                    </div>

                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                        className="space-y-4"
                        requiredMark={false}
                    >
                        <Form.Item
                            label={<span className="font-medium text-gray-700 dark:text-gray-300">{t('auth.login.username')}</span>}
                            name="username"
                            rules={[
                                { required: true, message: t('auth.login.usernameRequired') },
                            ]}
                        >
                            <Input
                                className="rounded-lg border-gray-300 hover:border-blue-500 transition-colors"
                                placeholder="name@company.com"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-medium text-gray-700 dark:text-gray-300">{t('auth.login.password')}</span>}
                            name="password"
                            rules={[{ required: true, message: t('auth.login.passwordRequired') }]}
                        >
                            <Input.Password
                                className="rounded-lg border-gray-300 hover:border-blue-500 transition-colors"
                                placeholder="nhập mật khẩu"
                            />
                        </Form.Item>

                        <Form.Item className="pt-2">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={login.isLoading}
                                className="w-full h-11 rounded-lg font-semibold text-base bg-primary hover:opacity-90 border-none shadow-none flex items-center justify-center gap-2 group"
                            >
                                {t('auth.login.loginButton')}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-6">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Chưa có tài khoản? </span>
                            <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 text-sm">
                                {t('auth.login.signUp')}
                            </a>
                        </div>
                    </Form>
                </div >
            </div >
        </div >
    );
};
