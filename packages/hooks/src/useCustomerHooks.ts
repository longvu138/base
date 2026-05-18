import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryApi, CustomerApi, NotificationApi } from '@repo/api';

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

export const useChangeCustomerPassword = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await CustomerApi.changePassword(payload);
            return res.data;
        },
    });
};

export const useChangeCustomerPin = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await CustomerApi.changePin(payload);
            return res.data;
        },
    });
};

export const useRecoverCustomerPin = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await CustomerApi.recoverPin(payload);
            return res.data;
        },
    });
};

export const useCustomerLevelsQuery = (enabled = true) => {
    return useQuery({
        queryKey: ['customer.levels'],
        queryFn: async () => {
            const res = await CustomerApi.getCustomerLevels();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!localStorage.getItem('access_token') && enabled,
        retry: false,
    });
};

export const useRewardPointTransactionsQuery = (params: any) => {
    return useQuery({
        queryKey: ['customer.reward_point.transactions', params],
        queryFn: async () => {
            const res = await CustomerApi.getRewardPointTransactions(params);
            return {
                data: Array.isArray(res.data) ? res.data : [],
                total: parseInt(res.headers['x-total-count'] || '0', 10),
                pageSize: parseInt(res.headers['x-page-size'] || params?.size || '25', 10),
                current: parseInt(res.headers['x-page-number'] || params?.page || '0', 10),
            };
        },
        enabled: !!params,
    });
};

export const usePurchasingAccountsQuery = () => {
    return useQuery({
        queryKey: ['customer.purchasing_accounts'],
        queryFn: async () => {
            const res = await CustomerApi.getPurchasingAccounts();
            return Array.isArray(res.data) ? res.data : [];
        },
    });
};

export const useCustomerDiscountQuery = (enabled = true) => {
    return useQuery({
        queryKey: ['customer.discounts'],
        queryFn: async () => {
            const res = await CustomerApi.getCustomerDiscount();
            return res.data || {};
        },
        enabled: !!localStorage.getItem('access_token') && enabled,
        retry: false,
    });
};

export const useFeesQuery = (enabled = true) => {
    return useQuery({
        queryKey: ['categories.fees'],
        queryFn: async () => {
            const res = await CategoryApi.getFees();
            const fees = Array.isArray(res.data) ? res.data : [];
            return fees
                .filter((item: any) => !item?.additional)
                .sort((a: any, b: any) => Number(a?.position || 0) - Number(b?.position || 0));
        },
        enabled: !!localStorage.getItem('access_token') && enabled,
        retry: false,
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

export const useCartItemsQuery = (enabled = true) => {
    return useQuery({
        queryKey: ['customer.cart.items'],
        queryFn: async () => {
            const res = await CustomerApi.getCartItems();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!localStorage.getItem('access_token') && enabled,
        retry: false,
    });
};

export const useUpdateCartSkuMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            CustomerApi.updateCartSku(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.cart.items'] });
            queryClient.invalidateQueries({ queryKey: ['customer.cart.statistics'] });
        },
    });
};

export const useDeleteCartSkuMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => CustomerApi.deleteCartSku(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.cart.items'] });
            queryClient.invalidateQueries({ queryKey: ['customer.cart.statistics'] });
        },
    });
};

export const useDeleteCartSkusMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => CustomerApi.deleteCartSkus(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.cart.items'] });
            queryClient.invalidateQueries({ queryKey: ['customer.cart.statistics'] });
        },
    });
};

export const useDeleteCartGroupMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => CustomerApi.deleteCartGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.cart.items'] });
            queryClient.invalidateQueries({ queryKey: ['customer.cart.statistics'] });
        },
    });
};

export const useDeleteAllCartMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => CustomerApi.deleteAllCart(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.cart.items'] });
            queryClient.invalidateQueries({ queryKey: ['customer.cart.statistics'] });
        },
    });
};

export const useImportCartProductsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => CustomerApi.importCartProducts(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.cart.items'] });
            queryClient.invalidateQueries({ queryKey: ['customer.cart.statistics'] });
        },
    });
};

export const useCreateCartProductMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ payload, images }: { payload: any; images: File[] }) =>
            CustomerApi.createCartProduct(payload, images),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.cart.items'] });
            queryClient.invalidateQueries({ queryKey: ['customer.cart.statistics'] });
        },
    });
};

export const useAddCartSkusMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: any) => CustomerApi.addCartSkus(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.cart.items'] });
            queryClient.invalidateQueries({ queryKey: ['customer.cart.statistics'] });
        },
    });
};

export const useThirdPartyLoansQuery = (orderCodes: string, enabled = true) => {
    return useQuery({
        queryKey: ['customer.third_party_loans', orderCodes],
        queryFn: async () => {
            const res = await CustomerApi.getThirdPartyLoans(orderCodes);
            return res.data;
        },
        enabled: !!localStorage.getItem('access_token') && enabled && !!orderCodes,
        retry: false,
    });
};

export const useCurrentExchangeRate = () => {
    return useQuery({
        queryKey: ['categories.exchange_rates.current'],
        queryFn: async () => {
            const res = await CategoryApi.getCurrentExchangeRate();
            return res.data;
        },
        enabled: !!localStorage.getItem('access_token'),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};

export const useDepositQrQuery = (amount?: number | string, enabled = false) => {
    return useQuery({
        queryKey: ['customer.deposit.qr', amount],
        queryFn: async () => {
            const res = await CategoryApi.getDepositQr(amount as number | string);
            return res.data;
        },
        enabled: !!localStorage.getItem('access_token') && enabled && amount !== undefined && amount !== null && amount !== '',
        retry: false,
    });
};

export const useNavigationMenus = () => {
    return useQuery({
        queryKey: ['categories.navigation_menus'],
        queryFn: async () => {
            const res = await CategoryApi.getNavigationMenus();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!localStorage.getItem('access_token'),
        staleTime: 10 * 60 * 1000,
        retry: false,
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

export const useNotificationChannelsQuery = (enabled = false) => {
    return useQuery({
        queryKey: ['customer.notifications.channels'],
        queryFn: async () => {
            const res = await NotificationApi.getChannels();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!localStorage.getItem('access_token') && enabled,
        retry: false,
    });
};

export const useNotificationEventsQuery = (enabled = false) => {
    return useQuery({
        queryKey: ['customer.notifications.events'],
        queryFn: async () => {
            const res = await NotificationApi.getEvents();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!localStorage.getItem('access_token') && enabled,
        retry: false,
    });
};

export const useNotificationEventSettingsQuery = (enabled = false) => {
    return useQuery({
        queryKey: ['customer.notifications.event_settings'],
        queryFn: async () => {
            const res = await NotificationApi.getEventSettings();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!localStorage.getItem('access_token') && enabled,
        retry: false,
    });
};

export const useNotificationSettingsQuery = (enabled = false) => {
    return useQuery({
        queryKey: ['customer.notifications.settings'],
        queryFn: async () => {
            const res = await NotificationApi.getNotificationSettings();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!localStorage.getItem('access_token') && enabled,
        retry: false,
    });
};

export const useUpdateNotificationSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Record<string, any>) => {
            const res = await NotificationApi.updateNotificationSetting(data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.notifications.settings'] });
        },
    });
};

export const useUpdateNotificationSettingsBatch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Record<string, any>) => {
            const res = await NotificationApi.updateNotificationSettingsBatch(data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer.notifications.settings'] });
        },
    });
};

export const useConnectTelegramMutation = () => {
    return useMutation({
        mutationFn: async (telegramUsername: string) => {
            const res = await NotificationApi.connectTelegram(telegramUsername);
            return res.data;
        },
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
