import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

export interface UseFilterWithURLOptions {
    form: any;
    onFilterChange?: (filters: Record<string, any>) => void;
}

export const useFilterWithURL = ({ form, onFilterChange }: UseFilterWithURLOptions) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1️⃣ SERIALIZE: Form values -> URL params
    const serializeToURL = (values: Record<string, any>): URLSearchParams => {
        const params = new URLSearchParams();

        Object.entries(values).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (value === '' && typeof value === 'string') return;
            if (Array.isArray(value) && value.length === 0) return;

            // Handle date ranges
            if (Array.isArray(value) && value.length === 2 && dayjs.isDayjs(value[0])) {
                const fieldName = key.replace('DateRange', '');
                const capitalField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                params.set(`timestamp${capitalField}From`, value[0].startOf('day').toISOString());
                params.set(`timestamp${capitalField}To`, value[1].endOf('day').toISOString());
                return;
            }

            // Handle arrays
            if (Array.isArray(value)) {
                params.set(key, value.join(','));
                return;
            }

            // Handle dates
            if (dayjs.isDayjs(value)) {
                params.set(key, value.toISOString());
                return;
            }

            // Handle others
            params.set(key, String(value));
        });

        return params;
    };

    // 2️⃣ DESERIALIZE: URL params -> Form values
    const deserializeFromURL = (urlParams: URLSearchParams): Record<string, any> => {
        const values: Record<string, any> = {};
        const processedKeys = new Set<string>();

        urlParams.forEach((value, key) => {
            if (processedKeys.has(key)) return;
            if (key === 'page' || key === 'pageSize') return;

            if (key.startsWith('timestamp') && key.endsWith('From')) {
                const baseKey = key.replace('timestamp', '').replace('From', '');
                const toKey = `timestamp${baseKey}To`;
                const toValue = urlParams.get(toKey);

                if (toValue) {
                    const formFieldName = baseKey.charAt(0).toLowerCase() + baseKey.slice(1) + 'DateRange';
                    values[formFieldName] = [dayjs(value), dayjs(toValue)];
                    processedKeys.add(key);
                    processedKeys.add(toKey);
                    return;
                }
            }

            // Danh sách các field luôn là array (Checkbox.Group, Select mode="multiple")
            const arrayFields = ['statuses', 'marketplaces', 'services', 'categories'];
            if (arrayFields.includes(key) || value.includes(',')) {
                values[key] = value.split(',').filter(Boolean);
                return;
            }

            if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
                values[key] = dayjs(value);
                return;
            }

            values[key] = value;
        });

        return values;
    };

    // 3️⃣ LOAD filters từ URL khi mount
    useEffect(() => {
        const filters = deserializeFromURL(searchParams);
        if (Object.keys(filters).length > 0) {
            form.setFieldsValue(filters);
            onFilterChange?.(filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 4️⃣ APPLY filters (Atomic update: Filters + Page 1)
    const applyFilters = (values: Record<string, any>) => {
        const filterParams = serializeToURL(values);

        setSearchParams(prev => {
            const newParams = new URLSearchParams();

            // Giữ lại pageSize của user (nếu có)
            const currentPageSize = prev.get('pageSize') || '20';

            // Set filter params
            filterParams.forEach((val, key) => {
                newParams.set(key, val);
            });

            // ✅ QUAN TRỌNG: Luôn reset về page 1 khi apply filter mới
            newParams.set('page', '1');
            newParams.set('pageSize', currentPageSize);

            return newParams;
        });

        onFilterChange?.(values);
    };

    // 5️⃣ CLEAR filters (Atomic update: Clear + Page 1)
    const clearFilters = () => {
        form.resetFields();

        setSearchParams(prev => {
            const newParams = new URLSearchParams();

            // Giữ lại pageSize
            const currentPageSize = prev.get('pageSize') || '20';

            // ✅ Reset về page 1 và giữ pageSize
            newParams.set('page', '1');
            newParams.set('pageSize', currentPageSize);

            return newParams;
        });

        onFilterChange?.({});
    };

    const getCurrentFilters = (): Record<string, any> => {
        return deserializeFromURL(searchParams);
    };

    return {
        applyFilters,
        clearFilters,
        getCurrentFilters,
        filters: getCurrentFilters()
    };
};
