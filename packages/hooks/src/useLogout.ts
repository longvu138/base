import { useState } from 'react';

export interface UseLogoutOptions {
    onSuccess?: () => void;
    redirectTo?: string;
}

/**
 * Hook đăng xuất - xử lý việc xóa trạng thái auth
 * 
 * @example
 * ```tsx
 * const { handleLogout, isLoading } = useLogout({
 *   onSuccess: () => navigate('/login')
 * });
 * ```
 */
export const useLogout = (options: UseLogoutOptions = {}) => {
    const { onSuccess } = options;
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // Xóa token
            localStorage.removeItem('access_token');

            // Gọi API logout nếu cần
            // await LoginApi.logout();

            onSuccess?.();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleLogout,
        isLoading,
    };
};
