import type { ComponentProps } from 'react';
import { WithdrawalSlipsMobileView } from './WithdrawalSlipsShared';

type WithdrawalSlipsStyleGobizProps = {
    page: ComponentProps<typeof WithdrawalSlipsMobileView>['page'];
};

export const WithdrawalSlipsStyleGobiz = ({ page }: WithdrawalSlipsStyleGobizProps) => (
    <WithdrawalSlipsMobileView page={page} />
);
