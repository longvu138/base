import { useState } from 'react';
import { Radio } from 'antd';
import { LayoutDashboard, Columns } from 'lucide-react';
import { AlternativeStyle } from './AlternativeStyle';
import { LightStyle } from './LightStyle';


const DASHBOARD_DATA = {
    user: {
        name: "DOAN DUYEN",
        balance: 100100000
    },
    stats: {

        purchased: { count: 30, value: 823850000 },
        delivered: { count: 41, value: 55500000 },
        shipping: { count: 12, items: 45 },
        ready: { count: 3, items: 3, debt: 35000000 },


        initialize: 5,
        deposited: 1139,
        arrived: 69,
        delivering: 5,
        received: 1240,
        cancelled: 2
    }
};

export const Dashboard = () => {
    const [style, setStyle] = useState<'style1' | 'style2'>('style1');

    return (
        <div className="relative min-h-screen bg-layout">

            <div className="absolute top-4 right-4 z-10">
                <Radio.Group
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    size="small"
                    buttonStyle="solid"
                >
                    <Radio.Button value="style1">
                        <span className="flex items-center gap-1">
                            <LayoutDashboard size={14} /> Giao diện 1
                        </span>
                    </Radio.Button>
                    <Radio.Button value="style2">
                        <span className="flex items-center gap-1">
                            <Columns size={14} /> Giao diện 2
                        </span>
                    </Radio.Button>
                </Radio.Group>
            </div>


            {style === 'style1' ? (
                <LightStyle data={DASHBOARD_DATA} />
            ) : (
                <AlternativeStyle data={DASHBOARD_DATA} />
            )}
        </div>
    );
};
