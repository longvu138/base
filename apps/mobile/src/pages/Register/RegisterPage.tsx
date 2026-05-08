import { useRegisterPage } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';
import { message, Form } from 'antd';

// Stable reference
const modules = import.meta.glob('./*.tsx');

export const RegisterPage = () => {
    const [form] = Form.useForm();
    const variant = useVariant('register');
    const logic = useRegisterPage({
        onSuccess: () => message.success('Đăng ký tài khoản thành công!'),
        onError: (error: any) => message.error(error?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.')
    });

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="RegisterStyle1"
            featureName="Register"
            componentProps={{
                ...logic,
                form
            }}
        />
    );
};

export default RegisterPage;
