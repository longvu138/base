import { useEffect, useState } from 'react';
import { useRegisterMutation } from '../useRegisterMutation';
import { TenantApi } from '@repo/api';
import { useNavigate } from 'react-router-dom';

export interface UseRegisterPageOptions {
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export const useRegisterPage = (options: UseRegisterPageOptions = {}) => {
    const { onSuccess, onError } = options;
    const navigate = useNavigate();
    const registerMutation = useRegisterMutation();

    const [projectInfo, setProjectInfo] = useState<any>(() => {
        const saved = localStorage.getItem('currentProjectInfo');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        TenantApi.getCurrentTenant().then(res => {
            if (res.data) {
                localStorage.setItem('currentProjectInfo', JSON.stringify(res.data));
                setProjectInfo(res.data);
            }
        }).catch(console.error);
    }, []);

    const onFinish = async (values: any) => {
        const { confirm, terms, ...registerData } = values;
        try {
            await registerMutation.mutateAsync(registerData);
            onSuccess?.();
            navigate('/login');
        } catch (error: any) {
            onError?.(error);
        }
    };

    return {
        onFinish,
        isLoading: registerMutation.isPending,
        projectInfo,
    };
};
