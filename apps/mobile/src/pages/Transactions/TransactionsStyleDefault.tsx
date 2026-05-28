import type { ComponentProps } from 'react';
import { TransactionsMobileView } from './TransactionsShared';

type TransactionsStyleDefaultProps = {
    page: ComponentProps<typeof TransactionsMobileView>['page'];
};

export const TransactionsStyleDefault = ({ page }: TransactionsStyleDefaultProps) => (
    <TransactionsMobileView page={page} />
);
