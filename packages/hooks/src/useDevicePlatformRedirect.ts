import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { appConfig } from '@repo/config';

type Platform = 'web' | 'mobile';

export interface UseDevicePlatformRedirectOptions {
    currentPlatform: Platform;
    webUrl?: string;
    mobileUrl?: string;
    enabled?: boolean;
}

export interface DevicePlatformRedirectProviderProps extends UseDevicePlatformRedirectOptions {
    children: ReactNode;
}

const MOBILE_USER_AGENT =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;

const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent || '';
    if (MOBILE_USER_AGENT.test(userAgent)) return true;

    return window.matchMedia?.('(pointer: coarse) and (max-width: 1024px)').matches ?? false;
};

const buildTargetUrl = (targetBaseUrl: string) => {
    const currentUrl = new URL(window.location.href);
    const targetUrl = new URL(targetBaseUrl, currentUrl.href);

    targetUrl.pathname = currentUrl.pathname;
    targetUrl.search = currentUrl.search;
    targetUrl.hash = currentUrl.hash;

    return { currentUrl, targetUrl };
};

export const useDevicePlatformRedirect = ({
    currentPlatform,
    webUrl = appConfig.webUrl,
    mobileUrl = appConfig.mobileUrl,
    enabled = true,
}: UseDevicePlatformRedirectOptions) => {
    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;

        const targetPlatform: Platform = isMobileDevice() ? 'mobile' : 'web';
        if (targetPlatform === currentPlatform) return;

        const targetBaseUrl = targetPlatform === 'mobile' ? mobileUrl : webUrl;
        if (!targetBaseUrl) return;

        const { currentUrl, targetUrl } = buildTargetUrl(targetBaseUrl);
        if (targetUrl.origin === currentUrl.origin || targetUrl.href === currentUrl.href) return;

        window.location.replace(targetUrl.href);
    }, [currentPlatform, enabled, mobileUrl, webUrl]);
};

export const DevicePlatformRedirectProvider = ({
    children,
    ...options
}: DevicePlatformRedirectProviderProps) => {
    useDevicePlatformRedirect(options);
    return children;
};
