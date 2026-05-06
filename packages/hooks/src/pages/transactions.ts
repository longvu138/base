import { useMemo } from 'react';
import { 
    useListTransactionQuery, 
    useTransactionTypesQuery, 
    useWalletAccountsQuery 
} from '../useTransactionHooks';

export interface UseTransactionsLogicProps {
    accountId?: string;
    page: number;
    pageSize: number;
    filters: Record<string, any>;
}

/**
 * Shared logic for Transactions Page
 */
export const useTransactionsLogic = ({ accountId, page, pageSize, filters }: UseTransactionsLogicProps) => {
    // 1. Format params for API
    const apiParams = useMemo(() => {
        const params: Record<string, any> = {
            page: page - 1,
            size: pageSize,
            ...filters
        };

        // Transform array to comma-separated string
        if (Array.isArray(params.externalTypes)) {
            params.externalTypes = params.externalTypes.join(',');
        }

        // Transform dates to ISO strings
        if (params.nominalTimestampFrom) {
            params.nominalTimestampFrom = params.nominalTimestampFrom.startOf('day').toISOString();
        }
        if (params.nominalTimestampTo) {
            params.nominalTimestampTo = params.nominalTimestampTo.endOf('day').toISOString();
        }

        return params;
    }, [filters, page, pageSize]);

    // 2. Fetch data
    const { data: walletAccounts, isLoading: isLoadingAccounts } = useWalletAccountsQuery();
    const { data: transactionData, isLoading: isTransactionLoading } = useListTransactionQuery(accountId, apiParams);
    const { data: transactionTypes } = useTransactionTypesQuery();

    // 3. Derived State
    const defaultAccount = useMemo(() => 
        walletAccounts?.find((acc: any) => acc.isDefault) || walletAccounts?.[0]
    , [walletAccounts]);

    const transactionTypeOptions = useMemo(() => {
        if (!transactionTypes) return [];
        return transactionTypes.map((type: any) => ({
            label: type.name,
            value: type.code,
        }));
    }, [transactionTypes]);

    return {
        walletAccounts,
        isLoadingAccounts,
        transactionData,
        isTransactionLoading,
        transactionTypes,
        defaultAccount,
        transactionTypeOptions,
        apiParams
    };
};
