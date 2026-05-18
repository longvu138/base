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
        return getCachedProjectInfo();
    });

    useEffect(() => {
        TenantApi.getCurrentTenant().then(res => {
            if (res.data) {
                const cachedProjectInfo = getCachedProjectInfo();
                const nextProjectInfo = isFullProjectInfo(cachedProjectInfo) ? cachedProjectInfo : res.data;

                localStorage.setItem('currentProjectInfo', JSON.stringify(nextProjectInfo));

                setProjectInfo(nextProjectInfo);
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

function getCachedProjectInfo() {
    const currentProjectInfo = parseLocalStorageJson('currentProjectInfo');
    const fullTenantData = parseLocalStorageJson('full-tenant-data');

    if (isFullProjectInfo(currentProjectInfo)) return currentProjectInfo;
    if (isFullProjectInfo(fullTenantData)) return fullTenantData;

    return currentProjectInfo || fullTenantData || null;
}

function parseLocalStorageJson(key: string) {
    const value = localStorage.getItem(key);
    if (!value) return null;

    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function isFullProjectInfo(projectInfo: any) {
    return Boolean(projectInfo?.tenantConfig?.generalConfig);
}
