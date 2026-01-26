import { useState } from 'react';
import { useLoginMutation } from './useLoginMutation';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface UseLoginOptions {
    clientId?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    redirectTo?: string;
    showMessage?: (type: 'success' | 'error', message: string) => void;
}

export interface UseLoginReturn {
    // Trạng thái form
    credentials: LoginCredentials;
    setCredentials: React.Dispatch<React.SetStateAction<LoginCredentials>>;
    updateField: (field: keyof LoginCredentials, value: string) => void;

    // Hành động đăng nhập
    handleLogin: () => void;

    // Trạng thái
    isLoading: boolean;
    error: any;

    // Validation
    isValid: boolean;
}

/**
 * Hook đăng nhập hoàn chỉnh - đóng gói toàn bộ logic nghiệp vụ đăng nhập
 *
 * @example
 * ```tsx
 * const login = useLogin({
 *   clientId: appConfig.clientId,
 *   onSuccess: () => navigate('/dashboard'),
 *   showMessage: (type, msg) => toast[type](msg)
 * });
 *
 * // Trong form của bạn:
 * <input value={login.credentials.username}
 *        onChange={(e) => login.updateField('username', e.target.value)} />
 * <button onClick={login.handleLogin} disabled={!login.isValid || login.isLoading}>
 *   Đăng nhập
 * </button>
 * ```
 */
export const useLogin = (options: UseLoginOptions = {}): UseLoginReturn => {
    const { clientId = 'default-client', onSuccess, onError, showMessage } = options;

    // Quản lý trạng thái form
    const [credentials, setCredentials] = useState<LoginCredentials>({
        username: '',
        password: '',
    });

    // Hook mutation
    const { mutate: login, isPending, error } = useLoginMutation();

    // Cập nhật từng field riêng lẻ
    const updateField = (field: keyof LoginCredentials, value: string) => {
        setCredentials(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Validation form
    const isValid = credentials.username.trim() !== '' && credentials.password.trim() !== '';

    // Handler đăng nhập chính
    const handleLogin = () => {
        if (!isValid) {
            showMessage?.('error', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
            return;
        }

        login(
            {
                username: credentials.username,
                password: credentials.password,
                grant_type: 'password',
                scope: 'all',
                client_id: clientId
            },
            {
                onSuccess: (data) => {
                    showMessage?.('success', 'Đăng nhập thành công');
                    onSuccess?.(data);
                },
                onError: (err: any) => {
                    const errorMessage = err?.response?.data?.message || 'Lỗi không xác định';
                    showMessage?.('error', `Đăng nhập thất bại: ${errorMessage}`);
                    onError?.(err);
                }
            }
        );
    };

    return {
        credentials,
        setCredentials,
        updateField,
        handleLogin,
        isLoading: isPending,
        error,
        isValid,
    };
};
