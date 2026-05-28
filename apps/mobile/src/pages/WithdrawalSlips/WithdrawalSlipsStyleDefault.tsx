import type { ComponentProps } from 'react';
import { WithdrawalSlipsMobileView } from './WithdrawalSlipsShared';

type WithdrawalSlipsStyleDefaultProps = {
    page: ComponentProps<typeof WithdrawalSlipsMobileView>['page'];
};

export const WithdrawalSlipsStyleDefault = ({ page }: WithdrawalSlipsStyleDefaultProps) => (
    <WithdrawalSlipsMobileView page={page} />
);
