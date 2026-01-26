import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Form, Button } from 'antd';
import type { FilterPanelProps } from './types';

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

    return (
        <div className="flex flex-col gap-4">
            <div className="">
                <Form form={form} colon={false} layout='vertical'>

                    {primaryContent}


                    {!collapsed && secondaryContent}


                    {!primaryContent && !secondaryContent && (
                        <>
                            {!collapsed && children}
                        </>
                    )}
                </Form>
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
                        onClick={onSearch}
                        loading={loading}
                    >
                        {searchText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
