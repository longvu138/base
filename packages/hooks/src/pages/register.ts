import { useRegisterMutation } from '../useRegisterMutation';
import { useNavigate } from 'react-router-dom';

export interface UseRegisterPageOptions {
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export const useRegisterPage = (options: UseRegisterPageOptions = {}) => {
    const { onSuccess, onError } = options;
    const navigate = useNavigate();
    const registerMutation = useRegisterMutation();

    const onFinish = async (values: any) => {
        try {
            await registerMutation.mutateAsync(values);
            onSuccess?.();
            navigate('/login');
        } catch (error: any) {
            onError?.(error);
        }
    };

    return {
        onFinish,
        isLoading: registerMutation.isPending,
    };
};
