import { message } from 'antd';
import { ArrowRight } from 'lucide-react';
import { useLogin } from '@repo/hooks';
import { useNavigate } from 'react-router-dom';
import { appConfig } from '@repo/config';

export const LoginStyle2 = () => {
    const navigate = useNavigate();
    // const { t } = useTranslation();

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
        <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-gray-900 font-sans selection:bg-gray-200">
            <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
                <div className="w-full max-w-[360px]">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight mb-2">Đăng nhập tài khoản</h1>
                        <p className="text-gray-500 text-sm">Nhập thông tin truy cập hệ thống của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email / Tên đăng nhập</label>
                            <input
                                type="text"
                                value={login.credentials.username}
                                onChange={(e) => login.updateField('username', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all shadow-sm group-hover:border-gray-300"
                                placeholder="username"
                                autoFocus
                            />
                        </div>

                        <div className="group">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Mật khẩu</label>
                                <a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Quên?</a>
                            </div>
                            <input
                                type="password"
                                value={login.credentials.password}
                                onChange={(e) => login.updateField('password', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-all shadow-sm group-hover:border-gray-300"
                                placeholder="password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={login.isLoading}
                            className="mt-2 w-full bg-black text-white rounded-md py-2.5 text-sm font-medium hover:bg-gray-800 hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {login.isLoading ? 'Đang xác thực...' : 'Tiếp tục'}
                            {!login.isLoading && <ArrowRight size={14} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-8">
                        Chưa có tài khoản? <a href="#" className="text-gray-600 hover:text-black hover:underline transition-colors">Đăng ký dùng thử</a>
                    </p>
                </div>
            </div>

        </div>
    );
};
