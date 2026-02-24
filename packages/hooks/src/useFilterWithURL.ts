import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

export interface UseFilterWithURLOptions {
    form: any;
    onFilterChange?: (filters: Record<string, any>) => void;
}

/**
 * URL keys that are NOT filter params — managed by pagination and tab components.
 * These are always preserved when applying or clearing filters.
 */
const NON_FILTER_KEYS = new Set(['page', 'pageSize', 'tab']);

/**
 * List of known array fields that should be deserialized from comma-separated strings.
 */
const ARRAY_FIELDS = new Set(['statuses', 'marketplaces', 'services', 'categories', 'externalTypes']);

/**
 * Serializes form values into URLSearchParams.
 * Handles: arrays → comma-joined, dayjs date ranges → timestampXFrom/To, dayjs singles → ISO string.
 */
function serializeToURL(values: Record<string, any>): URLSearchParams {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (typeof value === 'string' && value === '') return;
        if (Array.isArray(value) && value.length === 0) return;

        // Date range: [dayjs, dayjs] → timestampXFrom + timestampXTo
        if (Array.isArray(value) && value.length === 2 && dayjs.isDayjs(value[0])) {
            const base = key.replace('DateRange', '');
            const capitalized = base.charAt(0).toUpperCase() + base.slice(1);
            params.set(`timestamp${capitalized}From`, value[0].startOf('day').toISOString());
            params.set(`timestamp${capitalized}To`, value[1].endOf('day').toISOString());
            return;
        }

        // Array → comma-joined string
        if (Array.isArray(value)) {
            params.set(key, value.join(','));
            return;
        }

        // Single dayjs → ISO string
        if (dayjs.isDayjs(value)) {
            params.set(key, value.toISOString());
            return;
        }

        params.set(key, String(value));
    });

    return params;
}

/**
 * Deserializes URLSearchParams into form values.
 * Skips NON_FILTER_KEYS. Handles: comma-joined arrays, ISO timestamps, date ranges.
 */
function deserializeFromURL(urlParams: URLSearchParams): Record<string, any> {
    const values: Record<string, any> = {};
    const processedKeys = new Set<string>();

    urlParams.forEach((value, key) => {
        if (processedKeys.has(key)) return;
        if (NON_FILTER_KEYS.has(key)) return;

        // Reconstruct date range pair: timestampXFrom + timestampXTo → xDateRange
        if (key.startsWith('timestamp') && key.endsWith('From')) {
            const base = key.replace('timestamp', '').replace('From', '');
            const toKey = `timestamp${base}To`;
            const toValue = urlParams.get(toKey);

            if (toValue) {
                const formField = base.charAt(0).toLowerCase() + base.slice(1) + 'DateRange';
                values[formField] = [dayjs(value), dayjs(toValue)];
                processedKeys.add(key);
                processedKeys.add(toKey);
                return;
            }
        }

        // Known array fields or comma-containing values → split to array
        if (ARRAY_FIELDS.has(key) || value.includes(',')) {
            values[key] = value.split(',').filter(Boolean);
            return;
        }

        // ISO timestamp string → dayjs
        if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
            values[key] = dayjs(value);
            return;
        }

        values[key] = value;
    });

    return values;
}

/**
 * Builds a clean URLSearchParams that preserves only NON_FILTER_KEYS from prev,
 * then applies new filter params on top.
 */
function buildNextParams(
    prev: URLSearchParams,
    filterParams: URLSearchParams
): URLSearchParams {
    const next = new URLSearchParams();

    // Preserve tab and pageSize, always reset page to 1 on filter change
    const tab = prev.get('tab');
    const pageSize = prev.get('pageSize');
    if (tab) next.set('tab', tab);
    if (pageSize) next.set('pageSize', pageSize);
    next.set('page', '1');

    filterParams.forEach((val, key) => next.set(key, val));

    return next;
}

export const useFilterWithURL = ({ form, onFilterChange }: UseFilterWithURLOptions) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // On mount: restore filter state from URL into the form
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
        setSearchParams(prev => buildNextParams(prev, filterParams));
        onFilterChange?.(values);
    };

    const clearFilters = () => {
        form.resetFields();
        setSearchParams(prev => buildNextParams(prev, new URLSearchParams()));
        onFilterChange?.({});
    };

    const getCurrentFilters = (): Record<string, any> => deserializeFromURL(searchParams);

    return {
        applyFilters,
        clearFilters,
        getCurrentFilters,
        filters: getCurrentFilters(),
    };
};
