import { useRegisterPage } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { ThemeSwitcher, useTheme, useVariant } from '@repo/theme-provider';
import { getTenantOptions, dispatchTenantChange } from '@repo/tenant-config';
import { message, Form, Flex, Radio, Typography, theme } from 'antd';
import { useEffect, useState } from 'react';

// Stable reference
const modules = import.meta.glob('./*.tsx');

export const RegisterPage = () => {
    const [form] = Form.useForm();
    const { token } = theme.useToken();
    const variant = useVariant('register', 'RegisterStyleDefault');
    const { tenantConfig } = useTheme();
    const [currentTenant, setCurrentTenant] = useState(() =>
        localStorage.getItem('selected-tenant') || 'baogam'
    );
    const logic = useRegisterPage({
        onSuccess: () => message.success('Đăng ký tài khoản thành công!'),
        onError: (error: any) => message.error(error?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.')
    });

    useEffect(() => {
        const handleTenantChange = (event: Event) => {
            setCurrentTenant((event as CustomEvent<string>).detail);
        };

        window.addEventListener('app:tenant-changed', handleTenantChange);
        return () => window.removeEventListener('app:tenant-changed', handleTenantChange);
    }, []);

    const handleTenantSwitch = (value: string) => {
        setCurrentTenant(value);
        dispatchTenantChange(value);
    };

    return (
        <>
            <Flex
                align="center"
                gap={token.marginMD}
                style={{
                    padding: `${token.paddingSM}px ${token.paddingMD}px`,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorBgContainer,
                }}
            >
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    TEST UI:
                </Typography.Text>
                <Radio.Group
                    value={currentTenant}
                    onChange={(e) => handleTenantSwitch(e.target.value)}
                    size="small"
                    buttonStyle="solid"
                >
                    {getTenantOptions().map(option => (
                        <Radio.Button key={option.value} value={option.value}>
                            {option.label}
                        </Radio.Button>
                    ))}
                </Radio.Group>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    variant: <Typography.Text strong>{variant}</Typography.Text>
                </Typography.Text>
                <Flex flex={1} justify="flex-end">
                    <ThemeSwitcher />
                </Flex>
            </Flex>

            <DynamicVariant
                variantName={variant}
                modules={modules}
                fallbackName="RegisterStyleDefault"
                featureName="Register"
                componentProps={{
                    ...logic,
                    projectInfo: tenantConfig || logic.projectInfo,
                    form
                }}
            />
        </>
    );
};

export default RegisterPage;
