import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';
import { useWithdrawalSlipsMobilePage } from '@repo/hooks';

const modules = import.meta.glob('./*.tsx');

const WithdrawalSlipsPage = () => {
    const variant = useVariant('withdrawalSlips', 'WithdrawalSlipsStyleDefault');
    const page = useWithdrawalSlipsMobilePage();

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="WithdrawalSlipsStyleDefault"
            featureName="WithdrawalSlips"
            componentProps={{ page }}
        />
    );
};

export default WithdrawalSlipsPage;
