import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerApi, NotificationApi } from '@repo/api';

const NOTIFICATION_PAGE_SIZE = 25;

export const useCustomerProfile = () => {
    return useQuery({
        queryKey: ['customer.profile'],
        queryFn: async () => {
            const res = await CustomerApi.getProfile();
            return res.data;
        },
        enabled: !!localStorage.getItem('access_token'),
    });
};

export const useUpdateCustomerProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await CustomerApi.updateProfile(payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.profile'] });
        },
    });
};

export const useCustomerBalance = () => {
    return useQuery({
        queryKey: ['customer.balance'],
        queryFn: async () => {
            const res = await CustomerApi.getBalance();
            return res.data;
        },
        enabled: !!localStorage.getItem('access_token'),
        refetchInterval: 60000, // Refetch balance every minute
    });
};

export const useTotalSkusInCart = () => {
    return useQuery({
        queryKey: ['customer.cart.statistics'],
        queryFn: async () => {
            const res = await CustomerApi.getTotalSkusInCart();
            return res.data;
        },
        enabled: !!localStorage.getItem('access_token'),
    });
};

export const useNotificationUnreadCount = () => {
    return useQuery({
        queryKey: ['customer.notifications.unread_count'],
        queryFn: async () => {
            const res = await NotificationApi.getUnreadCount();
            const unreadCount = res.data;

            if (typeof unreadCount === 'number') return unreadCount;
            if (typeof unreadCount === 'string') return Number(unreadCount) || 0;
            if (typeof unreadCount?.ALL === 'number') return unreadCount.ALL;

            return 0;
        },
        enabled: !!localStorage.getItem('access_token'),
        refetchInterval: 60000,
        retry: false,
    });
};

export const useNotifications = (params: { groupCode?: string; enabled?: boolean } = {}) => {
    return useInfiniteQuery({
        queryKey: ['customer.notifications', params.groupCode || 'all'],
        initialPageParam: 0,
        queryFn: async ({ pageParam }) => {
            const res = await NotificationApi.getNotifications({
                offset: pageParam * NOTIFICATION_PAGE_SIZE,
                limit: NOTIFICATION_PAGE_SIZE + 1,
                groupCode: params.groupCode,
                sort: 'publishDate:desc',
            });

            const items = Array.isArray(res.data) ? res.data : [];

            return {
                items: items.slice(0, NOTIFICATION_PAGE_SIZE),
                nextPage: items.length > NOTIFICATION_PAGE_SIZE ? pageParam + 1 : undefined,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        enabled: !!localStorage.getItem('access_token') && !!params.enabled,
        retry: false,
    });
};

export const useNotificationEventGroups = (enabled = false) => {
    return useQuery({
        queryKey: ['customer.notifications.event_groups'],
        queryFn: async () => {
            const res = await NotificationApi.getEventGroups();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!localStorage.getItem('access_token') && enabled,
        retry: false,
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string | number) => {
            const res = await NotificationApi.markAsRead(id);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.notifications'] });
            queryClient.invalidateQueries({ queryKey: ['customer.notifications.unread_count'] });
        },
    });
};

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await NotificationApi.markAllAsRead();
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.notifications'] });
            queryClient.invalidateQueries({ queryKey: ['customer.notifications.unread_count'] });
        },
    });
};
