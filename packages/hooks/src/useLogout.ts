import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface UseLogoutOptions {
    onSuccess?: () => void;
    redirectTo?: string;
}

/**
 * Hook đăng xuất - xử lý việc xóa trạng thái auth và clear cache
 */
export const useLogout = (options: UseLogoutOptions = {}) => {
    const { onSuccess } = options;
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // Xóa cache của React Query
            queryClient.clear();

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
