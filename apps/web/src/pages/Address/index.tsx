import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../../components/Common/DynamicVariant';

const modules = import.meta.glob('./*.tsx');

export const Address = () => {
    const variant = useVariant('address');
    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="AddressStyle1"
            featureName="Address"
        />
    );
};
