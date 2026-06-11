import { type FormEvent } from 'react';
import { message } from 'antd';
import { useLogin } from '@repo/hooks';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '@repo/i18n';

export const LoginStyleThanhla = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const login = useLogin({
        onSuccess: () => navigate('/'),
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
        <div className="w-full max-w-sm mx-auto">
            <div className="mb-12">
                {login.projectInfo?.tenantConfig?.logoStandard && (
                    <img 
                        src={login.projectInfo.tenantConfig.logoStandard} 
                        alt="logo" 
                        className="h-20 mb-6 object-contain"
                    />
                )}
                <h1 className="text-4xl font-black tracking-tight text-black mb-2">{t('auth.login.title')}</h1>
                <p className="text-gray-500 font-medium">{t('auth.login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="relative group">
                    <input
                        type="text"
                        value={login.credentials.username}
                        onChange={(e) => login.updateField('username', e.target.value)}
                        className={`w-full bg-transparent border-b-2 py-3 text-lg outline-none transition-colors peer ${
                            login.loginError ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-black'
                        }`}
                        placeholder=" "
                        id="username"
                    />
                    <label
                        htmlFor="username"
                        className={`absolute left-0 top-3 text-lg transition-all pointer-events-none peer-focus:-top-6 peer-focus:text-sm peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-sm ${
                            login.loginError
                                ? 'text-red-500 peer-focus:text-red-600 peer-[:not(:placeholder-shown)]:text-red-500'
                                : 'text-gray-400 peer-focus:text-black peer-[:not(:placeholder-shown)]:text-black'
                        }`}
                    >
                        {t('auth.login.username')}
                    </label>
                </div>

                <div className="relative group">
                    <input
                        type="password"
                        value={login.credentials.password}
                        onChange={(e) => login.updateField('password', e.target.value)}
                        className={`w-full bg-transparent border-b-2 py-3 text-lg outline-none transition-colors peer ${
                            login.loginError ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-black'
                        }`}
                        placeholder=" "
                        id="password"
                    />
                    <label
                        htmlFor="password"
                        className={`absolute left-0 top-3 text-lg transition-all pointer-events-none peer-focus:-top-6 peer-focus:text-sm peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-sm ${
                            login.loginError
                                ? 'text-red-500 peer-focus:text-red-600 peer-[:not(:placeholder-shown)]:text-red-500'
                                : 'text-gray-400 peer-focus:text-black peer-[:not(:placeholder-shown)]:text-black'
                        }`}
                    >
                        {t('auth.login.password')}
                    </label>
                    {login.loginError && (
                        <div className="text-red-500 text-xs mt-1.5">{login.loginError}</div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={login.isLoading}
                    className="mt-8 w-full bg-black text-white rounded-full py-4 text-base font-bold active:bg-gray-800 transition-all disabled:bg-gray-300"
                >
                    {login.isLoading ? t('Đang đăng nhập') : t('Đăng nhập')}
                </button>

                <div className="text-center mt-6">
                    <span className="text-gray-500 font-medium">Chưa có tài khoản? </span>
                    <Link to="/register" className="text-black font-black underline">
                        Tham gia ngay
                    </Link>
                </div>
            </form>
        </div>
    );
};
