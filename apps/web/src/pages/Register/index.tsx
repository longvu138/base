import { useRegisterPage } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useTheme, useVariant } from '@repo/theme-provider';
import { message, Form } from 'antd';

// Stable reference
const modules = import.meta.glob('./*.tsx');

export const RegisterPage = () => {
    const [form] = Form.useForm();
    const variant = useVariant('register', 'RegisterStyleDefault');
    const { tenantConfig } = useTheme();
    const logic = useRegisterPage({
        onSuccess: () => message.success('Đăng ký tài khoản thành công!'),
        onError: (error: any) => {
            const errorTitle = error?.response?.data?.title;
            if (errorTitle === 'username_duplicated') {
                form.setFields([
                    {
                        name: 'username',
                        errors: ['Tài khoản không hợp lệ'],
                    },
                ]);
            } else if (errorTitle === 'email_duplicated') {
                form.setFields([
                    {
                        name: 'email',
                        errors: ['Email đã tồn tại'],
                    },
                ]);
            } else {
                message.error(error?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.');
            }
        }
    });

    const projectInfo = isFullProjectInfo(logic.projectInfo) ? logic.projectInfo : tenantConfig || logic.projectInfo;

    return (
        <>
            <DynamicVariant
                variantName={variant}
                modules={modules}
                fallbackName="RegisterStyleDefault"
                featureName="Register"
                componentProps={{
                    ...logic,
                    projectInfo,
                    form
                }}
            />
        </>
    );
};

export default RegisterPage;

function isFullProjectInfo(projectInfo: any) {
    return Boolean(projectInfo?.tenantConfig?.generalConfig);
}
