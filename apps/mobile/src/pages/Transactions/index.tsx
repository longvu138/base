import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';
import { useTransactionsMobilePage } from '@repo/hooks';

const modules = import.meta.glob('./*.tsx');

const TransactionsPage = () => {
    const variant = useVariant('transactions', 'TransactionsStyleDefault');
    const page = useTransactionsMobilePage();

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="TransactionsStyleDefault"
            featureName="Transactions"
            componentProps={{ page }}
        />
    );
};

export default TransactionsPage;
