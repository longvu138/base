import { useMutation } from '@tanstack/react-query';
import { CustomerApi } from '@repo/api';

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: (payload: any) => CustomerApi.register(payload),
    });
};
