import { Link } from 'react-router-dom';

export const usernameRules = [
    { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
    { min: 6, message: 'Tên đăng nhập không được ít hơn 6 ký tự!' },
    { pattern: /^[a-zA-Z0-9]+$/, message: 'Tên đăng nhập không được chứa ký tự đặc biệt!' },
    {
        validator: (_: any, value: string) => {
            if (value && /^\d+$/.test(value)) {
                return Promise.reject(new Error('Tên đăng nhập không được chứa toàn số!'));
            }
            return Promise.resolve();
        },
    },
];

export const fullnameRules = [{ required: true, message: 'Vui lòng nhập họ và tên!' }];

export const emailRules = [
    { required: true, message: 'Vui lòng nhập email!' },
    { type: 'email' as const, message: 'Email không hợp lệ!' },
];

export const phoneRules = [
    { required: true, message: 'Vui lòng nhập số điện thoại!' },
    { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa chữ số!' },
];

export const passwordRules = [{ required: true, message: 'Vui lòng nhập mật khẩu!' }];

export const confirmPasswordRules = [
    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
    ({ getFieldValue }: any) => ({
        validator(_: any, value: string) {
            if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
        },
    }),
];

export const termsRules = [
    {
        validator: (_: any, value: boolean) =>
            value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản và chính sách!')),
    },
];

export const normalizePhone = (event: any) => event.target.value.replace(/[^0-9]/g, '');

export function RegisterTermsContent({ projectInfo, linkClassName, className }: any) {
    const serviceAgreementUrl = projectInfo?.tenantConfig?.generalConfig?.serviceAgreementUrl;

    if (serviceAgreementUrl) {
        return <span className={className} dangerouslySetInnerHTML={{ __html: serviceAgreementUrl }} />;
    }

    return (
        <span className={className}>
            Tôi đồng ý với <Link to="/terms" className={linkClassName}>điều khoản và chính sách</Link>
        </span>
    );
}
