import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../../components/Common/DynamicVariant';

const modules = import.meta.glob('./*.tsx');

const WithdrawalSlipsPage = () => {
    const variant = useVariant('withdrawalSlips');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="WithdrawalSlipStyle1"
            featureName="WithdrawalSlips"
        />
    );
};

export default WithdrawalSlipsPage;
