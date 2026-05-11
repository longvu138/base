
import { Tag } from 'antd';

export interface StatusProps {
    status: string;
    statuses?: any[];
}

export function Status({ status, statuses = [] }: StatusProps): any {
    const statusConfig = statuses.find(s => s.code === status || s.value === status);
    const label = statusConfig?.name || statusConfig?.label || status;

    const colorMap: Record<string, string> = {
        'PENDING': 'warning',
        'PROCESSING': 'processing',
        'COMPLETED': 'success',
        'CANCELLED': 'error',
    };

    return (
        <Tag style={{ padding: "2px 12px", borderRadius: "16px", marginRight: 0 }} color={colorMap[status] || statusConfig?.color || 'default'}>
            {label}
        </Tag>
    );
}
