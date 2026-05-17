import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const modules = import.meta.glob('./*.tsx');

const WithdrawalSlipsPage = () => {
    const variant = useVariant('withdrawalSlips', 'WithdrawalSlipsStyleDefault');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="WithdrawalSlipsStyleDefault"
            featureName="WithdrawalSlips"
        />
    );
};

export default WithdrawalSlipsPage;
