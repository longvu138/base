import type { ComponentProps } from 'react';
import { TransactionsMobileView } from './TransactionsShared';

type TransactionsStyleGobizProps = {
    page: ComponentProps<typeof TransactionsMobileView>['page'];
};

export const TransactionsStyleGobiz = ({ page }: TransactionsStyleGobizProps) => (
    <TransactionsMobileView page={page} />
);
