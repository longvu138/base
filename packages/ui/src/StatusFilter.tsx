import React from 'react';
import { Tag, Space } from 'antd';

const { CheckableTag } = Tag;

export interface StatusItem {
    label: string;
    value: string;
    count?: number;
}

export interface StatusFilterProps {
    value?: string[];
    onChange?: (value: string[]) => void;
    options: StatusItem[];
    label?: string;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
    value = [],
    onChange,
    options,
    label = "Trạng thái:"
}) => {
    const handleChange = (statusValue: string, checked: boolean) => {
        const nextSelectedTags = checked
            ? [...value, statusValue]
            : value.filter((t) => t !== statusValue);
        onChange?.(nextSelectedTags);
    };

    return (
        <div className="flex items-start gap-3 py-2">
            {label && (
                <span className="text-sm whitespace-nowrap text-primary min-w-fit">
                    {label}
                </span>
            )}
            <Space wrap size={[4, 8]}>
                {options.map((item) => (
                    <CheckableTag
                        key={item.value}
                        checked={value.includes(item.value)}
                        onChange={(checked) => handleChange(item.value, checked)}
                        className="border border-solid border-gray-200"
                    >
                        {item.label}
                        {item.count !== undefined && (
                            <span className="ml-1 opacity-50 text-[11px]">
                                ({item.count})
                            </span>
                        )}
                    </CheckableTag>
                ))}
            </Space>
        </div>
    );
};
