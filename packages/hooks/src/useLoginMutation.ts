import { useMutation } from '@tanstack/react-query';
import { LoginApi } from '@repo/api';

/**
 * Hook mutation đăng nhập cấp thấp
 * Có thể sử dụng trực tiếp nếu cần kiểm soát chi tiết hơn flow đăng nhập
 */
export const useLoginMutation = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await LoginApi.login(payload);
            const data = res.data;
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }
            return data;
        },
    });
};
