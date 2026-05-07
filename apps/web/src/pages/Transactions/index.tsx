import React from 'react';
import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

// Stable reference — must be outside component to prevent useMemo invalidation
const modules = import.meta.glob('./*.tsx');

export const Transactions: React.FC = () => {
    const variant = useVariant('transactions');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="TransactionsStyle1"
            featureName="Transactions"
        />
    );
};
