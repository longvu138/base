import React from 'react';
import { Tabs } from 'antd';
import { HistoryOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { TransactionHistoryPanel } from './TransactionHistoryPanel';
import { WithdrawalSlipStyle3 } from '../WithdrawalSlips/WithdrawalSlipStyle3';

/**
 * TransactionsStyle3 — Trang "Giao dịch" dành cho Gobiz (gd3)
 *
 * Gom Lịch sử giao dịch + Yêu cầu rút tiền thành 2 tabs.
 * Tab "Lịch sử giao dịch" nằm trước.
 */
export const TransactionsStyle3: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'history';

    const handleTabChange = (key: string) => {
        setSearchParams({ tab: key }, { replace: true });
    };

    const items = [
        {
            key: 'history',
            label: (
                <span className="flex items-center gap-2 px-4 py-1">
                    <HistoryOutlined />
                    Lịch sử giao dịch
                </span>
            ),
            children: <TransactionHistoryPanel isTabView={true} />,
        },
        {
            key: 'withdrawal',
            label: (
                <span className="flex items-center gap-2 px-4 py-1">
                    <CreditCardOutlined />
                    Yêu cầu rút tiền
                </span>
            ),
            children: <WithdrawalSlipStyle3 isTabView={true} />,
        },
    ];

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6 pt-2">
            <div className="mb-2">
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                    Giao dịch
                </h1>
            </div>

            <Tabs
                activeKey={activeTab}
                items={items}
                onChange={handleTabChange}
                type="line"
                size="large"
            />
        </div>
    );
};
