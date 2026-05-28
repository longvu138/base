import type { ComponentProps } from 'react';
import { TransactionsMobileView } from './TransactionsShared';

type TransactionsStyleThanhlaProps = {
    page: ComponentProps<typeof TransactionsMobileView>['page'];
};

export const TransactionsStyleThanhla = ({ page }: TransactionsStyleThanhlaProps) => (
    <TransactionsMobileView page={page} />
);
