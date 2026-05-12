import { ApiClient } from '@repo/util';

export type ChatMode = 'legacy' | 'posedon';

const moduleMap: Record<string, string> = {
    orders: 'CUSTOMER_ORDER_MODULE',
    shipments: 'CUSTOMER_SHIPMENT_MODULE',
};

const entityPath = (entityType: string, entityCode: string, mode: ChatMode) => {
    if (mode === 'posedon' && entityType === 'orders') {
        return `customer/comments/orders/${entityCode}`;
    }
    return `customer/${entityType}/${entityCode}/comments`;
};

/**
 * ChatApi — generic comment API dùng cho mọi entity
 * Pattern: customer/{entityType}/{entityCode}/comments
 * Hiện hỗ trợ: orders, shipments, peerpayments, ...
 */
export const ChatApi = {
    getComments: (entityType: string, entityCode: string, params?: Record<string, any>, mode: ChatMode = 'legacy') => {
        return ApiClient.auth.get(entityPath(entityType, entityCode, mode), {
            params: {
                sort: mode === 'posedon' ? 'createdAt:DESC' : 'timestamp:DESC',
                page: 0,
                size: 25,
                ...params,
            },
        });
    },

    createComment: (entityType: string, entityCode: string, payload: { comment: string }, mode: ChatMode = 'legacy') => {
        const content = payload.comment || '';

        if (mode === 'posedon' && entityType === 'orders') {
            return ApiClient.auth.post(entityPath(entityType, entityCode, mode), { content });
        }

        const formData = new FormData();
        formData.append('comment', new Blob([JSON.stringify({ content })], { type: 'application/json' }));
        return ApiClient.auth.post(entityPath(entityType, entityCode, mode), formData, {
            headers: { 'Content-Type': undefined },
        });
    },

    createCommentWithAttachments: (
        entityType: string,
        entityCode: string,
        payload: { comment?: string; files: File[] },
        mode: ChatMode = 'legacy',
    ) => {
        const formData = new FormData();
        payload.files.forEach((file) => {
            formData.append('attachments', new Blob([file]), file.name);
        });
        if (payload.comment) {
            formData.append('comment', new Blob([JSON.stringify({ content: payload.comment })], { type: 'application/json' }));
        }

        return ApiClient.auth.post(entityPath(entityType, entityCode, mode), formData, {
            headers: { 'Content-Type': undefined },
        });
    },

    uploadAttachment: (file: File, entityType: string, entityCode: string) => {
        const formData = new FormData();
        formData.append('attachment', file);

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
