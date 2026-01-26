import { useState } from 'react';
import { Radio } from 'antd';
import { LayoutList, Sidebar } from 'lucide-react';
import { OrdersStyle1 } from './OrdersStyle1';
import { OrdersStyle2 } from './OrdersStyle2';

export const Orders = () => {
    const [style, setStyle] = useState<'style1' | 'style2'>('style1');

    return (
        <div className="min-h-screen bg-layout">
            <div className="flex justify-end px-6 pt-6">
                <Radio.Group
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    size="small"
                >
                    <Radio.Button value="style1">
                        <div className="flex items-center gap-1">
                            <LayoutList size={14} /> Giao diện 1
                        </div>
                    </Radio.Button>
                    <Radio.Button value="style2">
                        <div className="flex items-center gap-1">
                            <Sidebar size={14} /> Giao diện 2
                        </div>
                    </Radio.Button>
                </Radio.Group>
            </div>

            <div className="p-6 pt-2">
                {style === 'style1' ? <OrdersStyle1 /> : <OrdersStyle2 />}
            </div>
        </div>
    );
};
