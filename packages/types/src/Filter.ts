import React from 'react';

export interface FieldSerializer {
    serialize?: (value: any) => string | null;
    deserialize?: (value: string) => any;
}

export interface UseFilterWithURLConfig {
    fieldSerializers?: Record<string, FieldSerializer>;
    defaultValues?: Record<string, any>;
    onParamsChange?: (values: Record<string, any>) => void;
}

export interface FilterPanelProps {
    children?: React.ReactNode;
    primaryContent?: React.ReactNode;
    secondaryContent?: React.ReactNode;
    form: any;
    onSearch: (values: any) => void;
    onReset?: () => void;
    showCollapseAll?: boolean;
    searchText?: string;
    resetText?: string;
    loading?: boolean;
}

export interface StatusTagGroupProps {
    value?: string[];
    onChange?: (value: string[]) => void;
    statuses?: StatusOption[];
}

export interface StatusTabsProps {
    name?: string;
    value?: string[];
    statuses?: StatusOption[];
    onChange?: (value: string[]) => void;
}

export interface StatusOption {
    label: string;
    value: string;
    count?: string | number;
}
