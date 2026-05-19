import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Form, Button } from 'antd';
import type { FilterPanelProps } from './types';

function isPlainObject(obj: any): boolean {
    if (typeof obj !== 'object' || obj === null) return false;
    const proto = Object.getPrototypeOf(obj);
    return proto === null || proto === Object.prototype;
}

function trimStringValues(obj: any): any {
    if (typeof obj === 'string') {
        return obj.trim();
    }
    if (Array.isArray(obj)) {
        return obj.map(item => trimStringValues(item));
    }
    if (obj !== null && typeof obj === 'object' && isPlainObject(obj)) {
        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = trimStringValues(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

export function FilterPanel({
    children,
    primaryContent,
    secondaryContent,
    form,
    onSearch,
    onReset,
    showCollapseAll = false,
    searchText = "Tìm kiếm",
    resetText = "Làm mới bộ lọc",
    loading = false
}: FilterPanelProps): any {
    const [collapsed, setCollapsed] = useState(true);

    const handleSubmit = () => {
        let trimmedValues: any = undefined;
        if (form) {
            const values = form.getFieldsValue();
            trimmedValues = trimStringValues(values);
            form.setFieldsValue(trimmedValues);
        }
        onSearch?.(trimmedValues);
    };

    return (
        <Form form={form} colon={false} layout="vertical" onFinish={handleSubmit}>
            <div className="flex flex-col gap-4">
                <div className="">
                    {primaryContent}

                    {!collapsed && secondaryContent}

                    {!primaryContent && !secondaryContent && (
                        <>
                            {!collapsed && children}
                        </>
                    )}
                </div>

                <div className='flex justify-between items-center'>
                    {showCollapseAll && (
                        <span
                            onClick={() => setCollapsed(!collapsed)}
                            className='flex gap-2 items-center cursor-pointer'
                        >
                            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            {collapsed ? 'Mở rộng' : 'Thu gọn'}
                        </span>
                    )}
                    {!showCollapseAll && <div />}
                    <div className="flex gap-3">
                        <Button
                            onClick={onReset}
                            disabled={loading}
                        >
                            {resetText}
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {searchText}
                        </Button>
                    </div>
                </div>
            </div>
        </Form>
    );
}
