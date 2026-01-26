import { useQuery } from '@tanstack/react-query';
import { LoginApi } from '@repo/api';

/**
 * Hook để lấy thông tin profile của user
 * Chỉ được kích hoạt khi có access_token trong localStorage
 */
export const useProfileQuery = () => {
    return useQuery({
        queryKey: ['auth.profile'],
        queryFn: async () => {
            const res = await LoginApi.getProfile();
            return res.data;
        },
        enabled: !!localStorage.getItem('access_token'),
    });
};
