import { type FormEvent } from 'react';
import { message } from 'antd';
import { ArrowRight } from 'lucide-react';
import { useLogin } from '@repo/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { appConfig } from '@repo/config';
import { useTranslation } from '@repo/i18n';

export const LoginStyle1 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const login = useLogin({
        clientId: appConfig.clientId,
        onSuccess: () => navigate('/orders'),
        showMessage: (type, msg) => {
            if (type === 'success') message.success(msg);
            else message.error(msg);
        }
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        login.handleLogin();
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="mb-8 text-center">
                {login.projectInfo?.tenantConfig?.logoStandard && (
                    <img 
                        src={login.projectInfo.tenantConfig.logoStandard} 
                        alt="logo" 
                        className="h-20 mx-auto mb-6 object-contain"
                    />
                )}
                <h1 className="text-2xl font-bold text-gray-900">{t('auth.login.title')}</h1>
                <p className="text-gray-500 text-sm mt-2">{t('auth.login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 pl-1">{t('auth.login.username')}</label>
                    <input
                        type="text"
                        value={login.credentials.username}
                        onChange={(e) => login.updateField('username', e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                        placeholder={t('auth.login.username')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 pl-1">{t('auth.login.password')}</label>
                    <input
                        type="password"
                        value={login.credentials.password}
                        onChange={(e) => login.updateField('password', e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                        placeholder={t('auth.login.password')}
                    />
                </div>

                <button
                    type="submit"
                    disabled={login.isLoading}
                    className="mt-2 w-full bg-blue-600 text-white rounded-xl py-4 text-base font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 shadow-lg shadow-blue-100"
                >
                    {login.isLoading ? t('auth.login.logging_in') : t('auth.login.submit')}
                    {!login.isLoading && <ArrowRight size={20} />}
                </button>

                <div className="text-center mt-4">
                    <span className="text-gray-500 text-sm">Chưa có tài khoản? </span>
                    <Link to="/register" className="text-blue-600 font-bold text-sm">
                        Đăng ký ngay
                    </Link>
                </div>
            </form>
        </div>
    );
};
