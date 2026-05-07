import React from 'react';
import { Form, Input as AntInput, Button as AntButton, Checkbox, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLogin } from '@repo/hooks';
import { appConfig } from '@repo/config';
import { useTranslation } from '@repo/i18n';

/**
 * Giao diện đăng nhập 3 — Mobile Version (Gobiz Logistics Aesthetic)
 */
export const LoginStyle3: React.FC = () => {
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
        login.handleLogin({
            username: values.username,
            password: values.password,
        });
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-white dark:bg-[#1f1f1f] p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8 relative overflow-hidden">
            {/* Visual flair for Style3 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="text-left space-y-2 relative z-10">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                    {t('auth.login.title')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('auth.login.subtitle')}
                </p>
            </div>

            <Form
                name="login_gobiz_mobile"
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                size="large"
                className="mt-6 relative z-10"
            >
                <Form.Item
                    name="username"
                    label={<span className="text-xs font-bold uppercase text-gray-400 pl-1">{t('auth.login.username')}</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    className="mb-4"
                >
                    <AntInput
                        prefix={<UserOutlined className="text-gray-400" />}
                        placeholder="Username"
                        className="rounded-xl h-12 bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-700"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={<span className="text-xs font-bold uppercase text-gray-400 pl-1">{t('auth.login.password')}</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    className="mb-4"
                >
                    <AntInput.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Password"
                        className="rounded-xl h-12 bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-700"
                    />
                </Form.Item>

                <div className="flex items-center justify-between mb-8">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox className="text-xs font-medium">Ghi nhớ</Checkbox>
                    </Form.Item>
                    <a className="text-primary font-bold hover:underline text-xs" href="">
                        Quên mật khẩu?
                    </a>
                </div>

                <Form.Item className="mb-0">
                    <AntButton
                        type="primary"
                        htmlType="submit"
                        className="w-full h-14 rounded-2xl text-base font-black shadow-xl shadow-primary/30 bg-primary border-0"
                        loading={login.isLoading}
                    >
                        {login.isLoading ? t('auth.login.logging_in') : t('auth.login.submit')}
                    </AntButton>
                </Form.Item>
            </Form>

            <div className="text-center pt-2">
                <p className="text-gray-400 text-xs font-medium">
                    Gobiz Logistics System v2026
                </p>
            </div>
        </div>
    );
};
