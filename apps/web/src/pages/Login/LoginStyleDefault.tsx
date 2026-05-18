import { Form, Input, Button, message } from 'antd';
import { useLogin } from '@repo/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { appConfig } from '@repo/config';
import { useTranslation } from '@repo/i18n';
import { ArrowRight } from 'lucide-react';

export const LoginStyleDefault = () => {
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

            <div className="flex-1 flex items-center justify-center bg-filter dark:bg-filter-dark">
                <div className="w-full max-w-[470px] shadow-2xl p-8 rounded-lg" style={{ boxShadow: '0 1px 22px #00000040' }}>
                    <div className="text-center mb-4">
                        {login.projectInfo?.tenantConfig?.logoStandard && (
                            <img
                                src={login.projectInfo.tenantConfig.logoStandard}
                                alt="logo"
                                className="h-32 mx-auto mb-6 object-contain"
                            />
                        )}
                        <h1 className="text-3xl font-bold text-primary mb-2 text-center">{t('auth.login.title')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-center">{t('auth.login.subtitle')}</p>
                    </div>

                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                        size="middle"
                        requiredMark={false}
                        onValuesChange={() => {
                            if (login.loginError) {
                                login.setLoginError(null);
                            }
                        }}
                    >
                        <Form.Item
                            label={<span className="font-medium text-gray-700 dark:text-gray-300">{t('auth.login.username')}</span>}
                            name="username"
                            rules={[
                                { required: true, message: t('auth.login.usernameRequired') },
                            ]}
                            validateStatus={login.loginError ? 'error' : undefined}
                        >
                            <Input
                                className="rounded-lg border-gray-300 hover:border-blue-500 transition-colors"
                                placeholder={t('auth.login.username')}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-medium text-gray-700 dark:text-gray-300">{t('auth.login.password')}</span>}
                            name="password"
                            rules={[{ required: true, message: t('auth.login.passwordRequired') }]}
                            validateStatus={login.loginError ? 'error' : undefined}
                            help={login.loginError ? login.loginError : undefined}
                        >
                            <Input.Password
                                className="rounded-lg border-gray-300 hover:border-blue-500 transition-colors"
                                placeholder={t('auth.login.password')}
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
                            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 text-sm">
                                {t('auth.login.signUp')}
                            </Link>
                        </div>
                    </Form>
                </div >
            </div >
        </div >
    );
};
