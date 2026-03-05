import { ApiClient } from '@repo/util';

/**
 * ChatApi — generic comment API dùng cho mọi entity
 * Pattern: customer/{entityType}/{entityCode}/comments
 * Hiện hỗ trợ: orders, shipments, peerpayments, ...
 */
export const ChatApi = {
    getComments: (entityType: string, entityCode: string, params?: Record<string, any>) => {
        return ApiClient.auth.get(`customer/${entityType}/${entityCode}/comments`, {
            params: {
                sort: 'timestamp:DESC',
                page: 0,
                size: 25,
                ...params,
            },
        });
    },

    createComment: (entityType: string, entityCode: string, payload: { comment: string }) => {
        // Gửi JSON: Đổi key 'comment' thành 'content' theo đúng backend Gobiz
        return ApiClient.auth.post(`customer/${entityType}/${entityCode}/comments`, {
            content: payload.comment || '',
        });
    },

    uploadAttachment: (file: File, entityType: string, entityCode: string) => {
        const formData = new FormData();
        formData.append('attachment', file);

        const moduleMap: Record<string, string> = {
            'orders': 'CUSTOMER_ORDER_MODULE',
            'shipments': 'CUSTOMER_SHIPMENT_MODULE',
        };

        const command = {
            module: moduleMap[entityType] || 'CUSTOMER_ORDER_MODULE',
            thread: entityCode,
        };

        formData.append('command', new Blob([JSON.stringify(command)], { type: 'application/json' }));

        return ApiClient.auth.post(`customer/comments/attachments`, formData, {
            headers: { 'Content-Type': undefined }
        });
    },
};
