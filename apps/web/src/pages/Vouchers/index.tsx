import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../../components/Common/DynamicVariant';

const modules = import.meta.glob('./*.tsx');

export const Vouchers = () => {
    const variant = useVariant('vouchers');
    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="VouchersStyle1"
            featureName="Vouchers"
        />
    );
};
