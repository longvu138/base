import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatApi } from '@repo/api';

/**
 * useChatComments — generic hook lấy comments của bất kỳ entity nào.
 * @param entityType  'orders' | 'shipments' | 'peerpayments' | ...
 * @param entityCode  mã entity, ví dụ 'BG00W5F'
 */
export const useChatCommentsQuery = (entityType: string, entityCode: string) => {
    return useQuery({
        queryKey: ['chat.comments', entityType, entityCode],
        queryFn: async () => {
            const res = await ChatApi.getComments(entityType, entityCode);
            // API trả về array hoặc { data: [] }
            return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        },
        enabled: !!entityType && !!entityCode,
        refetchInterval: 15000,
    });
};

/**
 * useCreateChatComment — generic hook gửi comment cho bất kỳ entity nào.
 */
export const useCreateChatCommentMutation = (entityType: string, entityCode: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { comment: string }) =>
            ChatApi.createComment(entityType, entityCode, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['chat.comments', entityType, entityCode],
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
