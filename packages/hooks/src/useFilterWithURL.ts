import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

export interface UseFilterWithURLOptions {
    form: any;
    onFilterChange?: (filters: Record<string, any>) => void;
}

export const useFilterWithURL = ({ form, onFilterChange }: UseFilterWithURLOptions) => {
    const [searchParams, setSearchParams] = useSearchParams();


    const serializeToURL = (values: Record<string, any>): URLSearchParams => {
        const params = new URLSearchParams();

        Object.entries(values).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (value === '' && typeof value === 'string') return;
            if (Array.isArray(value) && value.length === 0) return;


            if (Array.isArray(value) && value.length === 2 && dayjs.isDayjs(value[0])) {
                const fieldName = key.replace('DateRange', '');
                const capitalField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                params.set(`timestamp${capitalField}From`, value[0].startOf('day').toISOString());
                params.set(`timestamp${capitalField}To`, value[1].endOf('day').toISOString());
                return;
            }


            if (Array.isArray(value)) {
                params.set(key, value.join(','));
                return;
            }


            if (dayjs.isDayjs(value)) {
                params.set(key, value.toISOString());
                return;
            }


            params.set(key, String(value));
        });

        return params;
    };


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


            const arrayFields = ['statuses', 'marketplaces', 'services', 'categories', 'externalTypes'];
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


    useEffect(() => {
        const filters = deserializeFromURL(searchParams);
        if (Object.keys(filters).length > 0) {
            form.setFieldsValue(filters);
            onFilterChange?.(filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const applyFilters = (values: Record<string, any>) => {
        const filterParams = serializeToURL(values);

        setSearchParams(prev => {
            const newParams = new URLSearchParams();


            const currentPageSize = prev.get('pageSize') || '20';


            filterParams.forEach((val, key) => {
                newParams.set(key, val);
            });


            newParams.set('page', '1');
            newParams.set('pageSize', currentPageSize);

            return newParams;
        });

        onFilterChange?.(values);
    };


    const clearFilters = () => {
        form.resetFields();

        setSearchParams(prev => {
            const newParams = new URLSearchParams();


            const currentPageSize = prev.get('pageSize') || '20';


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
