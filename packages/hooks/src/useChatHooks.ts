import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatApi } from '@repo/api';
import type { ChatMode } from '@repo/api';

/**
 * useChatComments — generic hook lấy comments của bất kỳ entity nào.
 * @param entityType  'orders' | 'shipments' | 'peerpayments' | ...
 * @param entityCode  mã entity, ví dụ 'BG00W5F'
 */
export const useChatCommentsQuery = (entityType: string, entityCode: string, mode: ChatMode = 'legacy') => {
    return useInfiniteQuery({
        queryKey: ['chat.comments', entityType, entityCode, mode],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const [res, attachmentRes] = await Promise.all([
                ChatApi.getComments(entityType, entityCode, { page: pageParam }, mode),
                ChatApi.getAttachments(entityType, entityCode, mode),
            ]);
            const attachments = Array.isArray(attachmentRes.data) ? attachmentRes.data : [];
            const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

            return {
                data: data.map((item: any) => ({
                    ...item,
                    attachments: item.attachments ?? attachments.filter((attachment: any) => attachment?.messageId === item?.id),
                })),
                page: Number(res.headers?.['x-page-number'] ?? pageParam),
                pageCount: Number(res.headers?.['x-page-count'] ?? 1),
                size: Number(res.headers?.['x-page-size'] ?? 25),
                total: Number(res.headers?.['x-total-count'] ?? 0),
            };
        },
        enabled: !!entityType && !!entityCode,
        refetchInterval: 15000,
        getNextPageParam: (lastPage) =>
            lastPage.page + 1 < lastPage.pageCount ? lastPage.page + 1 : undefined,
    });
};

/**
 * useCreateChatComment — generic hook gửi comment cho bất kỳ entity nào.
 */
export const useCreateChatCommentMutation = (entityType: string, entityCode: string, mode: ChatMode = 'legacy') => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { comment: string }) =>
            ChatApi.createComment(entityType, entityCode, payload, mode),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['chat.comments', entityType, entityCode, mode],
            });
        },
    });
};

export const useCreateChatCommentWithAttachmentsMutation = (
    entityType: string,
    entityCode: string,
    mode: ChatMode = 'legacy',
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { comment?: string; files: File[] }) =>
            ChatApi.createCommentWithAttachments(entityType, entityCode, payload, mode),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['chat.comments', entityType, entityCode, mode],
            });
        },
    });
};

/**
 * useUploadChatAttachment — hook upload file lẻ.
 */
export const useUploadChatAttachmentMutation = (entityType: string, entityCode: string) => {
    return useMutation({
        mutationFn: (file: File) => ChatApi.uploadAttachment(file, entityType, entityCode),
    });
};
