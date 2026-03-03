import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../../components/Common/DynamicVariant';

const modules = import.meta.glob('./*.tsx');

export const Packages = () => {
    const variant = useVariant('packages');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="PackageStyle1"
            featureName="Package"
        />
    );
};
