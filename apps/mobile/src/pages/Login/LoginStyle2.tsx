import { message } from 'antd';
import { useLogin } from '@repo/hooks';
import { useNavigate } from 'react-router-dom';
import { appConfig } from '@repo/config';
import { useTranslation } from '@repo/i18n';

export const LoginStyle2 = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const login = useLogin({
        clientId: appConfig.clientId,
        onSuccess: () => navigate('/orders'),
        showMessage: (type, msg) => {
            type === 'success' ? message.success(msg) : message.error(msg);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login.handleLogin();
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tight text-black mb-2">{t('auth.login.title')}</h1>
                <p className="text-gray-500 font-medium">{t('auth.login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="relative group">
                    <input
                        type="text"
                        value={login.credentials.username}
                        onChange={(e) => login.updateField('username', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-lg outline-none focus:border-black transition-colors peer"
                        placeholder=" "
                        id="username"
                    />
                    <label
                        htmlFor="username"
                        className="absolute left-0 top-3 text-gray-400 text-lg transition-all pointer-events-none peer-focus:-top-6 peer-focus:text-sm peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-black"
                    >
                        {t('auth.login.username')}
                    </label>
                </div>

                <div className="relative group">
                    <input
                        type="password"
                        value={login.credentials.password}
                        onChange={(e) => login.updateField('password', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-lg outline-none focus:border-black transition-colors peer"
                        placeholder=" "
                        id="password"
                    />
                    <label
                        htmlFor="password"
                        className="absolute left-0 top-3 text-gray-400 text-lg transition-all pointer-events-none peer-focus:-top-6 peer-focus:text-sm peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-black"
                    >
                        {t('auth.login.password')}
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={login.isLoading}
                    className="mt-8 w-full bg-black text-white rounded-full py-4 text-base font-bold active:bg-gray-800 transition-all disabled:bg-gray-300"
                >
                    {login.isLoading ? t('auth.login.logging_in') : t('auth.login.submit')}
                </button>
            </form>
        </div>
    );
};
